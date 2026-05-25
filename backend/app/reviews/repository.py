from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.review import Review
from app.products.model import ProductModel
from app.reviews.model import ReviewModel
from app.stores.model import StoreModel


class ReviewRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save_many(self, reviews: list[Review]) -> None:
        models = [self._to_model(review) for review in reviews]
        self._session.add_all(models)
        await self._session.flush()

    async def get_all_by_order(self, order_id: UUID) -> list[Review]:
        models = (
            await self._session.scalars(
                select(ReviewModel)
                .where(ReviewModel.order_id == order_id)
                .order_by(ReviewModel.created_at.desc(), ReviewModel.id.desc())
            )
        ).all()
        return [self._to_entity(model) for model in models]

    async def get_all_by_product(
        self, product_id: UUID, offset: int, limit: int
    ) -> tuple[list[Review], int]:
        return await self._get_paginated(
            ReviewModel.product_id == product_id, offset=offset, limit=limit
        )

    async def get_all_by_store(
        self, store_id: UUID, offset: int, limit: int
    ) -> tuple[list[Review], int]:
        return await self._get_paginated(
            ReviewModel.store_id == store_id, offset=offset, limit=limit
        )

    async def get_reviewed_product_ids(self, order_id: UUID) -> set[UUID]:
        product_ids = (
            await self._session.scalars(
                select(ReviewModel.product_id).where(ReviewModel.order_id == order_id)
            )
        ).all()
        return set(product_ids)

    async def recalculate_product_rating(self, product_id: UUID) -> None:
        rating, total_reviews = await self._get_rating_stats(
            ReviewModel.product_id == product_id
        )
        await self._session.execute(
            update(ProductModel)
            .where(ProductModel.id == product_id)
            .values(rating=rating, total_reviews=total_reviews)
        )

    async def recalculate_store_rating(self, store_id: UUID) -> None:
        rating, total_reviews = await self._get_rating_stats(
            ReviewModel.store_id == store_id
        )
        await self._session.execute(
            update(StoreModel)
            .where(StoreModel.id == store_id)
            .values(rating=rating, total_reviews=total_reviews)
        )

    async def _get_paginated(
        self, *filters, offset: int, limit: int
    ) -> tuple[list[Review], int]:
        stmt = (
            select(ReviewModel)
            .where(*filters)
            .order_by(ReviewModel.created_at.desc(), ReviewModel.id.desc())
            .offset(offset)
            .limit(limit)
        )
        count_stmt = select(func.count()).select_from(ReviewModel).where(*filters)

        models = (await self._session.scalars(stmt)).all()
        count = await self._session.scalar(count_stmt)
        return [self._to_entity(model) for model in models], count or 0

    async def _get_rating_stats(self, *filters) -> tuple[float | None, int]:
        stmt = select(func.avg(ReviewModel.rating), func.count()).where(*filters)
        result = await self._session.execute(stmt)
        average, total_reviews = result.one()
        rating = round(float(average), 1) if average is not None else None
        return rating, total_reviews

    @staticmethod
    def _to_entity(model: ReviewModel) -> Review:
        return Review(
            id=model.id,
            store_id=model.store_id,
            order_id=model.order_id,
            student_id=model.student_id,
            product_id=model.product_id,
            rating=model.rating,
            comment=model.comment,
            updated_at=model.updated_at,
            created_at=model.created_at,
        )

    @staticmethod
    def _to_model(review: Review) -> ReviewModel:
        return ReviewModel(
            id=review.id,
            store_id=review.store_id,
            order_id=review.order_id,
            student_id=review.student_id,
            product_id=review.product_id,
            rating=review.rating,
            comment=review.comment,
            updated_at=review.updated_at,
            created_at=review.created_at,
        )
