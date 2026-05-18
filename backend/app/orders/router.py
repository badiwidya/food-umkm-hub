from typing import Annotated

from fastapi import APIRouter, Query, status

from app.auth.dependency import CurrentStoreDep, CurrentStudentDep
from app.dependency import PaginationQueryDep
from app.domains.order import OrderStatus
from app.orders.dependency import (
    AuthorizedOrderTargetDep,
    AuthorizedStudentOrderTargetDep,
    OrderServiceDep,
)
from app.orders.dto import CreateOrderDTO, OrderItemDTO
from app.orders.schema import (
    ActiveOrderListResponse,
    CreateOrderRequest,
    OrderDetailResponse,
    OrderListResponse,
    OrderSummaryResponse,
    UpdatePaymentProofRequest,
)

order_router = APIRouter(prefix="/orders", tags=["Order"])
store_order_router = APIRouter(prefix="/stores", tags=["Order"])


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


@order_router.get("/", status_code=status.HTTP_200_OK)
async def get_orders_by_student(
    order_service: OrderServiceDep,
    student: CurrentStudentDep,
    pagination: PaginationQueryDep,
    status: Annotated[OrderStatus | None, Query()] = None,
) -> OrderListResponse:
    orders, total_count = await order_service.list_by_student(
        student=student,
        status=status,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return OrderListResponse(
        page=pagination.page,
        page_size=pagination.page_size,
        total=total_count,
        data=[OrderSummaryResponse.model_validate(order) for order in orders],
    )


@order_router.get("/{id}", status_code=status.HTTP_200_OK)
async def get_order_details(order: AuthorizedOrderTargetDep) -> OrderDetailResponse:
    return OrderDetailResponse.model_validate(order)


@order_router.post("/{id}/payment/proof", status_code=status.HTTP_200_OK)
async def update_payment_proof(
    order_service: OrderServiceDep,
    order: AuthorizedStudentOrderTargetDep,
    payload: UpdatePaymentProofRequest,
) -> OrderDetailResponse:
    order = await order_service.update_payment_proof(order, payload.payment_proof_url)
    return OrderDetailResponse.model_validate(order)


@order_router.post("/{id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_order(
    order_service: OrderServiceDep, order: AuthorizedStudentOrderTargetDep
) -> OrderDetailResponse:
    order = await order_service.cancel(order)
    return OrderDetailResponse.model_validate(order)


@store_order_router.get("/me/orders/active", status_code=status.HTTP_200_OK)
async def get_all_active(
    order_service: OrderServiceDep, store: CurrentStoreDep
) -> ActiveOrderListResponse:
    w, i, r = await order_service.list_active_for_seller(store)
    return ActiveOrderListResponse(
        waiting_for_confirmation=[
            OrderDetailResponse.model_validate(order) for order in w
        ],
        in_process=[OrderDetailResponse.model_validate(order) for order in i],
        ready_to_pickup=[OrderDetailResponse.model_validate(order) for order in r],
    )


@store_order_router.get("/me/orders", status_code=status.HTTP_200_OK)
async def get_all_seller(
    order_service: OrderServiceDep,
    store: CurrentStoreDep,
    pagination: PaginationQueryDep,
    status: Annotated[OrderStatus | None, Query()] = None,
) -> OrderListResponse:
    orders, count = await order_service.list_for_seller(
        store=store, status=status, page=pagination.page, page_size=pagination.page_size
    )
    return OrderListResponse(
        total=count,
        page=pagination.page,
        page_size=pagination.page_size,
        data=[OrderSummaryResponse.model_validate(order) for order in orders],
    )
