from uuid import UUID

from app.domains.promo import Promo
from app.domains.store import Store
from app.exception import DomainException
from app.promos.dto import CreatePromoDTO
from app.promos.repository import PromoRepository


class PromoService:
    def __init__(self, promo_repo: PromoRepository) -> None:
        self._promo_repo = promo_repo

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
        print(f"code: {dto.code}")
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
