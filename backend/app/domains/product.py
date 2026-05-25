from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID, uuid7

from app.exception import DomainException
from app.sentinel import UNSET, TUnset

if TYPE_CHECKING:
    from app.domains.store import Store


class ProductCategory(StrEnum):
    FOOD = "food"
    DRINK = "drink"
    SNACK = "snack"
    OTHER = "other"


# Pembakaian class StoreSummary untuk class product agar menghindari nested coposite yang
# terlalu dalam serta menghindari load terlalu banyak di database
@dataclass(kw_only=True)
class StoreSummary:
    id: UUID
    name: str
    photo_url: str | None
    rating: float | None = None
    total_reviews: int = 0


@dataclass(kw_only=True)
class Product:
    id: UUID = field(default_factory=uuid7)
    store: StoreSummary
    name: str
    description: str | None = None
    price: int
    photo_url: str | None = None
    category: ProductCategory
    is_available: bool = False
    rating: float | None = None
    total_reviews: int = 0
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    deleted_at: datetime | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    @classmethod
    def create(
        cls,
        store: Store,
        name: str,
        price: int,
        category: ProductCategory,
        description: str | None = None,
        photo_url: str | None = None,
    ) -> Product:
        if price <= 0:
            raise DomainException("Harga produk harus lebih dari 0")

        normalized_name = name.strip()
        if not normalized_name:
            raise DomainException("Nama produk tidak boleh kosong")

        normalized_desc = description.strip() if description is not None else None
        normalized_photo = photo_url.strip() if photo_url is not None else None

        return cls(
            store=StoreSummary(id=store.id, name=store.name, photo_url=store.photo_url),
            name=normalized_name,
            price=price,
            category=category,
            description=normalized_desc,
            photo_url=normalized_photo,
        )

    def change_information(
        self,
        name: str | TUnset = UNSET,
        price: int | TUnset = UNSET,
        category: ProductCategory | TUnset = UNSET,
        description: str | None | TUnset = UNSET,
        photo_url: str | None | TUnset = UNSET,
    ) -> None:
        has_changed = False

        if not isinstance(name, TUnset):
            normalized_name = name.strip()
            if not normalized_name:
                raise DomainException("Nama produk tidak boleh kosong")
            if normalized_name != self.name:
                self.name = normalized_name
                has_changed = True

        if not isinstance(price, TUnset):
            if price <= 0:
                raise DomainException("Harga produk harus lebih dari 0")
            if price != self.price:
                self.price = price
                has_changed = True

        if not isinstance(category, TUnset):
            if category != self.category:
                self.category = category
                has_changed = True

        if not isinstance(description, TUnset):
            normalized_desc = description.strip() if description is not None else None
            if normalized_desc != self.description:
                self.description = normalized_desc
                has_changed = True

        if not isinstance(photo_url, TUnset):
            normalized_photo = photo_url.strip() if photo_url is not None else None
            if normalized_photo != self.photo_url:
                self.photo_url = normalized_photo
                has_changed = True

        if has_changed:
            self._touch()

    def mark_as_available(self) -> None:
        if self.is_available:
            return
        self.is_available = True
        self._touch()

    def mark_as_unavailable(self) -> None:
        if not self.is_available:
            return
        self.is_available = False
        self._touch()

    def delete(self) -> None:
        if self.is_deleted:
            return
        self.deleted_at = datetime.now(UTC)
        self._touch()

    def _touch(self) -> None:
        self.updated_at = datetime.now(UTC)
