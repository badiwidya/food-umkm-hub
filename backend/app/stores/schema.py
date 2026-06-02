from datetime import datetime
from uuid import UUID

from pydantic import field_validator

from app.schema import BaseSchema, PaginatedResponse
from app.stores.store import StoreApprovalStatus
from app.users.schema import UserDetailResponse


class StoreSummaryResponse(BaseSchema):
    id: UUID
    name: str
    photo_url: str | None
    is_open: bool
    rating: float | None
    total_reviews: int


class StoreDetailResponse(StoreSummaryResponse):
    description: str
    address: str
    qris_image_url: str | None
    maps_link: str | None
    approval_notes: str | None
    approval_status: StoreApprovalStatus
    updated_at: datetime
    created_at: datetime


class TopSellingProductResponse(BaseSchema):
    product_id: UUID
    product_name: str
    product_image: str | None
    quantity_sold: int
    revenue: int


class StoreDashboardResponse(BaseSchema):
    today_revenue: int
    total_orders: int
    total_products_sold: int
    store_rating: float | None
    review_count: int
    top_selling_products: list[TopSellingProductResponse]


class UpdateStoreRequest(BaseSchema):
    name: str | None = None
    description: str | None = None
    address: str | None = None
    photo_url: str | None = None
    qris_image_url: str | None = None
    maps_link: str | None = None

    @field_validator("name", "description", "address", mode="after")
    @classmethod
    def is_null(cls, v: str | None, info) -> str | None:
        if not v:
            raise ValueError(f"{info.field_name} tidak boleh kosong")
        return v


StoreListResponse = PaginatedResponse[list[StoreSummaryResponse]]


class StoreWithOwnerSummaryResponse(BaseSchema):
    id: UUID
    name: str
    photo_url: str | None
    rating: float | None
    total_reviews: int
    approval_status: StoreApprovalStatus
    owner: UserDetailResponse


class StoreWithOwnerDetailResponse(StoreWithOwnerSummaryResponse):
    description: str
    address: str
    qris_image_url: str | None
    maps_link: str | None
    approval_notes: str | None
    updated_at: datetime
    created_at: datetime


StoreWithOwnerListResponse = PaginatedResponse[list[StoreWithOwnerSummaryResponse]]


class RejectionNotesRequest(BaseSchema):
    notes: str | None = None
