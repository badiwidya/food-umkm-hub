from typing import Any
from uuid import UUID

from sqlalchemy import delete, exists, func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager

from app.favorites.favorite import ProductFavorite, StoreFavorite
from app.favorites.model import ProductFavoriteModel, StoreFavoriteModel
from app.products.model import ProductModel
from app.products.product import Product
from app.products.repository import ProductRepository
from app.stores.model import StoreModel
from app.stores.repository import StoreRepository
from app.stores.store import Store, StoreApprovalStatus
from app.users.model import UserModel
from app.users.user import UserStatus


class FavoriteRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_stores(
        self, student_id: UUID, offset: int, limit: int
    ) -> tuple[list[Store], int]:
        filters = [
            StoreFavoriteModel.student_id == student_id,
            *self._store_visibility_filters(),
        ]
        stmt = (
            select(StoreModel)
            .join(StoreFavoriteModel, StoreFavoriteModel.store_id == StoreModel.id)
            .join(StoreModel.owner)
            .options(contains_eager(StoreModel.owner))
            .where(*filters)
            .order_by(StoreFavoriteModel.created_at.desc(), StoreModel.id.asc())
            .offset(offset)
            .limit(limit)
        )
        count_stmt = (
            select(func.count())
            .select_from(StoreFavoriteModel)
            .join(StoreModel, StoreFavoriteModel.store_id == StoreModel.id)
            .join(UserModel, StoreModel.owner_id == UserModel.id)
            .where(*filters)
        )

        models = (await self._session.scalars(stmt)).all()
        count = await self._session.scalar(count_stmt)
        return [StoreRepository._to_entity(model) for model in models], count or 0

    async def add_store(self, favorite: StoreFavorite) -> None:
        stmt = (
            insert(StoreFavoriteModel)
            .values(
                student_id=favorite.student_id,
                store_id=favorite.store_id,
                created_at=favorite.created_at,
            )
            .on_conflict_do_nothing(index_elements=["student_id", "store_id"])
        )
        await self._session.execute(stmt)

    async def remove_store(self, student_id: UUID, store_id: UUID) -> None:
        await self._session.execute(
            delete(StoreFavoriteModel).where(
                StoreFavoriteModel.student_id == student_id,
                StoreFavoriteModel.store_id == store_id,
            )
        )

    async def is_store_favorited(self, student_id: UUID, store_id: UUID) -> bool:
        result = await self._session.scalar(
            select(
                exists().where(
                    StoreFavoriteModel.student_id == student_id,
                    StoreFavoriteModel.store_id == store_id,
                )
            )
        )
        return bool(result)

    async def public_store_exists(self, store_id: UUID) -> bool:
        store = await self._session.scalar(
            select(StoreModel.id)
            .join(UserModel, StoreModel.owner_id == UserModel.id)
            .where(StoreModel.id == store_id, *self._store_visibility_filters())
        )
        return store is not None

    async def list_products(
        self, student_id: UUID, offset: int, limit: int
    ) -> tuple[list[Product], int]:
        filters = [
            ProductFavoriteModel.student_id == student_id,
            *self._product_visibility_filters(),
        ]
        stmt = (
            select(ProductModel)
            .join(
                ProductFavoriteModel, ProductFavoriteModel.product_id == ProductModel.id
            )
            .join(ProductModel.store)
            .join(StoreModel.owner)
            .options(contains_eager(ProductModel.store))
            .where(*filters)
            .order_by(ProductFavoriteModel.created_at.desc(), ProductModel.id.asc())
            .offset(offset)
            .limit(limit)
        )
        count_stmt = (
            select(func.count())
            .select_from(ProductFavoriteModel)
            .join(ProductModel, ProductFavoriteModel.product_id == ProductModel.id)
            .join(StoreModel, ProductModel.store_id == StoreModel.id)
            .join(UserModel, StoreModel.owner_id == UserModel.id)
            .where(*filters)
        )

        models = (await self._session.scalars(stmt)).all()
        count = await self._session.scalar(count_stmt)
        return [ProductRepository._to_entity(model) for model in models], count or 0

    async def add_product(self, favorite: ProductFavorite) -> None:
        stmt = (
            insert(ProductFavoriteModel)
            .values(
                student_id=favorite.student_id,
                product_id=favorite.product_id,
                created_at=favorite.created_at,
            )
            .on_conflict_do_nothing(index_elements=["student_id", "product_id"])
        )
        await self._session.execute(stmt)

    async def remove_product(self, student_id: UUID, product_id: UUID) -> None:
        await self._session.execute(
            delete(ProductFavoriteModel).where(
                ProductFavoriteModel.student_id == student_id,
                ProductFavoriteModel.product_id == product_id,
            )
        )

    async def is_product_favorited(self, student_id: UUID, product_id: UUID) -> bool:
        result = await self._session.scalar(
            select(
                exists().where(
                    ProductFavoriteModel.student_id == student_id,
                    ProductFavoriteModel.product_id == product_id,
                )
            )
        )
        return bool(result)

    async def public_product_exists(self, product_id: UUID) -> bool:
        product = await self._session.scalar(
            select(ProductModel.id)
            .join(StoreModel, ProductModel.store_id == StoreModel.id)
            .join(UserModel, StoreModel.owner_id == UserModel.id)
            .where(ProductModel.id == product_id, *self._product_visibility_filters())
        )
        return product is not None

    @staticmethod
    def _store_visibility_filters() -> list[Any]:
        return [
            StoreModel.approval_status == StoreApprovalStatus.APPROVED,
            UserModel.status == UserStatus.ACTIVE,
            UserModel.deleted_at.is_(None),
        ]

    @staticmethod
    def _product_visibility_filters() -> list[Any]:
        return [
            ProductModel.deleted_at.is_(None),
            ProductModel.is_available.is_(True),
            StoreModel.approval_status == StoreApprovalStatus.APPROVED,
            UserModel.status == UserStatus.ACTIVE,
            UserModel.deleted_at.is_(None),
        ]
