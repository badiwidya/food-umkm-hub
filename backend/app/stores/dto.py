from dataclasses import dataclass
from uuid import UUID


@dataclass(kw_only=True)
class TopSellingProductDTO:
    product_id: UUID
    product_name: str
    product_image: str | None
    quantity_sold: int
    revenue: int


@dataclass(kw_only=True)
class StoreDashboardDTO:
    today_revenue: int
    total_orders: int
    total_products_sold: int
    store_rating: float | None
    review_count: int
    top_selling_products: list[TopSellingProductDTO]
