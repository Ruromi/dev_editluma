import uuid

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.storage import generate_presigned_upload_url

router = APIRouter(prefix="/api/upload", tags=["upload"])


class PresignRequest(BaseModel):
    filename: str
    content_type: str


class PresignResponse(BaseModel):
    upload_url: str
    object_key: str


@router.post("/presign", response_model=PresignResponse)
async def presign_upload(body: PresignRequest):
    """
    Return a presigned PUT URL so the browser can upload directly to storage.
    The object key is: uploads/{uuid}/{original_filename}
    """
    safe_name = body.filename.replace(" ", "_")
    object_key = f"uploads/{uuid.uuid4()}/{safe_name}"
    upload_url = generate_presigned_upload_url(object_key, body.content_type)
    return PresignResponse(upload_url=upload_url, object_key=object_key)
