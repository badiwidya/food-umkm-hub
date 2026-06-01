from datetime import UTC, datetime, timedelta
from uuid import uuid7

import pytest

from app.exception import DomainException
from app.orders.order import Order, OrderStatus, PaymentMethod


def make_order(payment_method: PaymentMethod = PaymentMethod.QRIS) -> Order:
    return Order.create(
        student_id=uuid7(),
        store_id=uuid7(),
        payment_method=payment_method,
        expires_at=datetime.now(UTC) + timedelta(minutes=30),
        notes="  test notes  ",
    )


def test_order_calculates_total_from_items() -> None:
    order = make_order()

    order.create_order_item(uuid7(), "Nasi Goreng", 15000, 2)
    order.create_order_item(uuid7(), "Es Teh", 5000, 1)

    assert order.calculate_total() == 35000
    assert order.total_price == 35000


def test_qris_order_accepts_payment_proof_from_pending_status() -> None:
    order = make_order(PaymentMethod.QRIS)

    order.submit_payment_proof("https://example.com/proof.jpg")

    assert order.payment_proof_url == "https://example.com/proof.jpg"
    assert order.status == OrderStatus.WAITING_FOR_CONFIRMATION


def test_cash_order_does_not_accept_payment_proof() -> None:
    order = make_order(PaymentMethod.CASH)

    with pytest.raises(DomainException):
        order.submit_payment_proof("https://example.com/proof.jpg")


def test_cash_order_can_confirm_payment() -> None:
    order = make_order(PaymentMethod.CASH)

    order.confirm_cash_payment()

    assert order.status == OrderStatus.WAITING_FOR_CONFIRMATION


def test_seller_status_transition_happy_path() -> None:
    order = make_order(PaymentMethod.CASH)
    order.confirm_cash_payment()

    order.seller_accept()
    order.seller_mark_as_ready_to_pickup()
    order.complete()

    assert order.status == OrderStatus.COMPLETED
    assert order.completed_at is not None


def test_seller_cannot_accept_pending_order() -> None:
    order = make_order(PaymentMethod.QRIS)

    with pytest.raises(DomainException):
        order.seller_accept()


def test_seller_reject_and_reconsider_order() -> None:
    order = make_order(PaymentMethod.QRIS)
    order.submit_payment_proof("https://example.com/proof.jpg")

    order.seller_reject("Stok habis")
    assert order.status == OrderStatus.REJECTED
    assert order.rejection_reason == "Stok habis"

    order.seller_reconsider()
    assert order.status == OrderStatus.IN_PROCESS
    assert order.rejection_reason is None
    assert order.rejected_at is None
