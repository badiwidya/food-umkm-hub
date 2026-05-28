from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import Field

from app.schema import BaseSchema, PaginatedResponse


class ReviewItemRequest(BaseSchema):
    product_id: UUID
    rating: Annotated[int, Field(ge=1, le=5)]
    comment: Annotated[str | None, Field(max_length=1000)] = None


class CreateReviewRequest(BaseSchema):
    reviews: Annotated[list[ReviewItemRequest], Field(min_length=1)]


class ReviewResponse(BaseSchema):
    id: UUID
    order_id: UUID
    product_id: UUID
    rating: int
    comment: str | None
    created_at: datetime
    updated_at: datetime


ReviewListResponse = PaginatedResponse[list[ReviewResponse]]
