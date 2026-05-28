from dataclasses import dataclass
from datetime import datetime

from app.promos.promo import PromoType


@dataclass
class CreatePromoDTO:
    code: str
    type: PromoType
    value: int
    start_date: datetime
    end_date: datetime
    max_usage: int | None
    max_discount_amount: int | None
    min_order_amount: int | None
