from app.schema import BaseSchema
from app.storage.enum import UploadContext


class SignUploadRequest(BaseSchema):
    context: UploadContext
    content_type: str


class SignUploadResponse(BaseSchema):
    upload_url: str
    file_key: str
    public_url: str
    expires_in: int
