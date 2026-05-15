from datetime import datetime
from uuid import UUID

from pydantic import NonNegativeInt, PlainSerializer, field_validator

from app.products.enum import ProductCategory
from app.schema import BaseSchema, PaginatedResponse


# TODO: rating
class ProductSummaryResponse(BaseSchema):
    id: UUID
    store_id: UUID
    store_name: str
    name: str
    price: NonNegativeInt

    photo_url: str | None
    category: ProductCategory
    is_available: bool


ProductListResponse = PaginatedResponse[list[ProductSummaryResponse]]


class ProductDetailResponse(ProductSummaryResponse):
    description: str | None
    updated_at: datetime
    created_at: datetime


class CreateProductRequest(BaseSchema):
    name: str
    price: NonNegativeInt
    category: ProductCategory
    photo_url: str | None = None
    description: str | None = None


class UpdateProductRequest(BaseSchema):
    name: str | None = None
    price: NonNegativeInt | None = None
    category: ProductCategory | None = None
    photo_url: str | None = None
    description: str | None = None

    @field_validator("name", mode="after")
    @classmethod
    def is_null(cls, v: str | None) -> str | None:
        if not v:
            raise ValueError("Nama tidak boleh kosong")
        return v


class UpdateAvailabilityRequest(BaseSchema):
    is_available: bool
