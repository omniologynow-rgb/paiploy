from celery import Task
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import random
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import (
    FailedPayment, RetryAttempt, DunningEmail, UserSettings,
    PaymentStatus, RetryResult, RetryMethod, EmailTemplate,
    EmailStatus, FailureCode, RecoveryStats, StatsPeriod
)


class DatabaseTask(Task):
    _db = None

    @property
    def db(self) -> Session:
        if self._db is None:
            self._db = SessionLocal()
        return self._db

    def after_return(self, *args, **kwargs):
        if self._db is not None:
            self._db.close()
            self._db = None


def send_email(to_email: str, subject: str, html_body: str, template_vars: dict):
    body = html_body
    for key, value in template_vars.items():
        body = body.replace(f"{{{key}}}", str(value))

    print(f"[EMAIL] To: {to_email}")
    print(f"[EMAIL] Subject: {subject}")
    print(f"[EMAIL] Body preview: {body[:100]}...")


def attempt_stripe_retry(invoice_id: str, access_token: str) -> dict:
    jitter = random.uniform(0.8, 1.2)

    return {
        "success": False,
        "error": "card_declined",
        "message": "Mock retry - card declined"
    }


@celery_app.task(base=DatabaseTask, bind=True)
def process_retry_queue(self):
    db = self.db
    now = datetime.utcnow()

    pending_retries = db.query(RetryAttempt).filter(
        RetryAttempt.executed_at == None,
        RetryAttempt.scheduled_at <= now
    ).all()

    processed_count = 0

    for retry in pending_retries:
        failed_payment = db.query(FailedPayment).filter(
            FailedPayment.id == retry.failed_payment_id
        ).first()

        if not failed_payment:
            continue

        if failed_payment.status in [PaymentStatus.RECOVERED, PaymentStatus.CANCELED]:
            retry.result = RetryResult.SKIPPED
            retry.executed_at = now
            retry.failure_reason = f"Payment already {failed_payment.status.value}"
            db.commit()
            continue

        if failed_payment.failure_code in [FailureCode.STOLEN_CARD, FailureCode.FRAUDULENT]:
            retry.result = RetryResult.SKIPPED
            retry.executed_at = now
            retry.failure_reason = "Cannot retry fraudulent/stolen card"
            failed_payment.status = PaymentStatus.EXHAUSTED
            db.commit()
            continue

        connected_account = failed_payment.connected_account
        result = attempt_stripe_retry(
            failed_payment.stripe_invoice_id,
            connected_account.access_token
        )

        retry.executed_at = now

        if result["success"]:
            retry.result = RetryResult.SUCCESS
            failed_payment.status = PaymentStatus.RECOVERED
            failed_payment.recovered_at = now
            failed_payment.recovery_method = RetryMethod.AUTO_RETRY
        else:
            retry.result = RetryResult.FAILED
            retry.failure_reason = result.get("message", "Unknown error")

            user_settings = db.query(UserSettings).filter(
                UserSettings.user_id == failed_payment.user_id
            ).first()

            if retry.attempt_number >= (user_settings.max_retry_attempts if user_settings else 5):
                failed_payment.status = PaymentStatus.EXHAUSTED
            else:
                failed_payment.status = PaymentStatus.RETRYING

                schedule_next_retry.delay(failed_payment.id)

        db.commit()
        processed_count += 1

    return {"processed": processed_count}


@celery_app.task(base=DatabaseTask, bind=True)
def schedule_next_retry(self, failed_payment_id: int):
    db = self.db

    failed_payment = db.query(FailedPayment).filter(
        FailedPayment.id == failed_payment_id
    ).first()

    if not failed_payment:
        return

    user_settings = db.query(UserSettings).filter(
        UserSettings.user_id == failed_payment.user_id
    ).first()

    existing_attempts = len(failed_payment.retry_attempts)
    next_attempt_number = existing_attempts + 1

    if next_attempt_number > (user_settings.max_retry_attempts if user_settings else 5):
        failed_payment.status = PaymentStatus.EXHAUSTED
        db.commit()
        return

    interval_hours = 4
    if user_settings:
        if next_attempt_number == 1:
            interval_hours = user_settings.retry_interval_1_hours
        elif next_attempt_number == 2:
            interval_hours = user_settings.retry_interval_2_hours
        elif next_attempt_number == 3:
            interval_hours = user_settings.retry_interval_3_hours
        elif next_attempt_number == 4:
            interval_hours = user_settings.retry_interval_4_hours
        elif next_attempt_number == 5:
            interval_hours = user_settings.retry_interval_5_hours

    jitter = random.uniform(0.9, 1.1)
    scheduled_time = datetime.utcnow() + timedelta(hours=interval_hours * jitter)

    new_retry = RetryAttempt(
        failed_payment_id=failed_payment_id,
        attempt_number=next_attempt_number,
        scheduled_at=scheduled_time,
        retry_method=RetryMethod.AUTO_RETRY
    )

    db.add(new_retry)
    db.commit()

    if user_settings:
        if next_attempt_number == 2 and user_settings.send_friendly_reminder:
            send_dunning_email.delay(failed_payment_id, EmailTemplate.FRIENDLY_REMINDER.value)
        elif next_attempt_number == 3 and user_settings.send_urgent_notice:
            send_dunning_email.delay(failed_payment_id, EmailTemplate.URGENT_NOTICE.value)
        elif next_attempt_number == 4 and user_settings.send_card_update_request:
            send_dunning_email.delay(failed_payment_id, EmailTemplate.CARD_UPDATE_REQUEST.value)
        elif next_attempt_number == 5 and user_settings.send_final_warning:
            send_dunning_email.delay(failed_payment_id, EmailTemplate.FINAL_WARNING.value)


@celery_app.task(base=DatabaseTask, bind=True)
def send_dunning_email(self, failed_payment_id: int, template_name: str):
    db = self.db

    failed_payment = db.query(FailedPayment).filter(
        FailedPayment.id == failed_payment_id
    ).first()

    if not failed_payment:
        return

    user = failed_payment.user
    user_settings = db.query(UserSettings).filter(
        UserSettings.user_id == user.id
    ).first()

    from app.routers.dunning import EMAIL_TEMPLATES

    template_enum = EmailTemplate(template_name)
    template = EMAIL_TEMPLATES.get(template_enum)

    if not template:
        return

    template_vars = {
        "customer_name": failed_payment.customer_name or "Customer",
        "amount": f"${failed_payment.amount_cents / 100:.2f}",
        "currency": failed_payment.currency.upper(),
        "product_name": "Subscription",
        "company_name": user.company_name or "Our Company",
        "update_payment_url": f"https://stripe.com/mock-update-payment/{failed_payment.stripe_customer_id}",
        "support_email": user_settings.support_email if user_settings and user_settings.support_email else "support@recoverpay.com"
    }

    subject = template["subject"]
    for key, value in template_vars.items():
        subject = subject.replace(f"{{{key}}}", str(value))

    send_email(
        failed_payment.customer_email,
        subject,
        template["body_html"],
        template_vars
    )

    dunning_email = DunningEmail(
        failed_payment_id=failed_payment_id,
        template_name=template_enum,
        status=EmailStatus.SENT
    )

    db.add(dunning_email)
    db.commit()


@celery_app.task(base=DatabaseTask, bind=True)
def create_initial_retry(self, failed_payment_id: int):
    db = self.db

    failed_payment = db.query(FailedPayment).filter(
        FailedPayment.id == failed_payment_id
    ).first()

    if not failed_payment:
        return

    user_settings = db.query(UserSettings).filter(
        UserSettings.user_id == failed_payment.user_id
    ).first()

    if failed_payment.failure_code in [FailureCode.EXPIRED_CARD, FailureCode.AUTHENTICATION_REQUIRED]:
        send_dunning_email.delay(failed_payment_id, EmailTemplate.CARD_UPDATE_REQUEST.value)
        return

    interval_hours = user_settings.retry_interval_1_hours if user_settings else 4
    scheduled_time = datetime.utcnow() + timedelta(hours=interval_hours)

    first_retry = RetryAttempt(
        failed_payment_id=failed_payment_id,
        attempt_number=1,
        scheduled_at=scheduled_time,
        retry_method=RetryMethod.AUTO_RETRY
    )

    db.add(first_retry)
    failed_payment.status = PaymentStatus.RETRYING
    db.commit()


@celery_app.task(base=DatabaseTask, bind=True)
def update_recovery_stats(self):
    db = self.db
    today = datetime.utcnow().date()

    from sqlalchemy import func
    from app.models import User

    users = db.query(User).all()

    for user in users:
        yesterday = today - timedelta(days=1)

        total_failed = db.query(func.sum(FailedPayment.amount_cents)).filter(
            FailedPayment.user_id == user.id,
            func.date(FailedPayment.failed_at) == yesterday
        ).scalar() or 0

        total_recovered = db.query(func.sum(FailedPayment.amount_cents)).filter(
            FailedPayment.user_id == user.id,
            FailedPayment.status == PaymentStatus.RECOVERED,
            func.date(FailedPayment.recovered_at) == yesterday
        ).scalar() or 0

        failed_count = db.query(func.count(FailedPayment.id)).filter(
            FailedPayment.user_id == user.id,
            func.date(FailedPayment.failed_at) == yesterday
        ).scalar() or 0

        recovered_count = db.query(func.count(FailedPayment.id)).filter(
            FailedPayment.user_id == user.id,
            FailedPayment.status == PaymentStatus.RECOVERED,
            func.date(FailedPayment.recovered_at) == yesterday
        ).scalar() or 0

        recovery_rate = (recovered_count / failed_count * 100) if failed_count > 0 else 0.0

        stats = RecoveryStats(
            user_id=user.id,
            period=StatsPeriod.DAILY,
            period_date=yesterday,
            total_failed_amount=total_failed,
            total_recovered_amount=total_recovered,
            total_failed_count=failed_count,
            total_recovered_count=recovered_count,
            recovery_rate_percent=recovery_rate
        )

        db.add(stats)

    db.commit()
    return {"updated": len(users)}
