import pytest

from app.exception import DomainException
from app.stores.store import Store, StoreApprovalStatus
from app.users.admin import Admin
from app.users.seller import Seller
from app.users.user import UserRole


def make_seller() -> Seller:
    return Seller(
        full_name="Seller",
        email="seller@example.com",
        phone_number="081234567890",
        password_hash="hash",
        role=UserRole.SELLER,
        store=None,
    )


def make_admin() -> Admin:
    return Admin(
        full_name="Admin",
        email="admin@example.com",
        phone_number="081234567891",
        password_hash="hash",
        role=UserRole.ADMIN,
    )


def make_store() -> Store:
    return Store.create(
        name="Demo Store",
        owner=make_seller(),
        description="Demo description",
        address="Demo address",
    )


def test_store_starts_pending_and_can_be_approved_then_opened() -> None:
    store = make_store()
    admin = make_admin()

    admin.approve_store_application(store)
    store.open()

    assert store.approval_status == StoreApprovalStatus.APPROVED
    assert store.is_open is True


def test_store_cannot_open_before_approval() -> None:
    store = make_store()

    with pytest.raises(DomainException):
        store.open()


def test_pending_store_can_be_rejected_with_notes() -> None:
    store = make_store()
    admin = make_admin()

    admin.reject_store_application(store, "Dokumen tidak lengkap")

    assert store.approval_status == StoreApprovalStatus.REJECTED
    assert store.approval_notes == "Dokumen tidak lengkap"


def test_rejected_store_can_resubmit() -> None:
    store = make_store()
    admin = make_admin()
    admin.reject_store_application(store, "Dokumen tidak lengkap")

    store.resubmit()

    assert store.approval_status == StoreApprovalStatus.PENDING
    assert store.approval_notes is None


def test_approved_store_cannot_be_rejected() -> None:
    store = make_store()
    admin = make_admin()
    admin.approve_store_application(store)

    with pytest.raises(DomainException):
        admin.reject_store_application(store, "Tidak valid")
