from datetime import datetime
from decimal import Decimal
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, PlainSerializer

from app.products.enum import ProductCategory


# TODO: rating
class ProductSummaryResponse(BaseModel):
    id: UUID
    store_id: UUID
    store_name: str
    name: str
    price: Annotated[
        Decimal,
        PlainSerializer(lambda x: int(round(x)), return_type=int, when_used="json"),
    ]
    photo_url: str | None
    category: ProductCategory
    is_available: bool

    model_config = ConfigDict(from_attributes=True)


class Pagination(BaseModel):
    total: int
    page: int
    page_size: int


class ProductListResponse(BaseModel):
    metadata: Pagination
    data: list[ProductSummaryResponse]


class ProductDetailResponse(ProductSummaryResponse):
    description: str | None
    updated_at: datetime
    created_at: datetime


class CreateProductRequest(BaseModel):
    name: str
    price: Decimal
    category: ProductCategory
    photo_url: str | None = None
    description: str | None = None
