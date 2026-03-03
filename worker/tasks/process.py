"""
Core processing task.
Sprint 1: skeleton only — updates job status in Supabase.
Sprint 2+: real AI processing (denoise / upscale / color / BGM).
"""
import logging
import os

from celery import Task

from worker.celery_app import celery_app

logger = logging.getLogger(__name__)


def _get_supabase():
    """Lazy import to avoid circular deps and load .env first."""
    from supabase import create_client

    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    schema = os.getenv("SUPABASE_SCHEMA", "dev")
    client = create_client(url, key)
    return client, schema


@celery_app.task(
    bind=True,
    name="worker.tasks.process.process_job",
    max_retries=3,
    default_retry_delay=10,
)
def process_job(self: Task, job_id: str) -> dict:
    """
    Entry point for all media processing jobs.
    Reads job metadata from Supabase, dispatches to the correct pipeline,
    and updates status on completion/failure.
    """
    logger.info("Starting job %s", job_id)
    supabase, schema = _get_supabase()

    try:
        # Mark as processing
        supabase.schema(schema).table("jobs").update({"status": "processing"}).eq(
            "id", job_id
        ).execute()

        # Fetch job details
        result = (
            supabase.schema(schema)
            .table("jobs")
            .select("*")
            .eq("id", job_id)
            .single()
            .execute()
        )
        job = result.data
        if not job:
            raise ValueError(f"Job {job_id} not found in DB")

        job_type = job.get("type", "image")

        # --- Pipeline dispatch (Sprint 2+) ---
        if job_type == "image":
            output_key = _process_image(job)
        else:
            output_key = _process_video(job)

        # Mark done
        supabase.schema(schema).table("jobs").update(
            {"status": "done", "output_key": output_key}
        ).eq("id", job_id).execute()

        logger.info("Job %s completed", job_id)
        return {"job_id": job_id, "status": "done", "output_key": output_key}

    except Exception as exc:
        logger.exception("Job %s failed: %s", job_id, exc)
        supabase.schema(schema).table("jobs").update(
            {"status": "failed", "error": str(exc)}
        ).eq("id", job_id).execute()
        raise self.retry(exc=exc)


# ---------------------------------------------------------------------------
# Pipeline stubs — replace with real implementations in Sprint 2+
# ---------------------------------------------------------------------------

def _process_image(job: dict) -> str:
    """Image pipeline: denoise → upscale → color correction."""
    logger.info("Image pipeline for job %s (stub)", job["id"])
    # TODO: integrate Real-ESRGAN / Topaz / custom model
    return job["object_key"].replace("uploads/", "outputs/", 1)


def _process_video(job: dict) -> str:
    """Video pipeline: denoise → color → stabilize → BGM insertion."""
    logger.info("Video pipeline for job %s (stub)", job["id"])
    # TODO: integrate FFmpeg + BGM model
    return job["object_key"].replace("uploads/", "outputs/", 1)
