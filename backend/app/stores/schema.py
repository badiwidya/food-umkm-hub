from datetime import datetime
from uuid import UUID

from pydantic import field_validator

from app.schema import BaseSchema, PaginatedResponse
from app.stores.enum import ApprovalStatus
from app.users.schema import UserResponse


class StoreResponse(BaseSchema):
    id: UUID
    name: str
    description: str
    address: str
    photo_url: str | None
    qris_image_url: str | None
    maps_link: str | None
    approval_status: ApprovalStatus
    approval_notes: str | None
    is_open: bool
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
            raise ValueError(f"{info.field_name} tidak boleh kosong.")
        return v


StoreListResponse = PaginatedResponse[list[StoreResponse]]


class StoreWithOwnerResponse(StoreResponse):
    owner: UserResponse


StoreWithOwnerListResponse = PaginatedResponse[list[StoreWithOwnerResponse]]


class RejectionNotesRequest(BaseSchema):
    notes: str | None = None
