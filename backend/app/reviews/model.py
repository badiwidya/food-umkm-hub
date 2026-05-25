from datetime import datetime
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ReviewModel(Base):
    __tablename__ = "reviews"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    order_id: Mapped[UUID] = mapped_column(ForeignKey("orders.id"))
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    product_id: Mapped[UUID] = mapped_column(ForeignKey("products.id"))
    rating: Mapped[int]
    comment: Mapped[str | None]
    updated_at: Mapped[datetime]
    created_at: Mapped[datetime]
