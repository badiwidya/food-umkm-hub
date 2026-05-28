from datetime import datetime
from uuid import UUID

from pydantic import NonNegativeInt
from pydantic.functional_validators import field_validator

from app.promos.promo import PromoType
from app.schema import BaseSchema, PaginatedResponse


class CreatePromoRequest(BaseSchema):
    code: str
    type: PromoType
    value: int
    start_date: datetime
    end_date: datetime
    max_usage: NonNegativeInt | None = None
    max_discount_amount: NonNegativeInt | None = None
    min_order_amount: NonNegativeInt | None = None


class UpdatePromoRequest(BaseSchema):
    code: str | None = None
    type: PromoType | None = None
    value: int | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    max_usage: NonNegativeInt | None = None
    max_discount_amount: NonNegativeInt | None = None
    min_order_amount: NonNegativeInt | None = None

    @field_validator("code", mode="after")
    @classmethod
    def is_null(cls, v: str | None) -> str | None:
        if not v:
            raise ValueError("kode promo tidak boleh kosong")
        return v


class ValidatePromoRequest(BaseSchema):
    code: str
    store_id: UUID
    order_amount: NonNegativeInt


class PromoSummaryResponse(BaseSchema):
    id: UUID
    store_id: UUID
    code: str
    type: PromoType
    value: int
    max_discount_amount: int | None
    min_order_amount: int | None
    start_date: datetime
    end_date: datetime


PromoListResponse = PaginatedResponse[list[PromoSummaryResponse]]


class PromoDetailResponse(PromoSummaryResponse):
    max_usage: int | None
    usage_count: int
    updated_at: datetime
    created_at: datetime


class ValidatePromoResponse(BaseSchema):
    promo_id: UUID
    promo_code: str
    discount_amount: int
    final_amount: int
