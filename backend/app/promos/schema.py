from datetime import datetime
from uuid import UUID

from app.domains.promo import PromoType
from app.schema import BaseSchema, PaginatedResponse


class CreatePromoRequest(BaseSchema):
    code: str
    type: PromoType
    value: int
    start_date: datetime
    end_date: datetime
    max_usage: int | None = None
    max_discount_amount: int | None = None
    min_order_amount: int | None = None


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
