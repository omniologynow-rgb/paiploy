from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from datetime import datetime
from app.database import get_db
from app.models import User, FailedPayment, PaymentStatus, FailureCode
from app.schemas import FailedPaymentResponse, FailedPaymentListResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/failed", response_model=List[FailedPaymentListResponse])
async def list_failed_payments(
    status: Optional[PaymentStatus] = None,
    failure_code: Optional[FailureCode] = None,
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(FailedPayment).filter(FailedPayment.user_id == current_user.id)

    if status:
        query = query.filter(FailedPayment.status == status)
    if failure_code:
        query = query.filter(FailedPayment.failure_code == failure_code)

    failed_payments = query.order_by(desc(FailedPayment.failed_at)).limit(limit).offset(offset).all()

    result = []
    for payment in failed_payments:
        retry_count = len(payment.retry_attempts)
        result.append(FailedPaymentListResponse(
            id=payment.id,
            stripe_customer_id=payment.stripe_customer_id,
            customer_email=payment.customer_email,
            customer_name=payment.customer_name,
            amount_cents=payment.amount_cents,
            currency=payment.currency,
            failure_code=payment.failure_code,
            failed_at=payment.failed_at,
            status=payment.status,
            retry_count=retry_count
        ))

    return result


@router.get("/failed/{payment_id}", response_model=FailedPaymentResponse)
async def get_failed_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(FailedPayment).filter(
        FailedPayment.id == payment_id,
        FailedPayment.user_id == current_user.id
    ).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    return payment


@router.post("/failed/{payment_id}/retry")
async def manual_retry_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(FailedPayment).filter(
        FailedPayment.id == payment_id,
        FailedPayment.user_id == current_user.id
    ).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.status in [PaymentStatus.RECOVERED, PaymentStatus.CANCELED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot retry payment with status: {payment.status}"
        )

    return {
        "message": "Manual retry initiated",
        "payment_id": payment_id
    }


@router.post("/failed/{payment_id}/cancel")
async def cancel_payment_recovery(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(FailedPayment).filter(
        FailedPayment.id == payment_id,
        FailedPayment.user_id == current_user.id
    ).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.status == PaymentStatus.RECOVERED:
        raise HTTPException(status_code=400, detail="Payment already recovered")

    payment.status = PaymentStatus.CANCELED
    db.commit()

    return {
        "message": "Payment recovery canceled",
        "payment_id": payment_id
    }
