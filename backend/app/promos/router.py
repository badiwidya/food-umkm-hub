from uuid import UUID

from fastapi import APIRouter, status

from app.auth.dependency import CurrentStoreDep
from app.dependency import PaginationQueryDep
from app.promos.dependency import AuthorizedPromoTargetDep, PromoServiceDep
from app.promos.dto import CreatePromoDTO
from app.promos.schema import (
    CreatePromoRequest,
    PromoDetailResponse,
    PromoListResponse,
    PromoSummaryResponse,
    UpdatePromoRequest,
    ValidatePromoRequest,
    ValidatePromoResponse,
)

promo_router = APIRouter(prefix="/promos", tags=["Promo"])
store_promo_router = APIRouter(prefix="/stores", tags=["Promo"])


@promo_router.post("/", status_code=status.HTTP_201_CREATED)
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


@promo_router.post("/validate", status_code=status.HTTP_200_OK)
async def validate_promo(
    promo_service: PromoServiceDep, payload: ValidatePromoRequest
) -> ValidatePromoResponse:
    promo_id, discount_amount, final_amount = await promo_service.validate_promo(
        payload.code, payload.store_id, payload.order_amount
    )

    return ValidatePromoResponse(
        promo_id=promo_id,
        promo_code=payload.code,
        discount_amount=discount_amount,
        final_amount=final_amount,
    )


@promo_router.get("/{id}", status_code=status.HTTP_200_OK)
async def get_promo_details(
    promo_service: PromoServiceDep, id: UUID
) -> PromoDetailResponse:
    promo = await promo_service.get_details(id)
    return PromoDetailResponse.model_validate(promo)


@promo_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_promo(
    promo_service: PromoServiceDep, promo: AuthorizedPromoTargetDep
) -> None:
    await promo_service.delete(promo)


@promo_router.patch("/{id}", status_code=status.HTTP_200_OK)
async def update_promo_information(
    promo_service: PromoServiceDep,
    promo: AuthorizedPromoTargetDep,
    payload: UpdatePromoRequest,
) -> PromoDetailResponse:
    promo = await promo_service.update_information(
        promo, payload.model_dump(exclude_unset=True)
    )
    return PromoDetailResponse.model_validate(promo)


@store_promo_router.get("/me/promos", status_code=status.HTTP_200_OK)
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


@store_promo_router.get("/{store_id}/promos", status_code=status.HTTP_200_OK)
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
