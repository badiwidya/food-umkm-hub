from typing import TYPE_CHECKING
from uuid import UUID, uuid7

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.users.model import UserModel


class StudentModel(Base):
    __tablename__ = "students"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), unique=True)
    nim: Mapped[str] = mapped_column(unique=True)
    faculty: Mapped[str]
    department: Mapped[str]

    user: Mapped[UserModel] = relationship(
        lazy="raise", innerjoin=True, back_populates="student_profile"
    )
