from celery import Celery

from app.config import settings

celery_app = Celery(
    name="food_umkm_hub",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.notifications.task",
    ],
)

celery_app.conf.update(
    timezone="UTC",
    enable_utc=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
    worker_prefetch_multiplier=1,
    task_routes={"email.*": {"queue": "email"}},
)
