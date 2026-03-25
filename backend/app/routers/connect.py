from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ConnectedAccount
from app.schemas import ConnectedAccountResponse
from app.auth import get_current_user
from app.config import get_settings

settings = get_settings()

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

    connected_account = ConnectedAccount(
        user_id=user_id,
        stripe_account_id=f"acct_mock_{user_id}",
        access_token=f"mock_access_token_{code}",
        refresh_token=f"mock_refresh_token_{code}",
        is_active=True
    )

    db.add(connected_account)
    db.commit()

    return {
        "message": "Stripe account connected successfully",
        "redirect_url": f"{settings.FRONTEND_URL}/dashboard"
    }


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
