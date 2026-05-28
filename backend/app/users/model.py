from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Index, String, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.users.user import UserRole, UserStatus
from app.users.verification_token import VerificationTokenType

if TYPE_CHECKING:
    from app.stores.model import StoreModel
    from app.students.model import StudentModel


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    full_name: Mapped[str]
    avatar_url: Mapped[str | None]
    email: Mapped[str] = mapped_column(String(254))
    pending_email: Mapped[str | None]
    phone_number: Mapped[str]
    password_hash: Mapped[str]
    role: Mapped[UserRole]
    status: Mapped[UserStatus]
    email_verified_at: Mapped[datetime | None]
    phone_verified_at: Mapped[datetime | None]
    deleted_at: Mapped[datetime | None]
    updated_at: Mapped[datetime]
    created_at: Mapped[datetime]

    # if seller have store
    store: Mapped[StoreModel] = relationship(
        lazy="raise", innerjoin=True, back_populates="owner"
    )
    # if student have student_profile
    student_profile: Mapped[StudentModel] = relationship(
        lazy="raise", innerjoin=True, back_populates="user"
    )

    __table_args__ = (
        Index(
            "ix_users_email_active_only",
            "email",
            postgresql_where=text("deleted_at IS NULL"),
            unique=True,
        ),
        Index(
            "ix_users_phone_number_active_only",
            "phone_number",
            postgresql_where=text("deleted_at IS NULL"),
            unique=True,
        ),
    )


class VerificationTokenModel(Base):
    __tablename__ = "verification_tokens"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    token_type: Mapped[VerificationTokenType]
    token_hash: Mapped[str]
    expires_at: Mapped[datetime]

    __table_args__ = (UniqueConstraint("user_id", "token_type"),)
