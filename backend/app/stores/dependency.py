from typing import Annotated
from uuid import UUID

from fastapi import Depends

from app.dependency import SessionDep
from app.stores.store import Store
from app.exception import NotFoundException
from app.stores.repository import StoreRepository
from app.stores.service import StoreService


def get_store_repo(session: SessionDep) -> StoreRepository:
    return StoreRepository(session=session)


StoreRepoDep = Annotated[StoreRepository, Depends(get_store_repo)]


def get_store_service(
    store_repo: StoreRepoDep,
) -> StoreService:
    return StoreService(store_repo=store_repo)


StoreServiceDep = Annotated[StoreService, Depends(get_store_service)]


async def store_target_from_path(id: UUID, store_service: StoreServiceDep) -> Store:
    store = await store_service.get_details(id)
    if store is None:
        raise NotFoundException("Toko tidak ada")
    return store


StoreTargetDep = Annotated[Store, Depends(store_target_from_path)]
