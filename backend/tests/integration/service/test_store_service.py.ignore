from collections.abc import Awaitable, Callable
from uuid import UUID

import pytest
from app.stores.entity import Store
from app.stores.enum import ApprovalStatus
from app.users.entity import User
from app.users.enum import UserRole
from sqlalchemy.ext.asyncio import AsyncSession

from app.exception import DomainException
from app.security import hash_password
from app.stores.repository import StoreRepository
from app.stores.service import StoreService
from app.users.repository import UserRepository

StoreFactory = Callable[..., Awaitable[Store]]


@pytest.fixture
def store_service(db_session: AsyncSession) -> StoreService:
    return StoreService(StoreRepository(db_session))


@pytest.fixture
def store_factory(db_session: AsyncSession) -> StoreFactory:
    counter = 0

    async def _make_store(
        name: str = "Future Gadget Lab",
        description: str = "Toko perangkat masa depan.",
        address: str = "Akihabara, Jakarta",
        approval_status: ApprovalStatus = ApprovalStatus.PENDING,
        owner_id: UUID | None = None,
        **kwargs,
    ) -> Store:
        nonlocal counter
        counter += 1

        if owner_id is None:
            user = User.register(
                full_name="Okabe Rintaro",
                email=f"okabe_{name}@futurenet.com",
                phone_number=f"+6281{counter:09d}",
                password_hash=hash_password("supersecret"),
                role=UserRole.SELLER,
            )
            await UserRepository(db_session).save(user)
            owner_id = user.id

        store = Store.create(
            name=name,
            owner_id=owner_id,
            description=description,
            address=address,
        )
        store.approval_status = approval_status

        for k, v in kwargs.items():
            setattr(store, k, v)

        await StoreRepository(db_session).save(store)
        await db_session.flush()
        return store

    return _make_store


class TestList:
    async def test_only_returns_approved_stores(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        await store_factory(name="Toko Pending", approval_status=ApprovalStatus.PENDING)
        await store_factory(
            name="Toko Rejected", approval_status=ApprovalStatus.REJECTED
        )
        await store_factory(
            name="Toko Approved", approval_status=ApprovalStatus.APPROVED
        )

        stores, count = await store_service.list_for_public()

        assert count == 1
        assert stores[0].name == "Toko Approved"

    async def test_keyword_filters_by_name(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        await store_factory(
            name="Warung Makan Enak", approval_status=ApprovalStatus.APPROVED
        )
        await store_factory(
            name="Toko Elektronik", approval_status=ApprovalStatus.APPROVED
        )

        stores, count = await store_service.list_for_public(keyword="Warung")

        assert count == 1
        assert stores[0].name == "Warung Makan Enak"

    async def test_keyword_filters_by_description(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        await store_factory(
            name="Toko A",
            description="Menjual makanan tradisional.",
            approval_status=ApprovalStatus.APPROVED,
        )
        await store_factory(
            name="Toko B",
            description="Menjual elektronik.",
            approval_status=ApprovalStatus.APPROVED,
        )

        stores, count = await store_service.list_for_public(keyword="tradisional")

        assert count == 1
        assert stores[0].name == "Toko A"

    async def test_pagination(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        for i in range(5):
            await store_factory(
                name=f"Toko {i}", approval_status=ApprovalStatus.APPROVED
            )

        stores, count = await store_service.list_for_public(page=1, page_size=3)

        assert count == 5
        assert len(stores) == 3


class TestListAll:
    async def test_returns_all_statuses_when_no_filter(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        await store_factory(name="Toko Pending", approval_status=ApprovalStatus.PENDING)
        await store_factory(
            name="Toko Approved", approval_status=ApprovalStatus.APPROVED
        )
        await store_factory(
            name="Toko Rejected", approval_status=ApprovalStatus.REJECTED
        )

        _, count = await store_service.list_for_admin(page=1, page_size=10, status=None)

        assert count == 3

    async def test_filters_by_status(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        await store_factory(
            name="Toko Pending 1", approval_status=ApprovalStatus.PENDING
        )
        await store_factory(
            name="Toko Pending 2", approval_status=ApprovalStatus.PENDING
        )
        await store_factory(
            name="Toko Approved", approval_status=ApprovalStatus.APPROVED
        )

        stores, count = await store_service.list_for_admin(
            page=1, page_size=10, status=ApprovalStatus.PENDING
        )

        assert count == 2
        assert all(s.store.approval_status == ApprovalStatus.PENDING for s in stores)

    async def test_includes_owner_data(
        self,
        store_factory: StoreFactory,
        store_service: StoreService,
        db_session: AsyncSession,
    ):
        user = User.register(
            full_name="Okabe Rintaro",
            email="okabe@futurenet.com",
            phone_number="+6299998887777",
            password_hash=hash_password("supersecret"),
            role=UserRole.SELLER,
        )
        await UserRepository(db_session).save(user)
        await store_factory(name="Toko Okabe", owner_id=user.id)

        stores, _ = await store_service.list_for_admin(
            page=1, page_size=10, status=None
        )

        assert stores[0].owner.full_name == "Okabe Rintaro"


class TestUpdateInformation:
    async def test_updates_sent_fields(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        store = await store_factory()
        await store_service.update_information(
            store, {"name": "Nama Baru", "address": "Alamat Baru"}
        )

        saved = await store_service.get_details(store.id)
        assert saved is not None
        assert saved.name == "Nama Baru"
        assert saved.address == "Alamat Baru"

    async def test_unsent_fields_unchanged(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        store = await store_factory(description="Deskripsi asli.")
        await store_service.update_information(store, {"name": "Nama Baru"})

        saved = await store_service.get_details(store.id)
        assert saved is not None
        assert saved.description == "Deskripsi asli."

    async def test_nullable_field_can_be_set_to_none(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        store = await store_factory(photo_url="/foto.jpg")
        await store_service.update_information(store, {"photo_url": None})

        saved = await store_service.get_details(store.id)
        assert saved is not None
        assert saved.photo_url is None

    async def test_empty_name_raises(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        store = await store_factory()
        with pytest.raises(DomainException):
            await store_service.update_information(store, {"name": "   "})


class TestApproveRejectResubmit:
    async def test_approve_saves_to_db(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        store = await store_factory(approval_status=ApprovalStatus.PENDING)
        await store_service.approve(store)

        saved = await store_service.get_details(store.id)
        assert saved is not None
        assert saved.approval_status == ApprovalStatus.APPROVED

    async def test_reject_saves_notes_to_db(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        store = await store_factory(approval_status=ApprovalStatus.PENDING)
        await store_service.reject(store, notes="Dokumen tidak lengkap.")

        saved = await store_service.get_details(store.id)
        assert saved is not None
        assert saved.approval_status == ApprovalStatus.REJECTED
        assert saved.approval_notes == "Dokumen tidak lengkap."

    async def test_resubmit_clears_notes(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        store = await store_factory(
            approval_status=ApprovalStatus.REJECTED,
            approval_notes="Dokumen tidak lengkap.",
        )
        await store_service.resubmit(store)

        saved = await store_service.get_details(store.id)
        assert saved is not None
        assert saved.approval_status == ApprovalStatus.PENDING
        assert saved.approval_notes is None


class TestOpenClose:
    async def test_open_saves_to_db(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        store = await store_factory(approval_status=ApprovalStatus.APPROVED)
        await store_service.open(store)

        saved = await store_service.get_details(store.id)
        assert saved is not None
        assert saved.is_open is True

    async def test_close_saves_to_db(
        self, store_factory: StoreFactory, store_service: StoreService
    ):
        store = await store_factory(
            approval_status=ApprovalStatus.APPROVED, is_open=True
        )
        await store_service.close(store)

        saved = await store_service.get_details(store.id)
        assert saved is not None
        assert saved.is_open is False
