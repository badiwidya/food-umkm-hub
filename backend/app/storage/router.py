from fastapi import APIRouter, status

from app.auth.dependency import CurrentUserDep
from app.storage.dependency import StorageServiceDep
from app.storage.schema import SignUploadRequest, SignUploadResponse

storage_router = APIRouter(prefix="/upload", tags=["Upload"])


@storage_router.post("/sign", status_code=status.HTTP_200_OK)
async def sign_upload(
    storage_service: StorageServiceDep,
    user: CurrentUserDep,
    payload: SignUploadRequest,
) -> SignUploadResponse:
    return storage_service.sign_upload(
        user=user,
        context=payload.context,
        content_type=payload.content_type,
    )
