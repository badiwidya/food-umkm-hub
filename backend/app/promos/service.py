from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from app.promos.promo import Promo
from app.stores.store import Store
from app.exception import DomainException, NotFoundException
from app.promos.dto import CreatePromoDTO
from app.promos.repository import PromoRepository
from app.sentinel import UNSET


class PromoService:
    def __init__(self, promo_repo: PromoRepository) -> None:
        self._promo_repo = promo_repo

    async def get_details(self, id: UUID) -> Promo:
        promo = await self._promo_repo.get_by_id(id)
        if promo is None:
            raise NotFoundException("Promo tidak ada")
        return promo

    async def list_for_seller(
        self, store_id: UUID, page: int, page_size: int
    ) -> tuple[list[Promo], int]:
        limit = page_size
        offset = (page - 1) * page_size

        promos, total_count = await self._promo_repo.get_all_by_store(
            store_id=store_id, only_active=False, limit=limit, offset=offset
        )
        return promos, total_count

    async def list_for_public(
        self, store_id: UUID, page: int, page_size: int
    ) -> tuple[list[Promo], int]:
        limit = page_size
        offset = (page - 1) * page_size

        promos, total_count = await self._promo_repo.get_all_by_store(
            store_id=store_id, only_active=True, limit=limit, offset=offset
        )
        return promos, total_count

    async def create(self, store: Store, dto: CreatePromoDTO) -> Promo:
        existing = await self._promo_repo.get_by_code_and_store(
            dto.code.strip().upper(), store.id
        )
        if existing is not None:
            raise DomainException(
                f"Promo dengan kode {dto.code.strip().upper()} sudah ada"
            )

        promo = store.create_promo(
            dto.code,
            dto.type,
            dto.value,
            dto.start_date,
            dto.end_date,
            dto.max_usage,
            dto.max_discount_amount,
            dto.min_order_amount,
        )
        await self._promo_repo.save(promo)
        return promo

    async def update_information(self, promo: Promo, updates: dict[str, Any]) -> Promo:
        promo.change_information(
            code=updates.get("code", UNSET),
            type=updates.get("type", UNSET),
            value=updates.get("value", UNSET),
            max_usage=updates.get("max_usage", UNSET),
            start_date=updates.get("start_date", UNSET),
            end_date=updates.get("end_date", UNSET),
            max_discount_amount=updates.get("max_discount_amount", UNSET),
            min_order_amount=updates.get("min_order_amount", UNSET),
        )
        await self._promo_repo.update(promo)
        return promo

    async def validate_promo(
        self, code: str, store_id: UUID, order_amount: int
    ) -> tuple[UUID, int, int]:
        promo = await self._promo_repo.get_by_code_and_store(
            code.strip().upper(), store_id
        )
        if promo is None:
            raise NotFoundException("Promo tidak ada")
        if not promo.is_valid_at(datetime.now(UTC)):
            raise DomainException("Promo tidak aktif atau sudah kadaluwarsa")
        if not promo.has_quota():
            raise DomainException("Kuota promo sudah habis")
        if not promo.meets_minimum_order(order_amount):
            raise DomainException(
                f"Minimum pembelian untuk promo ini adalah Rp{promo.min_order_amount}"
            )

        discount_amount = promo.calculate_discount(order_amount)
        final_amount = order_amount - discount_amount
        return promo.id, discount_amount, final_amount

    async def delete(self, promo: Promo) -> None:
        promo.delete()
        await self._promo_repo.update(promo)
