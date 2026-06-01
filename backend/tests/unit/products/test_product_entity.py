from datetime import UTC, datetime

import pytest

from app.exception import DomainException
from app.products.product import ProductCategory
from app.stores.store import Store
from app.users.seller import Seller
from app.users.user import UserRole


def make_store() -> Store:
    seller = Seller(
        full_name="Seller",
        email="seller@example.com",
        phone_number="081234567890",
        password_hash="hash",
        role=UserRole.SELLER,
        store=None,
    )
    return Store.create(
        name="Demo Store",
        owner=seller,
        description="Demo description",
        address="Demo address",
    )


def test_create_product_normalizes_fields_and_starts_unavailable() -> None:
    store = make_store()

    product = store.create_product(
        name="  Nasi Goreng  ",
        price=15000,
        category=ProductCategory.FOOD,
        description="  Enak  ",
        photo_url="  https://example.com/product.jpg  ",
    )

    assert product.name == "Nasi Goreng"
    assert product.description == "Enak"
    assert product.photo_url == "https://example.com/product.jpg"
    assert product.is_available is False


def test_create_product_rejects_invalid_price() -> None:
    store = make_store()

    with pytest.raises(DomainException):
        store.create_product("Nasi Goreng", 0, ProductCategory.FOOD)


def test_change_information_updates_changed_fields() -> None:
    product = make_store().create_product("Nasi Goreng", 15000, ProductCategory.FOOD)
    before = product.updated_at

    product.updated_at = datetime(2026, 1, 1, tzinfo=UTC)
    product.change_information(
        name="Mie Ayam",
        price=12000,
        category=ProductCategory.SNACK,
        description="  Pedas  ",
        photo_url=None,
    )

    assert product.name == "Mie Ayam"
    assert product.price == 12000
    assert product.category == ProductCategory.SNACK
    assert product.description == "Pedas"
    assert product.updated_at != before


def test_availability_and_delete_are_idempotent() -> None:
    product = make_store().create_product("Nasi Goreng", 15000, ProductCategory.FOOD)

    product.mark_as_available()
    product.mark_as_available()
    assert product.is_available is True

    product.mark_as_unavailable()
    product.mark_as_unavailable()
    assert product.is_available is False

    product.delete()
    deleted_at = product.deleted_at
    product.delete()
    assert product.deleted_at == deleted_at
