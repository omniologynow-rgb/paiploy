import stripe
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ConnectedAccount
from app.schemas import ConnectedAccountResponse
from app.auth import get_current_user
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/api/connect", tags=["stripe-connect"])


@router.get("/authorize")
async def authorize_stripe_connect(current_user: User = Depends(get_current_user)):
    stripe_auth_url = (
        f"https://connect.stripe.com/oauth/authorize"
        f"?response_type=code"
        f"&client_id={settings.STRIPE_CONNECT_CLIENT_ID}"
        f"&scope=read_write"
        f"&redirect_uri={settings.BACKEND_URL}/api/connect/callback"
        f"&state={current_user.id}"
    )
    return {"authorization_url": stripe_auth_url}


@router.get("/callback")
async def stripe_connect_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    user_id = int(state)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Exchange authorization code for access token via Stripe OAuth
    try:
        response = stripe.OAuth.token(
            grant_type="authorization_code",
            code=code,
        )
    except stripe.error.OAuthError as e:
        logger.error(f"Stripe OAuth error for user {user_id}: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to connect Stripe account: {str(e)}"
        )

    stripe_account_id = response.get("stripe_user_id")
    access_token = response.get("access_token")
    refresh_token = response.get("refresh_token")

    if not stripe_account_id:
        raise HTTPException(status_code=400, detail="No Stripe account ID returned")

    # Deactivate any existing connection for this user
    existing = db.query(ConnectedAccount).filter(
        ConnectedAccount.user_id == user_id,
        ConnectedAccount.is_active == True
    ).all()
    for acct in existing:
        acct.is_active = False

    # Create the new connected account record
    connected_account = ConnectedAccount(
        user_id=user_id,
        stripe_account_id=stripe_account_id,
        access_token=access_token,
        refresh_token=refresh_token,
        is_active=True
    )

    db.add(connected_account)
    db.commit()

    logger.info(f"Stripe account {stripe_account_id} connected for user {user_id}")

    # Redirect back to the frontend dashboard
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard?connected=true")


@router.delete("/disconnect")
async def disconnect_stripe(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(ConnectedAccount).filter(
        ConnectedAccount.user_id == current_user.id,
        ConnectedAccount.is_active == True
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="No active connection found")

    # Revoke access on Stripe's side
    try:
        stripe.OAuth.deauthorize(
            client_id=settings.STRIPE_CONNECT_CLIENT_ID,
            stripe_user_id=account.stripe_account_id,
        )
    except stripe.error.StripeError as e:
        logger.warning(f"Failed to deauthorize on Stripe: {e}")

    account.is_active = False
    db.commit()

    return {"message": "Stripe account disconnected successfully"}


@router.get("/status", response_model=ConnectedAccountResponse)
async def get_connection_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(ConnectedAccount).filter(
        ConnectedAccount.user_id == current_user.id,
        ConnectedAccount.is_active == True
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="No active connection found")

    return account
