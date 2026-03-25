from celery import Celery
from celery.schedules import crontab
from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "recoverpay",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "process-retry-queue": {
            "task": "app.tasks.process_retry_queue",
            "schedule": crontab(minute="*/15"),
        },
        "update-recovery-stats": {
            "task": "app.tasks.update_recovery_stats",
            "schedule": crontab(hour="0", minute="0"),
        },
    },
)
