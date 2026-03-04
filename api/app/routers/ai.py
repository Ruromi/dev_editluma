import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.supabase import db_schema, get_supabase
from worker.tasks.process import process_job

router = APIRouter(prefix="/api/ai", tags=["ai"])


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------


class EnhanceRequest(BaseModel):
    object_key: str
    prompt: Optional[str] = None


class GenerateRequest(BaseModel):
    prompt: str
    width: Optional[int] = 1024
    height: Optional[int] = 1024


class AiJobResponse(BaseModel):
    id: str
    filename: str
    object_key: str
    type: str
    mode: str
    prompt: Optional[str] = None
    status: str
    created_at: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_DB_ERROR_MSG = "데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요."


def _db_insert(row: dict) -> None:
    """Insert a job row, raising a friendly HTTPException on DB failure."""
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


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/enhance", response_model=AiJobResponse, status_code=201)
async def enhance_image(body: EnhanceRequest):
    """
    Create an AI enhance job for an already-uploaded file.

    Workflow:
      1. Client uploads file via POST /api/upload/presign + PUT.
      2. Client calls this endpoint with the returned object_key.
      3. Job is persisted (mode='enhance') and queued to Celery.
    """
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # Derive a display filename from the S3 key (last path segment)
    filename = body.object_key.rsplit("/", 1)[-1] or body.object_key

    row = {
        "id": job_id,
        "filename": filename,
        "object_key": body.object_key,
        "type": "image",
        "mode": "enhance",
        "prompt": body.prompt,
        "status": "pending",
        "created_at": now,
    }

    _db_insert(row)
    process_job.delay(job_id)
    return AiJobResponse(**row)


@router.post("/generate", response_model=AiJobResponse, status_code=201)
async def generate_image(body: GenerateRequest):
    """
    Create an AI generate job from a text prompt (no file upload required).

    Workflow:
      1. Client provides a prompt (and optional width/height).
      2. Job is persisted (mode='generate') and queued to Celery.
      3. Worker generates the image and stores it under outputs/generated/.
    """
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    row = {
        "id": job_id,
        "filename": f"generated_{job_id[:8]}.png",
        "object_key": "",          # no source file for generate
        "type": "image",
        "mode": "generate",
        "prompt": body.prompt,
        "status": "pending",
        "created_at": now,
    }

    _db_insert(row)
    process_job.delay(job_id)
    return AiJobResponse(**row)
