from typing import Any
from uuid import UUID

from app.domains.admin import Admin
from app.domains.store import Store, StoreApprovalStatus
from app.sentinel import UNSET
from app.stores.repository import StoreRepository


class StoreService:
    def __init__(self, store_repo: StoreRepository) -> None:
        self._store_repo = store_repo

    async def get_details(self, store_id: UUID) -> Store | None:
        return await self._store_repo.get_by_id(store_id)

    async def get_details_by_owner_id(self, owner_id: UUID) -> Store | None:
        return await self._store_repo.get_by_owner_id(owner_id)

    async def list_for_public(
        self, is_open: bool | None, keyword: str | None, page: int, page_size: int
    ) -> tuple[list[Store], int]:
        limit = page_size
        offset = (page - 1) * page_size

        stores, total_count = await self._store_repo.get_all(
            is_open=is_open,
            status=StoreApprovalStatus.APPROVED,
            keyword=keyword,
            offset=offset,
            limit=limit,
        )

        return stores, total_count

    async def list_for_admin(
        self,
        keyword: str | None,
        status: StoreApprovalStatus | None,
        page: int,
        page_size: int,
    ) -> tuple[list[Store], int]:
        limit = page_size
        offset = (page - 1) * page_size

        stores, total_count = await self._store_repo.get_all(
            is_open=None, status=status, keyword=keyword, offset=offset, limit=limit
        )

        return stores, total_count

    async def update_information(self, store: Store, updates: dict[str, Any]) -> Store:
        store.change_information(
            name=updates.get("name", UNSET),
            description=updates.get("description", UNSET),
            address=updates.get("address", UNSET),
            photo_url=updates.get("photo_url", UNSET),
            qris_image_url=updates.get("qris_image_url", UNSET),
            maps_link=updates.get("maps_link", UNSET),
        )

        await self._store_repo.update(store)
        return store

    async def approve(self, admin: Admin, store: Store) -> None:
        admin.approve_store_application(store)
        await self._store_repo.update(store)

    async def reject(
        self, admin: Admin, store: Store, notes: str | None = None
    ) -> None:
        admin.reject_store_application(store, notes)
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
