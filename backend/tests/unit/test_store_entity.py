from uuid import uuid4

import pytest

from app.exception import DomainException
from app.stores.entity import Store
from app.stores.enum import ApprovalStatus


@pytest.fixture
def store() -> Store:
    return Store.create(
        name="  Future Gadget Lab  ",
        owner_id=uuid4(),
        description="  Toko perangkat masa depan.  ",
        address="  Akihabara, Jakarta  ",
    )


@pytest.fixture
def approved_store(store: Store) -> Store:
    store.approval_status = ApprovalStatus.APPROVED
    return store


@pytest.fixture
def rejected_store(store: Store) -> Store:
    store.approval_status = ApprovalStatus.REJECTED
    return store


# Store.create


def test_create_normalizes_input(store: Store):
    assert store.name == "Future Gadget Lab"
    assert store.description == "Toko perangkat masa depan."
    assert store.address == "Akihabara, Jakarta"


def test_create_default_values(store: Store):
    assert store.approval_status == ApprovalStatus.PENDING
    assert store.is_open is False
    assert store.photo_url is None
    assert store.qris_image_url is None
    assert store.maps_link is None
    assert store.approval_notes is None


# Store.change_informations


def test_change_informations_updates_fields(store: Store):
    store.change_informations(
        name="Toko Baru",
        description="Deskripsi baru.",
        address="Alamat baru.",
    )

    assert store.name == "Toko Baru"
    assert store.description == "Deskripsi baru."
    assert store.address == "Alamat baru."


def test_change_informations_unset_fields_unchanged(store: Store):
    original_name = store.name
    store.change_informations(description="Deskripsi baru.")

    assert store.name == original_name


def test_change_informations_nullable_field_can_be_set_to_none(approved_store: Store):
    approved_store.photo_url = "/foto.jpg"
    approved_store.change_informations(photo_url=None)

    assert approved_store.photo_url is None


def test_change_informations_nullable_field_can_be_set(store: Store):
    store.change_informations(
        photo_url="/foto.jpg",
        maps_link="https://maps.google.com",
        qris_image_url="/qris.jpg",
    )

    assert store.photo_url == "/foto.jpg"
    assert store.maps_link == "https://maps.google.com"
    assert store.qris_image_url == "/qris.jpg"


def test_change_informations_empty_name_raises(store: Store):
    with pytest.raises(DomainException):
        store.change_informations(name="   ")


def test_change_informations_empty_description_raises(store: Store):
    with pytest.raises(DomainException):
        store.change_informations(description="   ")


def test_change_informations_empty_address_raises(store: Store):
    with pytest.raises(DomainException):
        store.change_informations(address="   ")


# Store.approve


def test_approve_pending_store(store: Store):
    store.approve()

    assert store.approval_status == ApprovalStatus.APPROVED


def test_approve_rejected_store(rejected_store: Store):
    rejected_store.approve()

    assert rejected_store.approval_status == ApprovalStatus.APPROVED


def test_approve_already_approved_raises(approved_store: Store):
    with pytest.raises(DomainException):
        approved_store.approve()


# Store.reject


def test_reject_pending_store(store: Store):
    store.reject(notes="Dokumen tidak lengkap.")

    assert store.approval_status == ApprovalStatus.REJECTED
    assert store.approval_notes == "Dokumen tidak lengkap."


def test_reject_without_notes(store: Store):
    store.reject(notes=None)

    assert store.approval_status == ApprovalStatus.REJECTED
    assert store.approval_notes is None


def test_reject_approved_store_raises(approved_store: Store):
    with pytest.raises(DomainException):
        approved_store.reject(notes=None)


def test_reject_already_rejected_raises(rejected_store: Store):
    with pytest.raises(DomainException):
        rejected_store.reject(notes=None)


# Store.resubmit


def test_resubmit_rejected_store(rejected_store: Store):
    rejected_store.approval_notes = "Dokumen tidak lengkap."
    rejected_store.resubmit()

    assert rejected_store.approval_status == ApprovalStatus.PENDING
    assert rejected_store.approval_notes is None


def test_resubmit_pending_store_raises(store: Store):
    with pytest.raises(DomainException):
        store.resubmit()


def test_resubmit_approved_store_raises(approved_store: Store):
    with pytest.raises(DomainException):
        approved_store.resubmit()


# Store.open / Store.close


def test_open_approved_store(approved_store: Store):
    approved_store.open()

    assert approved_store.is_open is True


def test_close_approved_store(approved_store: Store):
    approved_store.open()
    approved_store.close()

    assert approved_store.is_open is False


def test_open_pending_store_raises(store: Store):
    with pytest.raises(DomainException):
        store.open()


def test_close_pending_store_raises(store: Store):
    with pytest.raises(DomainException):
        store.close()


def test_open_rejected_store_raises(rejected_store: Store):
    with pytest.raises(DomainException):
        rejected_store.open()
