from typing import Annotated

from fastapi import Depends

from app.storage.client import get_r2_client
from app.storage.service import StorageService


def get_storage_service() -> StorageService:
    return StorageService(client=get_r2_client())


StorageServiceDep = Annotated[StorageService, Depends(get_storage_service)]
