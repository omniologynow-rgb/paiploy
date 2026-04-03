import stripe
import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import FailedPayment, ConnectedAccount, PaymentStatus, FailureCode
from app.config import get_settings
from app.tasks import create_initial_retry

logger = logging.getLogger(__name__)
settings = get_settings()

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    # Verify webhook signature
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        logger.error("Invalid webhook payload")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid webhook signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    data = event["data"]["object"]

    # Idempotency: check if we've already processed this event
    event_id = event.get("id")

    # Get the connected account from the event (for Connect webhooks)
    stripe_account_id = event.get("account")

    try:
        if event_type == "invoice.payment_failed":
            await handle_payment_failed(data, stripe_account_id, db)

        elif event_type == "invoice.payment_succeeded":
            await handle_payment_succeeded(data, db)

        elif event_type == "customer.subscription.deleted":
            await handle_subscription_deleted(data, db)

        elif event_type == "payment_method.updated":
            await handle_payment_method_updated(data, stripe_account_id, db)

        elif event_type == "customer.source.expiring":
            logger.info(f"Card expiring for customer {data.get('customer')}")

        elif event_type in ("charge.failed", "payment_intent.payment_failed"):
            logger.info(f"Charge/PI failed: {data.get('id')}")

        elif event_type in ("checkout.session.completed", "invoice.paid"):
            # Paiploy's own billing events (user subscriptions)
            logger.info(f"Paiploy billing event: {event_type} - {data.get('id')}")

        else:
            logger.info(f"Unhandled webhook event: {event_type}")

    except Exception as e:
        logger.error(f"Error processing webhook {event_type}: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing error")

    return {"status": "success"}


async def handle_payment_failed(data: dict, stripe_account_id: str, db: Session):
    """Handle invoice.payment_failed — create a FailedPayment record and start recovery."""
    invoice_id = data.get("id")
    customer_id = data.get("customer")
    subscription_id = data.get("subscription")
    amount_due = data.get("amount_due")
    currency = data.get("currency", "usd")
    customer_email = data.get("customer_email")
    customer_name = data.get("customer_name")

    last_payment_error = data.get("last_payment_error", {})
    failure_code = last_payment_error.get("code", "other") if last_payment_error else "other"
    failure_message = last_payment_error.get("message", "Payment failed") if last_payment_error else "Payment failed"

    failure_code_enum = FailureCode.OTHER
    if "card_declined" in failure_code:
        failure_code_enum = FailureCode.CARD_DECLINED
    elif "insufficient_funds" in failure_code:
        failure_code_enum = FailureCode.INSUFFICIENT_FUNDS
    elif "expired_card" in failure_code:
        failure_code_enum = FailureCode.EXPIRED_CARD
    elif "authentication_required" in failure_code:
        failure_code_enum = FailureCode.AUTHENTICATION_REQUIRED

    # Match by connected Stripe account ID — not just first active account
    account = None
    if stripe_account_id:
        account = db.query(ConnectedAccount).filter(
            ConnectedAccount.stripe_account_id == stripe_account_id,
            ConnectedAccount.is_active == True
        ).first()

    if not account:
        logger.warning(f"No connected account found for Stripe account {stripe_account_id}")
        return

    # Idempotency: check if we already have this invoice
    existing = db.query(FailedPayment).filter(
        FailedPayment.stripe_invoice_id == invoice_id,
        FailedPayment.user_id == account.user_id
    ).first()

    if existing:
        logger.info(f"Already tracking invoice {invoice_id}, skipping")
        return

    failed_payment = FailedPayment(
        user_id=account.user_id,
        connected_account_id=account.id,
        stripe_invoice_id=invoice_id,
        stripe_customer_id=customer_id,
        stripe_subscription_id=subscription_id,
        customer_email=customer_email,
        customer_name=customer_name,
        amount_cents=amount_due,
        currency=currency,
        failure_code=failure_code_enum,
        failure_message=failure_message,
        failed_at=datetime.utcnow(),
        status=PaymentStatus.DETECTED
    )
    db.add(failed_payment)
    db.commit()
    db.refresh(failed_payment)

    # Kick off the recovery process
    create_initial_retry.delay(failed_payment.id)
    logger.info(f"Created failed payment record {failed_payment.id} for invoice {invoice_id}")


async def handle_payment_succeeded(data: dict, db: Session):
    """Handle invoice.payment_succeeded — mark recovery if we were tracking this invoice."""
    invoice_id = data.get("id")

    failed_payment = db.query(FailedPayment).filter(
        FailedPayment.stripe_invoice_id == invoice_id,
        FailedPayment.status.in_([PaymentStatus.DETECTED, PaymentStatus.RETRYING])
    ).first()

    if failed_payment:
        failed_payment.status = PaymentStatus.RECOVERED
        failed_payment.recovered_at = datetime.utcnow()
        db.commit()
        logger.info(f"Payment recovered for invoice {invoice_id}")


async def handle_subscription_deleted(data: dict, db: Session):
    """Handle customer.subscription.deleted — cancel recovery for that subscription."""
    subscription_id = data.get("id")

    failed_payments = db.query(FailedPayment).filter(
        FailedPayment.stripe_subscription_id == subscription_id,
        FailedPayment.status.in_([PaymentStatus.DETECTED, PaymentStatus.RETRYING])
    ).all()

    for payment in failed_payments:
        payment.status = PaymentStatus.CANCELED
    db.commit()

    if failed_payments:
        logger.info(f"Canceled {len(failed_payments)} recovery attempts for subscription {subscription_id}")


async def handle_payment_method_updated(data: dict, stripe_account_id: str, db: Session):
    """Handle payment_method.updated — trigger immediate retry for that customer's failed payments."""
    customer_id = data.get("customer")

    if not customer_id:
        return

    failed_payments = db.query(FailedPayment).filter(
        FailedPayment.stripe_customer_id == customer_id,
        FailedPayment.status == PaymentStatus.RETRYING
    ).all()

    for payment in failed_payments:
        # Customer updated their payment method — trigger immediate retry
        create_initial_retry.delay(payment.id)
        logger.info(f"Triggering immediate retry for payment {payment.id} after payment method update")
