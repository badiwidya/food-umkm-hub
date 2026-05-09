from typing import Any

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
        orders = []

        if category is not None:
            filters.append(ProductModel.category == category)
        if is_store_open is not None:
            filters.append(StoreModel.is_open == is_store_open)
        if is_product_available is not None:
            filters.append(ProductModel.is_available == is_product_available)
        if keyword is not None:
            search_term = f"%{keyword}"
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

        # TODO: refactor, kebanyakan join, inefficient, consider pake cascade soft delete
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
