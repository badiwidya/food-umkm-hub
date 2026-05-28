from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import UUID


@dataclass(kw_only=True)
class StoreFavorite:
    student_id: UUID
    store_id: UUID
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass(kw_only=True)
class ProductFavorite:
    student_id: UUID
    product_id: UUID
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
