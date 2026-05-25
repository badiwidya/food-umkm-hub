from datetime import datetime
from uuid import UUID

from sqlalchemy import CheckConstraint, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ReviewModel(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("order_id", "product_id"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="rating_between_1_and_5"),
        Index("ix_reviews_order_id", "order_id"),
        Index("ix_reviews_product_id", "product_id"),
        Index("ix_reviews_store_id", "store_id"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True)
    order_id: Mapped[UUID] = mapped_column(ForeignKey("orders.id"))
    student_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    product_id: Mapped[UUID] = mapped_column(ForeignKey("products.id"))
    rating: Mapped[int]
    comment: Mapped[str | None]
    updated_at: Mapped[datetime]
    created_at: Mapped[datetime]
