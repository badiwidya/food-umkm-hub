from typing import Any
from uuid import UUID

from sqlalchemy import case, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager
from sqlalchemy.sql import func
from sqlalchemy.sql.operators import or_

from app.stores.model import StoreModel
from app.stores.store import Store, StoreApprovalStatus
from app.users.model import UserModel
from app.users.seller import Seller


class StoreRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, store_id: UUID) -> Store | None:
        model = await self._session.scalar(
            select(StoreModel)
            .join(StoreModel.owner)
            .options(contains_eager(StoreModel.owner))
            .where(StoreModel.id == store_id, UserModel.deleted_at.is_(None))
        )

        if model is None:
            return None

        return self._to_entity(model)

    async def get_by_owner_id(self, owner_id: UUID) -> Store | None:
        model = await self._session.scalar(
            select(StoreModel)
            .join(StoreModel.owner)
            .options(contains_eager(StoreModel.owner))
            .where(StoreModel.owner_id == owner_id, UserModel.deleted_at.is_(None))
        )

        if model is None:
            return None

        return self._to_entity(model)

    async def get_all(
        self,
        is_open: bool | None,
        status: StoreApprovalStatus | None,
        keyword: str | None,
        offset: int,
        limit: int,
    ) -> tuple[list[Store], int]:
        filters: list[Any] = [UserModel.deleted_at.is_(None)]
        orders: list[Any] = []

        if is_open is not None:
            filters.append(StoreModel.is_open == is_open)
        if status is not None:
            filters.append(StoreModel.approval_status == status)
        if keyword is not None:
            search_term = f"%{keyword}%"
            filters.append(
                or_(
                    StoreModel.name.ilike(search_term),
                    StoreModel.description.ilike(search_term),
                )
            )
            orders.append(
                case(
                    (StoreModel.name.ilike(search_term), 1),
                    (StoreModel.description.ilike(search_term), 2),
                    else_=3,
                ).asc()
            )

        return await self._execute_paginated_query(filters, orders, offset, limit)

    async def save(self, store: Store) -> None:
        model = self._to_model(store)
        self._session.add(model)

    async def update(self, store: Store) -> None:
        model = self._to_model(store)
        await self._session.merge(model)

    async def _execute_paginated_query(
        self,
        filters: list[Any],
        orders: list[Any],
        offset: int,
        limit: int,
    ) -> tuple[list[Store], int]:
        stmt = (
            select(StoreModel)
            .join(StoreModel.owner)
            .options(contains_eager(StoreModel.owner))
            .where(*filters)
            .order_by(*orders, StoreModel.id.asc())
            .offset(offset)
            .limit(limit)
        )
        count_stmt = (
            select(func.count())
            .select_from(StoreModel)
            .join(StoreModel.owner)
            .where(*filters)
        )

        models = (await self._session.scalars(stmt)).all()
        count = await self._session.scalar(count_stmt)

        return [self._to_entity(model) for model in models], count or 0

    @staticmethod
    def _to_entity(model: StoreModel) -> Store:
        seller = Seller(
            id=model.owner.id,
            store=None,
            full_name=model.owner.full_name,
            avatar_url=model.owner.avatar_url,
            email=model.owner.email,
            pending_email=model.owner.pending_email,
            phone_number=model.owner.phone_number,
            password_hash=model.owner.password_hash,
            role=model.owner.role,
            status=model.owner.status,
            email_verified_at=model.owner.email_verified_at,
            phone_verified_at=model.owner.phone_verified_at,
            updated_at=model.owner.updated_at,
            created_at=model.owner.created_at,
            deleted_at=model.owner.deleted_at,
        )

        store = Store(
            id=model.id,
            name=model.name,
            owner=seller,
            description=model.description,
            address=model.address,
            photo_url=model.photo_url,
            qris_image_url=model.qris_image_url,
            maps_link=model.maps_link,
            approval_status=model.approval_status,
            approval_notes=model.approval_notes,
            is_open=model.is_open,
            rating=float(model.rating) if model.rating else None,
            total_reviews=model.total_reviews,
            updated_at=model.updated_at,
            created_at=model.created_at,
        )

        seller.store = store
        return store

    @staticmethod
    def _to_model(store: Store) -> StoreModel:
        return StoreModel(
            id=store.id,
            owner_id=store.owner.id,
            name=store.name,
            description=store.description,
            address=store.address,
            photo_url=store.photo_url,
            qris_image_url=store.qris_image_url,
            maps_link=store.maps_link,
            approval_status=store.approval_status,
            approval_notes=store.approval_notes,
            is_open=store.is_open,
            rating=store.rating,
            total_reviews=store.total_reviews,
            updated_at=store.updated_at,
            created_at=store.created_at,
        )
