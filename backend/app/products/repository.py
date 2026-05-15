from typing import Any
from uuid import UUID

from sqlalchemy import case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager

from app.products.entity import Product
from app.products.enum import ProductCategory
from app.products.model import ProductModel
from app.stores.model import StoreModel
from app.users.model import UserModel


class ProductRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_all(
        self,
        is_store_open: bool | None,
        is_product_available: bool | None,
        category: ProductCategory | None,
        keyword: str | None,
        offset: int,
        limit: int,
    ) -> tuple[list[Product], int]:
        filters: list[Any] = [
            UserModel.deleted_at.is_(None),
            ProductModel.deleted_at.is_(None),
        ]
        orders: list[Any] = [ProductModel.is_available.desc()]

        if category is not None:
            filters.append(ProductModel.category == category)
        if is_store_open is not None:
            filters.append(StoreModel.is_open == is_store_open)
        if is_product_available is not None:
            filters.append(ProductModel.is_available == is_product_available)
        self._apply_keyword(filters, orders, keyword)

        return await self._execute_paginated_query(filters, orders, offset, limit)

    async def get_all_by_store(
        self,
        store_id: UUID,
        is_product_available: bool | None,
        category: ProductCategory | None,
        keyword: str | None,
        offset: int,
        limit: int,
        is_owner: bool,
    ) -> tuple[list[Product], int]:
        filters: list[Any] = [
            UserModel.deleted_at.is_(None),
            ProductModel.deleted_at.is_(None),
            ProductModel.store_id == store_id,
        ]
        orders: list[Any] = []
        if not is_owner:
            orders.append(ProductModel.is_available.desc())
        if category is not None:
            filters.append(ProductModel.category == category)
        if is_product_available is not None:
            filters.append(ProductModel.is_available == is_product_available)
        self._apply_keyword(filters, orders, keyword)

        return await self._execute_paginated_query(filters, orders, offset, limit)

    async def get_by_id(self, id: UUID) -> Product | None:
        model = await self._session.scalar(
            select(ProductModel)
            .join(StoreModel)
            .join(UserModel)
            .options(contains_eager(ProductModel.store))
            .where(
                UserModel.deleted_at.is_(None),
                ProductModel.deleted_at.is_(None),
                ProductModel.id == id,
            )
        )
        if model is None:
            return None

        return self._to_entity(model)

    async def save(self, product: Product) -> None:
        model = self._to_model(product)
        self._session.add(model)

    async def update(self, product: Product) -> None:
        model = self._to_model(product)
        await self._session.merge(model)

    def _apply_keyword(
        self,
        filters: list[Any],
        orders: list[Any],
        keyword: str | None,
    ) -> None:
        if keyword is None:
            return
        search_term = f"%{keyword}%"
        filters.append(
            or_(
                ProductModel.name.ilike(search_term),
                ProductModel.description.ilike(search_term),
            )
        )
        orders.append(
            case(
                (ProductModel.name.ilike(search_term), 1),
                (ProductModel.description.ilike(search_term), 2),
                else_=3,
            ).asc()
        )

    async def _execute_paginated_query(
        self, filters: list[Any], orders: list[Any], offset: int, limit: int
    ) -> tuple[list[Product], int]:
        """Eksekusi query dan count"""
        stmt = (
            select(ProductModel)
            .join(StoreModel)
            .join(UserModel)
            .options(contains_eager(ProductModel.store))
            .where(*filters)
            .order_by(*orders, ProductModel.id.asc())
            .offset(offset)
            .limit(limit)
        )

        count_stmt = (
            select(func.count())
            .select_from(ProductModel)
            .join(StoreModel)
            .join(UserModel)
            .where(*filters)
        )

        models = (await self._session.scalars(stmt)).all()
        count = await self._session.scalar(count_stmt)

        return [self._to_entity(model) for model in models], count or 0

    @staticmethod
    def _to_entity(model: ProductModel) -> Product:
        return Product(
            id=model.id,
            store_id=model.store_id,
            store_name=model.store.name,
            name=model.name,
            price=model.price,
            category=model.category,
            description=model.description,
            photo_url=model.photo_url,
            is_available=model.is_available,
            created_at=model.created_at,
            updated_at=model.updated_at,
            deleted_at=model.deleted_at,
        )

    @staticmethod
    def _to_model(product: Product) -> ProductModel:
        return ProductModel(
            id=product.id,
            store_id=product.store_id,
            name=product.name,
            price=product.price,
            category=product.category,
            description=product.description,
            photo_url=product.photo_url,
            is_available=product.is_available,
            created_at=product.created_at,
            updated_at=product.updated_at,
            deleted_at=product.deleted_at,
        )
