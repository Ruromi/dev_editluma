import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.storage import generate_presigned_download_url
from app.core.supabase import db_schema, get_supabase
from worker.tasks.process import process_job

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

JobStatus = Literal["pending", "processing", "done", "failed"]

_DB_ERROR_MSG = "데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요."


class CreateJobRequest(BaseModel):
    object_key: str
    filename: str


class JobResponse(BaseModel):
    id: str
    filename: str
    object_key: str
    type: Literal["image", "video"]
    mode: Optional[str] = None
    prompt: Optional[str] = None
    original_prompt: Optional[str] = None
    enhanced_prompt: Optional[str] = None
    status: JobStatus
    created_at: str
    output_key: Optional[str] = None
    output_url: Optional[str] = None


def _make_response(row: dict) -> JobResponse:
    """Build a JobResponse, adding a presigned download URL when output_key is set."""
    output_url: Optional[str] = None
    if row.get("output_key"):
        try:
            output_url = generate_presigned_download_url(row["output_key"])
        except Exception:
            pass
    return JobResponse(**{**row, "output_url": output_url})


def _infer_type(filename: str) -> Literal["image", "video"]:
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext in {"jpg", "jpeg", "png", "webp", "gif", "heic"}:
        return "image"
    return "video"


@router.post("", response_model=JobResponse, status_code=201)
async def create_job(body: CreateJobRequest):
    """Create a processing job and enqueue it to Celery."""
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    job_type = _infer_type(body.filename)

    row = {
        "id": job_id,
        "filename": body.filename,
        "object_key": body.object_key,
        "type": job_type,
        "status": "pending",
        "created_at": now,
    }

    # Persist to Supabase (schema-aware, with public fallback)
    supabase = get_supabase()
    try:
        result = (
            supabase.schema(db_schema())
            .table("jobs")
            .insert(row)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=_DB_ERROR_MSG) from exc

    if not result.data:
        raise HTTPException(status_code=503, detail=_DB_ERROR_MSG)

    # Enqueue Celery task (non-blocking)
    process_job.delay(job_id)

    return _make_response(row)


@router.get("", response_model=list[JobResponse])
async def list_jobs():
    """Return all jobs ordered by created_at desc."""
    supabase = get_supabase()
    try:
        result = (
            supabase.schema(db_schema())
            .table("jobs")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=_DB_ERROR_MSG) from exc

    return [_make_response(r) for r in (result.data or [])]


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """Return a single job by ID."""
    supabase = get_supabase()
    try:
        result = (
            supabase.schema(db_schema())
            .table("jobs")
            .select("*")
            .eq("id", job_id)
            .single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail=_DB_ERROR_MSG) from exc

    if not result.data:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다.")
    return _make_response(result.data)
