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


@router.get("/activity")
async def get_recent_activity(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return recent activity events from failed_payments, retry_attempts, and dunning_emails."""
    from app.models import RetryAttempt, DunningEmail, RetryResult

    events = []
    now = datetime.utcnow()

    def time_ago(dt):
        if not dt:
            return "just now"
        diff = now - dt
        if diff.total_seconds() < 60:
            return "just now"
        elif diff.total_seconds() < 3600:
            mins = int(diff.total_seconds() / 60)
            return f"{mins} min ago"
        elif diff.total_seconds() < 86400:
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        else:
            days = int(diff.total_seconds() / 86400)
            return f"{days} day{'s' if days != 1 else ''} ago"

    def fmt_amount(cents):
        return f"${cents / 100:,.2f}"

    # Recovered payments
    recovered = db.query(FailedPayment).filter(
        FailedPayment.user_id == current_user.id,
        FailedPayment.status == PaymentStatus.RECOVERED
    ).order_by(desc(FailedPayment.recovered_at)).limit(limit).all()

    for p in recovered:
        events.append({
            "type": "recovered",
            "text": f"Payment of {fmt_amount(p.amount_cents)} recovered from {p.customer_email}",
            "time": time_ago(p.recovered_at),
            "sort_ts": p.recovered_at or p.created_at,
            "color": "bg-emerald-400"
        })

    # Failed payments (detected)
    failed = db.query(FailedPayment).filter(
        FailedPayment.user_id == current_user.id,
        FailedPayment.status.in_([PaymentStatus.DETECTED, PaymentStatus.RETRYING])
    ).order_by(desc(FailedPayment.failed_at)).limit(limit).all()

    for p in failed:
        msg = p.failure_message or p.failure_code.value if p.failure_code else "unknown"
        events.append({
            "type": "failed",
            "text": f"Payment of {fmt_amount(p.amount_cents)} failed — {msg}",
            "time": time_ago(p.failed_at),
            "sort_ts": p.failed_at or p.created_at,
            "color": "bg-red-400"
        })

    # Retry attempts
    retries = db.query(RetryAttempt).join(FailedPayment).filter(
        FailedPayment.user_id == current_user.id
    ).order_by(desc(RetryAttempt.executed_at)).limit(limit).all()

    for r in retries:
        fp = r.failed_payment
        if r.result == RetryResult.SUCCESS:
            events.append({
                "type": "recovered",
                "text": f"Retry #{r.attempt_number} succeeded for {fmt_amount(fp.amount_cents)}",
                "time": time_ago(r.executed_at),
                "sort_ts": r.executed_at or r.created_at,
                "color": "bg-emerald-400"
            })
        else:
            events.append({
                "type": "retry",
                "text": f"Retry #{r.attempt_number} attempted for {fmt_amount(fp.amount_cents)} charge",
                "time": time_ago(r.executed_at),
                "sort_ts": r.executed_at or r.created_at,
                "color": "bg-amber-400"
            })

    # Dunning emails
    emails = db.query(DunningEmail).join(FailedPayment).filter(
        FailedPayment.user_id == current_user.id
    ).order_by(desc(DunningEmail.sent_at)).limit(limit).all()

    for e in emails:
        fp = e.failed_payment
        events.append({
            "type": "email",
            "text": f"Dunning email sent to {fp.customer_email}",
            "time": time_ago(e.sent_at),
            "sort_ts": e.sent_at or datetime.utcnow(),
            "color": "bg-blue-400"
        })

    # Sort all events by time, most recent first
    events.sort(key=lambda x: x.get("sort_ts") or datetime.min, reverse=True)

    # Remove sort_ts from output, return top N
    for e in events:
        e.pop("sort_ts", None)

    return events[:limit]
