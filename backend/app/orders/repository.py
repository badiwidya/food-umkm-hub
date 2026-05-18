from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.order import Order, OrderItem
from app.orders.model import OrderItemModel, OrderModel


class OrderRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

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
            payment_proof_url=model.payment_proof_url,
            rejection_reason=model.rejection_reason,
            rejected_at=model.rejected_at,
            expires_at=model.expires_at,
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
            notes=order.notes,
            promo_id=order.promo_id,
            payment_proof_url=order.payment_proof_url,
            rejection_reason=order.rejection_reason,
            rejected_at=order.rejected_at,
            expires_at=order.expires_at,
            created_at=order.created_at,
            updated_at=order.updated_at,
            order_items=order_items,
        )
