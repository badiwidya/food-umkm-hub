from datetime import UTC, datetime, timedelta
from uuid import uuid7

import pytest

from app.exception import DomainException
from app.promos.promo import Promo, PromoType


def make_promo(
    type: PromoType = PromoType.FIXED,
    value: int = 5000,
    max_discount_amount: int | None = None,
    min_order_amount: int | None = None,
    max_usage: int | None = None,
) -> Promo:
    now = datetime.now(UTC)
    return Promo.create(
        store_id=uuid7(),
        type=type,
        code=" demo10 ",
        value=value,
        start_date=now - timedelta(days=1),
        end_date=now + timedelta(days=1),
        max_discount_amount=max_discount_amount,
        min_order_amount=min_order_amount,
        max_usage=max_usage,
    )


def test_fixed_promo_discount_is_capped_by_order_amount() -> None:
    promo = make_promo(type=PromoType.FIXED, value=5000)

    assert promo.code == "DEMO10"
    assert promo.calculate_discount(3000) == 3000
    assert promo.calculate_discount(10000) == 5000


def test_percentage_promo_respects_max_discount() -> None:
    promo = make_promo(
        type=PromoType.PERCENTAGE,
        value=50,
        max_discount_amount=10000,
    )

    assert promo.calculate_discount(50000) == 10000


def test_promo_rejects_invalid_percentage_value() -> None:
    with pytest.raises(DomainException):
        make_promo(type=PromoType.PERCENTAGE, value=101)


def test_non_percentage_promo_cannot_have_max_discount() -> None:
    with pytest.raises(DomainException):
        make_promo(type=PromoType.FIXED, value=5000, max_discount_amount=10000)


def test_promo_validity_quota_and_minimum_order() -> None:
    now = datetime.now(UTC)
    promo = make_promo(min_order_amount=20000, max_usage=1)

    assert promo.is_valid_at(now) is True
    assert promo.meets_minimum_order(19999) is False
    assert promo.meets_minimum_order(20000) is True
    assert promo.has_quota() is True

    promo.use()
    assert promo.has_quota() is False


def test_promo_rejects_invalid_date_window() -> None:
    now = datetime.now(UTC)

    with pytest.raises(DomainException):
        Promo.create(
            store_id=uuid7(),
            type=PromoType.FIXED,
            code="DEMO",
            value=5000,
            start_date=now,
            end_date=now,
        )
