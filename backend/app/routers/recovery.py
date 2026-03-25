from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List
from app.database import get_db
from app.models import User, FailedPayment, PaymentStatus, FailureCode
from app.schemas import (
    DashboardStatsResponse, TimelineDataPoint, FailureBreakdown
)
from app.auth import get_current_user

router = APIRouter(prefix="/api/recovery", tags=["recovery"])


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)

    revenue_at_risk = db.query(func.sum(FailedPayment.amount_cents)).filter(
        FailedPayment.user_id == current_user.id,
        FailedPayment.status.in_([PaymentStatus.DETECTED, PaymentStatus.RETRYING])
    ).scalar() or 0

    revenue_recovered = db.query(func.sum(FailedPayment.amount_cents)).filter(
        FailedPayment.user_id == current_user.id,
        FailedPayment.status == PaymentStatus.RECOVERED,
        FailedPayment.recovered_at >= thirty_days_ago
    ).scalar() or 0

    total_failed = db.query(func.count(FailedPayment.id)).filter(
        FailedPayment.user_id == current_user.id,
        FailedPayment.failed_at >= thirty_days_ago
    ).scalar() or 0

    total_recovered = db.query(func.count(FailedPayment.id)).filter(
        FailedPayment.user_id == current_user.id,
        FailedPayment.status == PaymentStatus.RECOVERED,
        FailedPayment.recovered_at >= thirty_days_ago
    ).scalar() or 0

    recovery_rate = (total_recovered / total_failed * 100) if total_failed > 0 else 0.0

    active_retries = db.query(func.count(FailedPayment.id)).filter(
        FailedPayment.user_id == current_user.id,
        FailedPayment.status == PaymentStatus.RETRYING
    ).scalar() or 0

    timeline = []
    for i in range(30):
        date = (now - timedelta(days=29-i)).date()
        date_str = date.isoformat()

        day_recovered = db.query(func.sum(FailedPayment.amount_cents)).filter(
            FailedPayment.user_id == current_user.id,
            FailedPayment.status == PaymentStatus.RECOVERED,
            func.date(FailedPayment.recovered_at) == date
        ).scalar() or 0

        day_failed = db.query(func.sum(FailedPayment.amount_cents)).filter(
            FailedPayment.user_id == current_user.id,
            func.date(FailedPayment.failed_at) == date
        ).scalar() or 0

        timeline.append(TimelineDataPoint(
            date=date_str,
            recovered_amount=day_recovered,
            failed_amount=day_failed
        ))

    failure_stats = db.query(
        FailedPayment.failure_code,
        func.count(FailedPayment.id).label('count')
    ).filter(
        FailedPayment.user_id == current_user.id,
        FailedPayment.failed_at >= thirty_days_ago
    ).group_by(FailedPayment.failure_code).all()

    total_failures_for_breakdown = sum(stat.count for stat in failure_stats)
    failure_breakdown = [
        FailureBreakdown(
            failure_code=stat.failure_code.value,
            count=stat.count,
            percentage=round((stat.count / total_failures_for_breakdown * 100), 2) if total_failures_for_breakdown > 0 else 0
        )
        for stat in failure_stats
    ]

    return DashboardStatsResponse(
        revenue_at_risk=revenue_at_risk,
        revenue_recovered=revenue_recovered,
        recovery_rate=round(recovery_rate, 2),
        active_retries=active_retries,
        timeline=timeline,
        failure_breakdown=failure_breakdown
    )


@router.get("/stats/timeline")
async def get_timeline_stats(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()
    timeline = []

    for i in range(days):
        date = (now - timedelta(days=days-1-i)).date()

        recovered = db.query(func.sum(FailedPayment.amount_cents)).filter(
            FailedPayment.user_id == current_user.id,
            FailedPayment.status == PaymentStatus.RECOVERED,
            func.date(FailedPayment.recovered_at) == date
        ).scalar() or 0

        failed = db.query(func.sum(FailedPayment.amount_cents)).filter(
            FailedPayment.user_id == current_user.id,
            func.date(FailedPayment.failed_at) == date
        ).scalar() or 0

        timeline.append({
            "date": date.isoformat(),
            "recovered_amount": recovered,
            "failed_amount": failed
        })

    return timeline


@router.get("/stats/by-failure-type")
async def get_failure_type_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    stats = db.query(
        FailedPayment.failure_code,
        func.count(FailedPayment.id).label('count'),
        func.sum(FailedPayment.amount_cents).label('total_amount')
    ).filter(
        FailedPayment.user_id == current_user.id,
        FailedPayment.failed_at >= thirty_days_ago
    ).group_by(FailedPayment.failure_code).all()

    total = sum(stat.count for stat in stats)

    return [
        {
            "failure_code": stat.failure_code.value,
            "count": stat.count,
            "total_amount": stat.total_amount,
            "percentage": round((stat.count / total * 100), 2) if total > 0 else 0
        }
        for stat in stats
    ]
