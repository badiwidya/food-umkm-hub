from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import Field

from app.domains.order import OrderStatus, PaymentMethod
from app.schema import BaseSchema, PaginatedResponse


class OrderItemRequest(BaseSchema):
    product_id: UUID
    quantity: Annotated[int, Field(gt=0)]


class CreateOrderRequest(BaseSchema):
    store_id: UUID
    payment_method: PaymentMethod
    order_items: Annotated[list[OrderItemRequest], Field(min_length=1)]
    promo_code: str | None = None
    notes: Annotated[str | None, Field(max_length=500)] = None


class UpdatePaymentProofRequest(BaseSchema):
    payment_proof_url: str


class RejectOrderRequest(BaseSchema):
    reason: str


class OrderItemResponse(BaseSchema):
    product_id: UUID
    product_name: str
    product_price: int
    quantity: int
    subtotal: int


# TODO: add store_name and store_image_url
class OrderSummaryResponse(BaseSchema):
    id: UUID
    student_id: UUID
    store_id: UUID
    payment_method: PaymentMethod
    status: OrderStatus
    order_items: list[OrderItemResponse]
    total_price: int


OrderListResponse = PaginatedResponse[list[OrderSummaryResponse]]


class OrderDetailResponse(OrderSummaryResponse):
    discount_amount: int
    promo_code: str | None
    notes: str | None
    payment_proof_url: str | None
    rejection_reason: str | None
    rejected_at: datetime | None
    expires_at: datetime
    created_at: datetime
    updated_at: datetime


class ActiveOrderListResponse(BaseSchema):
    waiting_for_confirmation: list[OrderDetailResponse]
    in_process: list[OrderDetailResponse]
    ready_to_pickup: list[OrderDetailResponse]
