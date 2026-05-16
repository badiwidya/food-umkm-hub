from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.domains.product import ProductCategory
from app.stores.model import StoreModel

if TYPE_CHECKING:
    from app.stores.model import StoreModel


class ProductModel(Base):
    __tablename__ = "products"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    name: Mapped[str]
    description: Mapped[str | None]
    price: Mapped[int] = mapped_column(BigInteger)
    photo_url: Mapped[str | None]
    category: Mapped[ProductCategory]
    is_available: Mapped[bool]
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]
    deleted_at: Mapped[datetime | None]

    store: Mapped[StoreModel] = relationship(lazy="raise", innerjoin=True)
