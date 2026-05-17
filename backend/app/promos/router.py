from uuid import UUID

from fastapi import APIRouter
from starlette.status import HTTP_200_OK

from app.auth.dependency import CurrentStoreDep
from app.dependency import PaginationQueryDep
from app.promos.dependency import PromoServiceDep
from app.promos.dto import CreatePromoDTO
from app.promos.schema import (
    CreatePromoRequest,
    PromoDetailResponse,
    PromoListResponse,
    PromoSummaryResponse,
)

promo_router = APIRouter(tags=["Promo"])


@promo_router.post("/stores/me/promos", status_code=HTTP_200_OK)
async def create_promo(
    promo_service: PromoServiceDep, store: CurrentStoreDep, payload: CreatePromoRequest
) -> PromoDetailResponse:
    dto = CreatePromoDTO(
        code=payload.code,
        type=payload.type,
        value=payload.value,
        start_date=payload.start_date,
        end_date=payload.end_date,
        max_usage=payload.max_usage,
        max_discount_amount=payload.max_discount_amount,
        min_order_amount=payload.min_order_amount,
    )
    promo = await promo_service.create(store, dto)
    return PromoDetailResponse.model_validate(promo)


@promo_router.get("/stores/me/promos", status_code=HTTP_200_OK)
async def get_all_me(
    promo_service: PromoServiceDep,
    store: CurrentStoreDep,
    pagination: PaginationQueryDep,
) -> PromoListResponse:
    promos, count = await promo_service.list_for_seller(
        store.id, pagination.page, pagination.page_size
    )

    return PromoListResponse(
        page=pagination.page,
        page_size=pagination.page_size,
        total=count,
        data=[PromoSummaryResponse.model_validate(promo) for promo in promos],
    )


@promo_router.get("/stores/{store_id}/promos", status_code=HTTP_200_OK)
async def get_all_promo(
    promo_service: PromoServiceDep,
    store_id: UUID,
    pagination: PaginationQueryDep,
) -> PromoListResponse:
    promos, count = await promo_service.list_for_public(
        store_id, pagination.page, pagination.page_size
    )

    return PromoListResponse(
        page=pagination.page,
        page_size=pagination.page_size,
        total=count,
        data=[PromoSummaryResponse.model_validate(promo) for promo in promos],
    )
