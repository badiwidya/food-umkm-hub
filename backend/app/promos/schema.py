from datetime import datetime
from uuid import UUID

from app.domains.promo import PromoType
from app.schema import BaseSchema


class CreatePromoRequest(BaseSchema):
    code: str
    type: PromoType
    value: int
    start_date: datetime
    end_date: datetime
    max_usage: int | None = None
    max_discount_amount: int | None = None
    min_order_amount: int | None = None


class PromoDetailResponse(BaseSchema):
    id: UUID
    store_id: UUID
    code: str
    type: PromoType
    value: int
    max_discount_amount: int | None
    min_order_amount: int | None
    max_usage: int | None
    usage_count: int
    start_date: datetime
    end_date: datetime
    updated_at: datetime
    created_at: datetime
