from dataclasses import dataclass
from uuid import UUID

from app.orders.order import PaymentMethod


@dataclass
class OrderItemDTO:
    product_id: UUID
    quantity: int


@dataclass(kw_only=True)
class CreateOrderDTO:
    store_id: UUID
    payment_method: PaymentMethod
    order_items: list[OrderItemDTO]
    promo_code: str | None
    notes: str | None
