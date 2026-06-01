from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.orders.model import OrderItemModel, OrderModel
from app.orders.order import Order, OrderItem, OrderStatus
from app.products.model import ProductModel
from app.stores.dto import TopSellingProductDTO


class OrderRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, id: UUID) -> Order | None:
        model = await self._session.scalar(
            select(OrderModel)
            .options(selectinload(OrderModel.order_items))
            .where(OrderModel.id == id)
        )
        if model is None:
            return None
        return self._to_entity(model)

    # TODO: dynamic order
    async def get_all_by_store(
        self,
        store_id: UUID,
        statuses: list[OrderStatus] | None,
        limit: int | None,
        offset: int | None,
    ) -> tuple[list[Order], int]:
        stmt = (
            select(OrderModel)
            .options(selectinload(OrderModel.order_items))
            .where(OrderModel.store_id == store_id)
        )
        count_stmt = (
            select(func.count())
            .select_from(OrderModel)
            .where(OrderModel.store_id == store_id)
        )

        if statuses is not None:
            stmt = stmt.where(OrderModel.status.in_(statuses))
            count_stmt = count_stmt.where(OrderModel.status.in_(statuses))
        stmt = stmt.order_by(OrderModel.created_at.asc(), OrderModel.id.asc())
        if offset is not None:
            stmt = stmt.offset(offset)
        if limit is not None:
            stmt = stmt.limit(limit)

        models = (await self._session.scalars(stmt)).all()
        count = await self._session.scalar(count_stmt)
        return [self._to_entity(model) for model in models], count or 0

    async def get_all_by_student(
        self, student_id: UUID, status: OrderStatus | None, offset: int, limit: int
    ) -> tuple[list[Order], int]:
        filters: list[Any] = [OrderModel.student_id == student_id]
        if status is not None:
            filters.append(OrderModel.status == status)

        stmt = (
            select(OrderModel)
            .options(selectinload(OrderModel.order_items))
            .where(*filters)
            .order_by(OrderModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        count_stmt = select(func.count()).select_from(OrderModel).where(*filters)

        models = (await self._session.scalars(stmt)).all()
        count = await self._session.scalar(count_stmt)
        return [self._to_entity(model) for model in models], count or 0

    async def get_completed_order_stats(
        self, store_id: UUID, today_start: datetime, today_end: datetime
    ) -> tuple[int, int]:
        stmt = select(
            func.coalesce(
                func.sum(OrderModel.total_price).filter(
                    OrderModel.completed_at >= today_start,
                    OrderModel.completed_at < today_end,
                ),
                0,
            ),
            func.count(OrderModel.id),
        ).where(
            OrderModel.store_id == store_id,
            OrderModel.status == OrderStatus.COMPLETED,
        )

        result = await self._session.execute(stmt)
        today_revenue, total_orders = result.one()
        return int(today_revenue or 0), int(total_orders or 0)

    async def get_completed_products_sold(self, store_id: UUID) -> int:
        stmt = (
            select(func.coalesce(func.sum(OrderItemModel.quantity), 0))
            .join(OrderModel, OrderModel.id == OrderItemModel.order_id)
            .where(
                OrderModel.store_id == store_id,
                OrderModel.status == OrderStatus.COMPLETED,
            )
        )

        total = await self._session.scalar(stmt)
        return int(total or 0)

    async def get_top_selling_products(
        self, store_id: UUID, limit: int
    ) -> list[TopSellingProductDTO]:
        quantity_sold = func.coalesce(func.sum(OrderItemModel.quantity), 0).label(
            "quantity_sold"
        )
        revenue = func.coalesce(func.sum(OrderItemModel.subtotal), 0).label("revenue")

        stmt = (
            select(
                OrderItemModel.product_id,
                ProductModel.name,
                ProductModel.photo_url,
                quantity_sold,
                revenue,
            )
            .join(OrderModel, OrderModel.id == OrderItemModel.order_id)
            .join(ProductModel, ProductModel.id == OrderItemModel.product_id)
            .where(
                OrderModel.store_id == store_id,
                OrderModel.status == OrderStatus.COMPLETED,
            )
            .group_by(
                OrderItemModel.product_id, ProductModel.name, ProductModel.photo_url
            )
            .order_by(revenue.desc(), quantity_sold.desc(), ProductModel.name.asc())
            .limit(limit)
        )

        rows = (await self._session.execute(stmt)).all()
        return [
            TopSellingProductDTO(
                product_id=row.product_id,
                product_name=row.name,
                product_image=row.photo_url,
                quantity_sold=int(row.quantity_sold or 0),
                revenue=int(row.revenue or 0),
            )
            for row in rows
        ]

    async def save(self, order: Order) -> None:
        model = self._to_model(order)
        self._session.add(model)

    async def update(self, order: Order) -> None:
        model = self._to_model(order)
        await self._session.merge(model)

    @staticmethod
    def _to_entity(model: OrderModel) -> Order:
        order_items = [
            OrderItem(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                product_name=item.product_name,
                product_price=item.product_price,
                quantity=item.quantity,
                subtotal=item.subtotal,
            )
            for item in model.order_items
        ]
        return Order(
            id=model.id,
            student_id=model.student_id,
            store_id=model.store_id,
            status=model.status,
            payment_method=model.payment_method,
            total_price=model.total_price,
            discount_amount=model.discount_amount,
            notes=model.notes,
            promo_id=model.promo_id,
            promo_code=model.promo_code,
            payment_proof_url=model.payment_proof_url,
            rejection_reason=model.rejection_reason,
            rejected_at=model.rejected_at,
            completed_at=model.completed_at,
            expires_at=model.expires_at,
            is_reviewed=False,
            created_at=model.created_at,
            updated_at=model.updated_at,
            order_items=order_items,
        )

    @staticmethod
    def _to_model(order: Order) -> OrderModel:
        order_items = [
            OrderItemModel(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                product_name=item.product_name,
                product_price=item.product_price,
                quantity=item.quantity,
                subtotal=item.subtotal,
            )
            for item in order.order_items
        ]
        return OrderModel(
            id=order.id,
            student_id=order.student_id,
            store_id=order.store_id,
            status=order.status,
            payment_method=order.payment_method,
            total_price=order.total_price,
            discount_amount=order.discount_amount,
            promo_code=order.promo_code,
            notes=order.notes,
            promo_id=order.promo_id,
            payment_proof_url=order.payment_proof_url,
            rejection_reason=order.rejection_reason,
            rejected_at=order.rejected_at,
            completed_at=order.completed_at,
            expires_at=order.expires_at,
            created_at=order.created_at,
            updated_at=order.updated_at,
            order_items=order_items,
        )
