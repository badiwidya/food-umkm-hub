import logging

from app.domains.promo import Promo
from app.domains.store import Store
from app.exception import DomainException
from app.promos.dto import CreatePromoDTO
from app.promos.repository import PromoRepository


class PromoService:
    def __init__(self, promo_repo: PromoRepository) -> None:
        self._promo_repo = promo_repo

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
