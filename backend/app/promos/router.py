from fastapi import APIRouter

from app.auth.dependency import CurrentStoreDep
from app.promos.dependency import PromoServiceDep
from app.promos.dto import CreatePromoDTO
from app.promos.schema import CreatePromoRequest, PromoDetailResponse

promo_router = APIRouter(tags=["Promo"])


@promo_router.post("/stores/me/promos")
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
