from datetime import datetime
from uuid import UUID

from pydantic import field_validator

from app.schema import BaseSchema, PaginatedResponse
from app.stores.store import StoreApprovalStatus
from app.users.schema import UserResponse


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
    updated_at: datetime
    created_at: datetime


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
    owner: UserResponse


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
