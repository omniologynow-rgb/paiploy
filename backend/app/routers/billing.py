import stripe
import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth import get_current_user
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/api/billing", tags=["billing"])


class CheckoutRequest(BaseModel):
    price_id: str


class CheckoutResponse(BaseModel):
    checkout_url: str


class PortalResponse(BaseModel):
    portal_url: str


class BillingStatusResponse(BaseModel):
    tier: str
    stripe_customer_id: str | None


def _ensure_stripe_customer(user: User, db: Session) -> str:
    """Ensure the user has a Stripe customer ID, creating one if needed."""
    if user.stripe_customer_id:
        return user.stripe_customer_id

    # Check if a customer already exists in Stripe for this email
    existing = stripe.Customer.list(email=user.email, limit=1)
    if existing.data:
        user.stripe_customer_id = existing.data[0].id
        db.commit()
        return user.stripe_customer_id

    # Create a new Stripe customer
    customer = stripe.Customer.create(
        email=user.email,
        name=user.company_name or user.email,
        metadata={"paiploy_user_id": str(user.id)},
    )
    user.stripe_customer_id = customer.id
    db.commit()
    logger.info(f"Created Stripe customer {customer.id} for user {user.id}")
    return customer.id


@router.post("/create-checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a Stripe Checkout session for Pro or Business subscription."""
    allowed_prices = [settings.STRIPE_PRICE_ID_PRO, settings.STRIPE_PRICE_ID_BUSINESS]
    if body.price_id not in allowed_prices:
        raise HTTPException(status_code=400, detail="Invalid price ID")

    try:
        # Always ensure we have a Stripe customer (required for Accounts V2)
        customer_id = _ensure_stripe_customer(current_user, db)

        session = stripe.checkout.Session.create(
            mode="subscription",
            customer=customer_id,
            line_items=[{"price": body.price_id, "quantity": 1}],
            metadata={"user_id": str(current_user.id)},
            success_url=f"{settings.FRONTEND_URL}/settings?billing=success",
            cancel_url=f"{settings.FRONTEND_URL}/settings?billing=canceled",
            allow_promotion_codes=True,
        )
        return CheckoutResponse(checkout_url=session.url)

    except stripe.error.StripeError as e:
        logger.error(f"Stripe checkout error for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")


@router.post("/create-portal-session", response_model=PortalResponse)
async def create_portal_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a Stripe Customer Portal session for managing subscription."""
    try:
        customer_id = _ensure_stripe_customer(current_user, db)
    except stripe.error.StripeError as e:
        logger.error(f"Stripe customer lookup error for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to look up billing account")

    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{settings.FRONTEND_URL}/settings",
        )
        return PortalResponse(portal_url=portal_session.url)

    except stripe.error.StripeError as e:
        logger.error(f"Stripe portal error for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create portal session")


@router.get("/status", response_model=BillingStatusResponse)
async def billing_status(
    current_user: User = Depends(get_current_user),
):
    """Return current subscription status."""
    return BillingStatusResponse(
        tier=current_user.subscription_tier.value,
        stripe_customer_id=current_user.stripe_customer_id,
    )
