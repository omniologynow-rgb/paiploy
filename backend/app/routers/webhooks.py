from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import FailedPayment, ConnectedAccount, PaymentStatus, FailureCode
from app.config import get_settings

settings = get_settings()

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = await request.json()
        event_type = event.get("type")
        data = event.get("data", {}).get("object", {})

        if event_type == "invoice.payment_failed":
            invoice_id = data.get("id")
            customer_id = data.get("customer")
            subscription_id = data.get("subscription")
            amount_due = data.get("amount_due")
            currency = data.get("currency", "usd")
            customer_email = data.get("customer_email")
            customer_name = data.get("customer_name")

            last_payment_error = data.get("last_payment_error", {})
            failure_code = last_payment_error.get("code", "other")
            failure_message = last_payment_error.get("message", "Payment failed")

            failure_code_enum = FailureCode.OTHER
            if "card_declined" in failure_code:
                failure_code_enum = FailureCode.CARD_DECLINED
            elif "insufficient_funds" in failure_code:
                failure_code_enum = FailureCode.INSUFFICIENT_FUNDS
            elif "expired_card" in failure_code:
                failure_code_enum = FailureCode.EXPIRED_CARD
            elif "authentication_required" in failure_code:
                failure_code_enum = FailureCode.AUTHENTICATION_REQUIRED

            account = db.query(ConnectedAccount).filter(
                ConnectedAccount.is_active == True
            ).first()

            if account:
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

        elif event_type == "invoice.payment_succeeded":
            invoice_id = data.get("id")

            failed_payment = db.query(FailedPayment).filter(
                FailedPayment.stripe_invoice_id == invoice_id,
                FailedPayment.status.in_([PaymentStatus.DETECTED, PaymentStatus.RETRYING])
            ).first()

            if failed_payment:
                failed_payment.status = PaymentStatus.RECOVERED
                failed_payment.recovered_at = datetime.utcnow()
                db.commit()

        elif event_type == "customer.subscription.deleted":
            subscription_id = data.get("id")

            failed_payments = db.query(FailedPayment).filter(
                FailedPayment.stripe_subscription_id == subscription_id,
                FailedPayment.status.in_([PaymentStatus.DETECTED, PaymentStatus.RETRYING])
            ).all()

            for payment in failed_payments:
                payment.status = PaymentStatus.CANCELED
            db.commit()

        elif event_type == "payment_method.updated":
            customer_id = data.get("customer")

            failed_payments = db.query(FailedPayment).filter(
                FailedPayment.stripe_customer_id == customer_id,
                FailedPayment.status == PaymentStatus.RETRYING
            ).all()

            for payment in failed_payments:
                pass

        return {"status": "success"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
