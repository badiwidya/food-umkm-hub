from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.promo import Promo
from app.promos.model import PromoModel


class PromoRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_code_and_store(self, code: str, store_id: UUID) -> Promo | None:
        model = await self._session.scalar(
            select(PromoModel).where(
                PromoModel.code == code,
                PromoModel.store_id == store_id,
                PromoModel.deleted_at.is_(None),
            )
        )
        if model is None:
            return None
        return self._to_entity(model)

    async def save(self, promo: Promo) -> None:
        model = self._to_model(promo)
        self._session.add(model)

    async def update(self, promo: Promo) -> None:
        model = self._to_model(promo)
        await self._session.merge(model)

    async def update_usage(self, promo: Promo, old_usage_count: int) -> bool:
        result = await self._session.scalar(
            update(PromoModel)
            .where(
                PromoModel.id == promo.id,
                PromoModel.store_id == promo.store_id,
                PromoModel.usage_count == old_usage_count,
            )
            .values(usage_count=promo.usage_count, updated_at=promo.updated_at)
        )
        return result.rowcount > 0

    @staticmethod
    def _to_entity(model: PromoModel) -> Promo:
        return Promo(
            id=model.id,
            store_id=model.store_id,
            code=model.code,
            type=model.type,
            value=model.value,
            max_discount_amount=model.max_discount_amount,
            min_order_amount=model.min_order_amount,
            start_date=model.start_date,
            end_date=model.end_date,
            max_usage=model.max_usage,
            usage_count=model.usage_count,
            deleted_at=model.deleted_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_model(promo: Promo) -> PromoModel:
        return PromoModel(
            id=promo.id,
            store_id=promo.store_id,
            code=promo.code,
            type=promo.type,
            value=promo.value,
            max_discount_amount=promo.max_discount_amount,
            min_order_amount=promo.min_order_amount,
            start_date=promo.start_date,
            end_date=promo.end_date,
            max_usage=promo.max_usage,
            usage_count=promo.usage_count,
            deleted_at=promo.deleted_at,
            created_at=promo.created_at,
            updated_at=promo.updated_at,
        )
