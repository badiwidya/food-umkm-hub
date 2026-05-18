from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from uuid import UUID, uuid7

from app.domains.promo import Promo
from app.exception import DomainException


class OrderStatus(StrEnum):
    PENDING = "pending"
    WAITING_FOR_CONFIRMATION = "waiting_for_confirmation"
    IN_PROCESS = "in_process"
    READY_TO_PICKUP = "ready_to_pickup"
    REJECTED = "rejected"
    FAILED = "failed"
    COMPLETED = "completed"


class PaymentMethod(StrEnum):
    QRIS = "qris"
    CASH = "cash"


@dataclass(kw_only=True)
class OrderItem:
    id: UUID = field(default_factory=uuid7)
    order_id: UUID
    product_id: UUID

    # Snapshot nama produk
    product_name: str
    # Snapshot harga produk
    product_price: int

    quantity: int
    subtotal: int

    @classmethod
    def create(
        cls,
        order_id: UUID,
        product_id: UUID,
        product_name: str,
        product_price: int,
        quantity: int,
    ) -> OrderItem:
        return cls(
            order_id=order_id,
            product_id=product_id,
            product_name=product_name,
            product_price=product_price,
            quantity=quantity,
            subtotal=product_price * quantity,
        )


@dataclass(kw_only=True)
class Order:
    id: UUID = field(default_factory=uuid7)
    student_id: UUID
    store_id: UUID
    payment_method: PaymentMethod
    status: OrderStatus = OrderStatus.PENDING
    order_items: list[OrderItem] = field(default_factory=list)
    total_price: int = 0
    discount_amount: int = 0
    notes: str | None = None
    promo_id: UUID | None = None
    promo_code: str | None = None
    payment_proof_url: str | None = None
    rejection_reason: str | None = None
    rejected_at: datetime | None = None
    expires_at: datetime
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @classmethod
    def create(
        cls,
        student_id: UUID,
        store_id: UUID,
        payment_method: PaymentMethod,
        expires_at: datetime,
        notes: str | None = None,
    ) -> Order:
        return cls(
            student_id=student_id,
            store_id=store_id,
            payment_method=payment_method,
            expires_at=expires_at,
            notes=notes.strip() if notes is not None else None,
        )

    def create_order_item(
        self, product_id: UUID, product_name: str, product_price: int, quantity: int
    ) -> None:
        self.order_items.append(
            OrderItem.create(
                order_id=self.id,
                product_id=product_id,
                product_name=product_name,
                product_price=product_price,
                quantity=quantity,
            )
        )

    def calculate_total(self) -> int:
        total = sum(item.subtotal for item in self.order_items)
        self.total_price = total
        self._touch()
        return total

    def apply_promo(self, promo: Promo) -> None:
        self.promo_id = promo.id
        self.promo_code = promo.code
        self.discount_amount = promo.calculate_discount(self.total_price)
        self.total_price -= self.discount_amount
        promo.use()
        self._touch()

    def submit_payment_proof(self, proof_url: str) -> None:
        if self.payment_method != PaymentMethod.QRIS:
            raise DomainException("Metode pembayaran tidak memerlukan bukti pembayaran")
        if self.status != OrderStatus.PENDING:
            raise DomainException(
                "Bukti pembayaran hanya dapat diunggah saat pesanan menunggu pembayaran"
            )
        self.payment_proof_url = proof_url
        self.status = OrderStatus.WAITING_FOR_CONFIRMATION
        self._touch()

    def confirm_cash_payment(self) -> None:
        if self.payment_method != PaymentMethod.CASH:
            raise DomainException("Gunakan unggah bukti transfer untuk pembayaran QRIS")
        if self.status != OrderStatus.PENDING:
            raise DomainException(
                "Konfirmasi pembayaran hanya dapat dilakukan saat pesanan menunggu pembayaran"
            )
        self.status = OrderStatus.WAITING_FOR_CONFIRMATION
        self._touch()

    def complete(self) -> None:
        if self.status != OrderStatus.READY_TO_PICKUP:
            raise DomainException("Pesanan belum siap untuk diambil")
        self.status = OrderStatus.COMPLETED
        self._touch()

    def cancel(self) -> None:
        if self.status != OrderStatus.PENDING:
            raise DomainException("Hanya pesanan berstatus pending yang bisa dicancel")
        self.status = OrderStatus.FAILED
        self._touch()

    def seller_accept(self) -> None:
        if self.status != OrderStatus.WAITING_FOR_CONFIRMATION:
            raise DomainException("Pesanan tidak dalam status menunggu konfirmasi")
        self.status = OrderStatus.IN_PROCESS
        self._touch()

    def seller_reject(self, reason: str) -> None:
        if self.status != OrderStatus.WAITING_FOR_CONFIRMATION:
            raise DomainException("Pesanan tidak dalam status menunggu konfirmasi")
        self.status = OrderStatus.REJECTED
        self.rejected_at = datetime.now(UTC)
        self.rejection_reason = reason
        self._touch()

    def seller_reconsider(self) -> None:
        if self.status != OrderStatus.REJECTED:
            raise DomainException("Pesanan tidak dalam status ditolak")
        self.status = OrderStatus.IN_PROCESS
        self.rejected_at = None
        self.rejection_status = None
        self._touch()

    def seller_mark_as_ready_to_pickup(self) -> None:
        if self.status != OrderStatus.IN_PROCESS:
            raise DomainException("Pesanan tidak dalam status sedang diproses")
        self.status = OrderStatus.READY_TO_PICKUP
        self._touch()

    def expire(self) -> None:
        if self.status != OrderStatus.PENDING:
            return
        self.status = OrderStatus.FAILED
        self._touch()

    def finalize_reject(self) -> None:
        if self.status != OrderStatus.REJECTED:
            return
        self.status = OrderStatus.FAILED
        self.rejected_at = None
        self._touch()

    def _touch(self) -> None:
        self.updated_at = datetime.now(UTC)
