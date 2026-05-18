from fastapi import APIRouter, status

from app.auth.dependency import CurrentStudentDep
from app.orders.dependency import OrderServiceDep
from app.orders.dto import CreateOrderDTO, OrderItemDTO
from app.orders.schema import CreateOrderRequest, OrderDetailResponse

order_router = APIRouter(prefix="/orders", tags=["Order"])


@order_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(
    order_service: OrderServiceDep,
    student: CurrentStudentDep,
    payload: CreateOrderRequest,
) -> OrderDetailResponse:
    order_items_dto = [
        OrderItemDTO(product_id=item.product_id, quantity=item.quantity)
        for item in payload.order_items
    ]
    dto = CreateOrderDTO(
        store_id=payload.store_id,
        payment_method=payload.payment_method,
        order_items=order_items_dto,
        promo_code=payload.promo_code,
        notes=payload.notes,
    )

    order = await order_service.create(student, dto)
    return OrderDetailResponse.model_validate(order)
