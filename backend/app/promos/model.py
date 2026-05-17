from datetime import datetime
from uuid import UUID

from sqlalchemy import BigInteger, ForeignKey, Index, text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.domains.promo import PromoType


class PromoModel(Base):
    __tablename__ = "promos"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    code: Mapped[str]
    type: Mapped[PromoType]
    value: Mapped[int] = mapped_column(BigInteger)
    max_discount_amount: Mapped[int | None] = mapped_column(BigInteger)
    min_order_amount: Mapped[int | None] = mapped_column(BigInteger)
    max_usage: Mapped[int | None]
    usage_count: Mapped[int]
    start_date: Mapped[datetime]
    end_date: Mapped[datetime]
    deleted_at: Mapped[datetime | None]
    updated_at: Mapped[datetime]
    created_at: Mapped[datetime]

    __table_args__ = (
        Index(
            "ix_promos_store_code_active_only",
            "store_id",
            "code",
            unique=True,
            postgresql_where=text("deleted_at is NULL"),
        ),
    )
