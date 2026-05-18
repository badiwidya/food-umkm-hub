from datetime import datetime
from uuid import UUID

from sqlalchemy import BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.domains.order import OrderStatus, PaymentMethod


class OrderModel(Base):
    __tablename__ = "orders"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    student_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    store_id: Mapped[UUID] = mapped_column(ForeignKey("stores.id"))
    promo_id: Mapped[UUID | None] = mapped_column(ForeignKey("promos.id"))
    promo_code: Mapped[str | None]
    status: Mapped[OrderStatus]
    payment_method: Mapped[PaymentMethod]
    total_price: Mapped[int] = mapped_column(BigInteger)
    discount_amount: Mapped[int] = mapped_column(BigInteger)
    notes: Mapped[str | None]
    payment_proof_url: Mapped[str | None]
    rejection_reason: Mapped[str | None]
    rejected_at: Mapped[datetime | None]
    expires_at: Mapped[datetime]
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]

    order_items: Mapped[list[OrderItemModel]] = relationship(lazy="raise")


class OrderItemModel(Base):
    __tablename__ = "order_items"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    order_id: Mapped[UUID] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[UUID] = mapped_column(ForeignKey("products.id"))
    product_name: Mapped[str]
    product_price: Mapped[int] = mapped_column(BigInteger)
    quantity: Mapped[int]
    subtotal: Mapped[int] = mapped_column(BigInteger)
