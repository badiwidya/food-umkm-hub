from datetime import UTC, datetime, time, timedelta
from typing import Any
from uuid import UUID
from zoneinfo import ZoneInfo

from app.orders.repository import OrderRepository
from app.reviews.repository import ReviewRepository
from app.sentinel import UNSET
from app.stores.dto import StoreDashboardDTO
from app.stores.repository import StoreRepository
from app.stores.store import Store, StoreApprovalStatus
from app.users.admin import Admin


class StoreService:
    def __init__(
        self,
        store_repo: StoreRepository,
        order_repo: OrderRepository,
        review_repo: ReviewRepository,
    ) -> None:
        self._store_repo = store_repo
        self._order_repo = order_repo
        self._review_repo = review_repo

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

    async def get_dashboard(self, store: Store) -> StoreDashboardDTO:
        today_start, today_end = self._get_today_window()
        today_revenue, total_orders = await self._order_repo.get_completed_order_stats(
            store_id=store.id,
            today_start=today_start,
            today_end=today_end,
        )
        total_products_sold = await self._order_repo.get_completed_products_sold(
            store.id
        )
        store_rating, review_count = await self._review_repo.get_rating_stats_by_store(
            store.id
        )
        top_selling_products = await self._order_repo.get_top_selling_products(
            store_id=store.id,
            limit=5,
        )

        return StoreDashboardDTO(
            today_revenue=today_revenue,
            total_orders=total_orders,
            total_products_sold=total_products_sold,
            store_rating=store_rating,
            review_count=review_count,
            top_selling_products=top_selling_products,
        )

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

    @staticmethod
    def _get_today_window() -> tuple[datetime, datetime]:
        timezone = ZoneInfo("Asia/Jakarta")
        today = datetime.now(timezone).date()
        today_start = datetime.combine(today, time.min, tzinfo=timezone)
        today_end = today_start + timedelta(days=1)
        return today_start.astimezone(UTC), today_end.astimezone(UTC)
