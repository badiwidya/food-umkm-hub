from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import UUID, uuid7

from app.exception import DomainException


@dataclass(kw_only=True)
class Review:
    id: UUID = field(default_factory=uuid7)
    order_id: UUID
    store_id: UUID
    product_id: UUID
    rating: int
    comment: str | None = None
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @classmethod
    def create(
        cls,
        order_id: UUID,
        store_id: UUID,
        product_id: UUID,
        rating: int,
        comment: str | None = None,
    ) -> Review:
        normalized_comment = comment.strip() if comment is not None else None
        if not (1 <= rating <= 5):
            raise DomainException("Rating harus berupa angka 1-5")
        return cls(
            order_id=order_id,
            store_id=store_id,
            product_id=product_id,
            rating=rating,
            comment=normalized_comment,
        )
