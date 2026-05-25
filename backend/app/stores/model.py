from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.domains.store import StoreApprovalStatus

if TYPE_CHECKING:
    from app.users.model import UserModel


class StoreModel(Base):
    __tablename__ = "stores"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), unique=True)
    name: Mapped[str]
    description: Mapped[str]
    address: Mapped[str]
    photo_url: Mapped[str | None]
    qris_image_url: Mapped[str | None]
    maps_link: Mapped[str | None]
    approval_status: Mapped[StoreApprovalStatus]
    approval_notes: Mapped[str | None]
    is_open: Mapped[bool]
    rating: Mapped[float | None] = mapped_column(Numeric(2, 1), nullable=True)
    total_reviews: Mapped[int] = mapped_column(default=0)
    updated_at: Mapped[datetime]
    created_at: Mapped[datetime]

    owner: Mapped[UserModel] = relationship(
        lazy="raise", innerjoin=True, back_populates="store"
    )
