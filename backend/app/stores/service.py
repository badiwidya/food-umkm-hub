from typing import Any
from uuid import UUID

from app.sentinel import UNSET
from app.stores.dto import StoreWithOwner
from app.stores.entity import Store
from app.stores.enum import ApprovalStatus
from app.stores.repository import StoreRepository


class StoreService:
    def __init__(self, store_repo: StoreRepository) -> None:
        self._store_repo = store_repo

    async def get_by_id(self, store_id: UUID) -> Store | None:
        return await self._store_repo.get_by_id(store_id)

    async def get_by_id_with_owner(self, store_id: UUID) -> StoreWithOwner | None:
        return await self._store_repo.get_by_id_with_owner(store_id)

    async def get_by_owner_id(self, owner_id: UUID) -> StoreWithOwner | None:
        return await self._store_repo.get_by_owner_id(owner_id)

    async def list(
        self, keyword: str | None = None, page: int = 1, page_size: int = 12
    ) -> tuple[list[Store], int]:
        limit = page_size
        offset = (page - 1) * page_size

        stores, total_count = await self._store_repo.get_all(
            status=ApprovalStatus.APPROVED, keyword=keyword, offset=offset, limit=limit
        )

        return stores, total_count

    async def list_all(
        self,
        page: int,
        page_size: int,
        keyword: str | None = None,
        status: ApprovalStatus | None = None,
    ) -> tuple[list[StoreWithOwner], int]:
        limit = page_size
        offset = (page - 1) * page_size

        stores, total_count = await self._store_repo.get_all_with_owner(
            status=status, keyword=keyword, offset=offset, limit=limit
        )

        return stores, total_count

    async def update_information(self, store: Store, updates: dict[str, Any]) -> None:
        store.change_informations(
            name=updates.get("name", UNSET),
            description=updates.get("description", UNSET),
            address=updates.get("address", UNSET),
            photo_url=updates.get("photo_url", UNSET),
            qris_image_url=updates.get("qris_image_url", UNSET),
            maps_link=updates.get("maps_link", UNSET),
        )

        await self._store_repo.update(store)

    async def approve(self, store: Store) -> None:
        store.approve()

        await self._store_repo.update(store)

    async def reject(self, store: Store, notes: str | None = None) -> None:
        store.reject(notes)

        await self._store_repo.update(store)

    async def resubmit(self, store: Store) -> None:
        store.resubmit()

        await self._store_repo.update(store)

    async def open(self, store: Store) -> None:
        store.open()

        await self._store_repo.update(store)

    async def close(self, store: Store) -> None:
        store.close()

        await self._store_repo.update(store)
