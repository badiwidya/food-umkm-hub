from typing import Any
from uuid import UUID

from sqlalchemy import Select, case, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager
from sqlalchemy.sql import func
from sqlalchemy.sql.operators import or_

from app.stores.dto import StoreWithOwner
from app.stores.entity import Store
from app.stores.enum import ApprovalStatus
from app.stores.model import StoreModel
from app.users.model import UserModel
from app.users.repository import UserRepository


class StoreRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, store_id: UUID) -> Store | None:
        model = await self._session.scalar(
            select(StoreModel)
            .join(StoreModel.owner)
            .where(StoreModel.id == store_id, UserModel.deleted_at.is_(None))
        )

        if model is None:
            return None

        return self._to_entity(model)

    async def get_by_id_with_owner(self, store_id: UUID) -> StoreWithOwner | None:
        model = await self._session.scalar(
            select(StoreModel)
            .join(StoreModel.owner)
            .options(contains_eager(StoreModel.owner))
            .where(StoreModel.id == store_id, UserModel.deleted_at.is_(None))
        )

        if model is None:
            return None

        return StoreWithOwner(
            store=self._to_entity(model), owner=UserRepository.to_entity(model.owner)
        )

    async def get_by_owner_id(self, owner_id: UUID) -> StoreWithOwner | None:
        model = await self._session.scalar(
            select(StoreModel)
            .join(StoreModel.owner)
            .options(contains_eager(StoreModel.owner))
            .where(StoreModel.owner_id == owner_id, UserModel.deleted_at.is_(None))
        )

        if model is None:
            return None

        return StoreWithOwner(
            store=self._to_entity(model), owner=UserRepository.to_entity(model.owner)
        )

    async def get_all(
        self,
        status: ApprovalStatus | None = None,
        keyword: str | None = None,
        offset: int = 0,
        limit: int = 12,
    ) -> tuple[list[Store], int]:
        stmt, count_stmt = self._build_get_all_query(
            status=status, keyword=keyword, offset=offset, limit=limit
        )

        models = (await self._session.scalars(stmt)).all()
        count = await self._session.scalar(count_stmt)

        return [self._to_entity(model) for model in models], (count or 0)

    async def get_all_with_owner(
        self,
        status: ApprovalStatus | None = None,
        keyword: str | None = None,
        offset: int = 0,
        limit: int = 12,
    ) -> tuple[list[StoreWithOwner], int]:
        stmt, count_stmt = self._build_get_all_query(
            status=status, keyword=keyword, offset=offset, limit=limit
        )
        stmt = stmt.options(contains_eager(StoreModel.owner))

        models = (await self._session.scalars(stmt)).all()
        count = await self._session.scalar(count_stmt)

        return [
            StoreWithOwner(
                store=self._to_entity(model),
                owner=UserRepository.to_entity(model.owner),
            )
            for model in models
        ], (count or 0)

    async def save(self, store: Store) -> None:
        model = self._to_model(store)
        self._session.add(model)

    async def update(self, store: Store) -> None:
        model = self._to_model(store)
        await self._session.merge(model)

    def _build_get_all_query(
        self,
        status: ApprovalStatus | None,
        keyword: str | None,
        offset: int,
        limit: int,
    ) -> tuple[Select, Select]:
        filters: list[Any] = [UserModel.deleted_at.is_(None)]
        orders: list[Any] = []

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

        stmt = (
            select(StoreModel)
            .join(StoreModel.owner)
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

        return stmt, count_stmt

    @staticmethod
    def _to_entity(model: StoreModel) -> Store:
        return Store(
            id=model.id,
            owner_id=model.owner_id,
            name=model.name,
            description=model.description,
            address=model.address,
            photo_url=model.photo_url,
            qris_image_url=model.qris_image_url,
            maps_link=model.maps_link,
            approval_status=model.approval_status,
            approval_notes=model.approval_notes,
            is_open=model.is_open,
            updated_at=model.updated_at,
            created_at=model.created_at,
        )

    @staticmethod
    def _to_model(store: Store) -> StoreModel:
        return StoreModel(
            id=store.id,
            owner_id=store.owner_id,
            name=store.name,
            description=store.description,
            address=store.address,
            photo_url=store.photo_url,
            qris_image_url=store.qris_image_url,
            maps_link=store.maps_link,
            approval_status=store.approval_status,
            approval_notes=store.approval_notes,
            is_open=store.is_open,
            updated_at=store.updated_at,
            created_at=store.created_at,
        )
