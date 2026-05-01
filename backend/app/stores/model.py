from datetime import datetime
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.stores.enum import ApprovalStatus
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
    approval_status: Mapped[ApprovalStatus]
    approval_notes: Mapped[str | None]
    is_open: Mapped[bool]
    updated_at: Mapped[datetime]
    created_at: Mapped[datetime]

    owner: Mapped[UserModel] = relationship(lazy="raise", innerjoin=True)
