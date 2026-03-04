"""
Celery application instance.
Import this module to get the configured Celery app.
"""
import os
from pathlib import Path

from celery import Celery
from dotenv import load_dotenv

# Load shared env first as fallback, then local .env (override=False keeps already-set vars)
_SHARED_ENV = Path(__file__).parents[2] / ".env.shared"
load_dotenv(_SHARED_ENV)
load_dotenv()

broker = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")

celery_app = Celery(
    "editluma",
    broker=broker,
    backend=backend,
    include=["worker.tasks.process"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Retry policy defaults
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
)
