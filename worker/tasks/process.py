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
        mode = job.get("mode")

        # --- Pipeline dispatch (Sprint 2+) ---
        if mode == "generate":
            output_key, enhanced_prompt = _generate_image(job)
            update_data = {
                "status": "done",
                "output_key": output_key,
                "original_prompt": job.get("prompt"),
                "enhanced_prompt": enhanced_prompt,
            }
        elif job_type == "image":
            output_key = _enhance_image(job)
            update_data = {"status": "done", "output_key": output_key}
        else:
            output_key = _process_video(job)
            update_data = {"status": "done", "output_key": output_key}

        # Mark done
        supabase.schema(schema).table("jobs").update(update_data).eq(
            "id", job_id
        ).execute()

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

def _enhance_image(job: dict) -> str:
    """Image enhance pipeline: denoise → upscale → color correction."""
    logger.info("Enhance pipeline for job %s (stub)", job["id"])
    # TODO: integrate Real-ESRGAN / Topaz / custom model
    return job["object_key"].replace("uploads/", "outputs/", 1)


def _enhance_prompt_locally(prompt: str) -> str:
    """Deterministic local prompt enhancement when the API doesn't provide one."""
    qualifiers = ["high quality", "detailed", "sharp", "professional", "4k", "8k"]
    p = prompt.strip()
    if not any(q in p.lower() for q in qualifiers):
        p = f"{p}, high quality, detailed, professional"
    return p


def _generate_image(job: dict) -> tuple[str, str]:
    """Generate pipeline: text prompt → Ideogram API → S3 upload.

    Returns:
        (output_key, enhanced_prompt)
    """
    import uuid as _uuid
    import os
    import httpx
    import boto3
    from botocore.config import Config

    prompt = (job.get("prompt") or "").strip()
    if not prompt:
        raise ValueError("생성 프롬프트가 없습니다.")

    api_key = os.getenv("IDEOGRAM_API_KEY", "")
    if not api_key:
        logger.error("IDEOGRAM_API_KEY not found — set it in api/.env or .env.shared (parent of repo)")
        raise RuntimeError("IDEOGRAM_API_KEY가 설정되지 않았습니다.")

    model = os.getenv("IDEOGRAM_MODEL", "V_2")

    logger.info("Calling Ideogram for job %s prompt=%r model=%s", job["id"], prompt, model)

    with httpx.Client(timeout=120) as client:
        # 1. Request generation
        resp = client.post(
            "https://api.ideogram.ai/generate",
            headers={"Api-Key": api_key, "Content-Type": "application/json"},
            json={
                "image_request": {
                    "prompt": prompt,
                    "model": model,
                    "aspect_ratio": "ASPECT_1_1",
                }
            },
        )
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            body = exc.response.text[:300]
            raise RuntimeError(
                f"Ideogram API 오류 ({exc.response.status_code}): {body}"
            ) from exc

        data = resp.json()
        items = data.get("data") or []
        if not items:
            raise RuntimeError("Ideogram API가 이미지를 반환하지 않았습니다.")

        item = items[0]
        image_url: str = item["url"]
        # Ideogram may return a rewritten/enhanced prompt in the response
        ideogram_prompt = (item.get("prompt") or "").strip()
        enhanced_prompt = ideogram_prompt if ideogram_prompt else _enhance_prompt_locally(prompt)
        logger.info("Ideogram returned URL for job %s", job["id"])

        # 2. Download image bytes
        img_resp = client.get(image_url)
        try:
            img_resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"생성 이미지 다운로드 실패 ({exc.response.status_code})"
            ) from exc
        image_bytes = img_resp.content

    # 3. Upload to S3
    output_key = f"outputs/generated/{_uuid.uuid4()}.png"
    _upload_bytes_to_s3(output_key, image_bytes, "image/png")
    logger.info("Uploaded generated image to %s for job %s", output_key, job["id"])
    return output_key, enhanced_prompt


def _process_video(job: dict) -> str:
    """Video pipeline: denoise → color → stabilize → BGM insertion."""
    logger.info("Video pipeline for job %s (stub)", job["id"])
    # TODO: integrate FFmpeg + BGM model
    return job["object_key"].replace("uploads/", "outputs/", 1)


def _upload_bytes_to_s3(object_key: str, data: bytes, content_type: str) -> None:
    """Upload raw bytes to the configured S3-compatible bucket."""
    import os
    import boto3
    from botocore.config import Config

    bucket = os.getenv("STORAGE_BUCKET", "editluma-uploads")
    endpoint = os.getenv("STORAGE_ENDPOINT_URL") or None
    region = os.getenv("STORAGE_REGION", "ap-northeast-2")
    access_key = os.getenv("STORAGE_ACCESS_KEY", "")
    secret_key = os.getenv("STORAGE_SECRET_KEY", "")

    kwargs: dict = dict(
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
    )
    if endpoint:
        kwargs["endpoint_url"] = endpoint

    s3 = boto3.client("s3", **kwargs)
    s3.put_object(Bucket=bucket, Key=object_key, Body=data, ContentType=content_type)
