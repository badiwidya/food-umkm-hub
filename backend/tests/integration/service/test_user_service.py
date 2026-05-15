from datetime import UTC, datetime
from urllib.parse import parse_qs, urlparse
from uuid import UUID

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.exception import DomainException
from app.security import verify_password
from app.users.enum import TokenType, UserRole, UserStatus
from app.users.repository import UserRepository, VerificationTokenRepository
from app.users.service import UserService
from tests.integration.conftest import UserFactory


@pytest.fixture
def token_repo(db_session: AsyncSession) -> VerificationTokenRepository:
    return VerificationTokenRepository(db_session)


@pytest.fixture
def user_service(db_session: AsyncSession) -> UserService:
    return UserService(
        UserRepository(db_session),
        VerificationTokenRepository(db_session),
    )


class TestChangePassword:
    async def test_correct_old_password_changes_password(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory()
        await user_service.change_password(user, "supersecret", "supersecret123")

        saved = await user_service.get_by_id(user.id)
        assert saved is not None
        assert verify_password("supersecret123", saved.password_hash)

    async def test_unchanged_if_old_password_not_correct(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory()
        with pytest.raises(DomainException):
            await user_service.change_password(user, "wrong", "supersecret123")

        saved = await user_service.get_by_id(user.id)
        assert saved is not None
        assert not verify_password("supersecret123", saved.password_hash)


class TestRequestEmailChange:
    async def test_sets_pending_email(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory(email_verified_at=datetime.now(UTC))
        await user_service.request_email_change(user, "kurisu@amadeus.com")

        saved = await user_service.get_by_id(user.id)
        assert saved is not None
        assert saved.pending_email == "kurisu@amadeus.com"

    async def test_issues_valid_token(
        self,
        user_factory: UserFactory,
        user_service: UserService,
        token_repo: VerificationTokenRepository,
    ):
        user = await user_factory(email_verified_at=datetime.now(UTC))
        link = await user_service.request_email_change(user, "kurisu@amadeus.com")

        params = parse_qs(urlparse(link).query)

        saved_token = await token_repo.get_by_id(UUID(params["id"][0]))

        assert saved_token is not None
        assert saved_token.user_id == user.id

        saved_token.verify(params["token"][0], TokenType.EMAIL_CHANGE_VERIFICATION)

    async def test_email_taken_by_other_user_raises(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory()
        other = await user_factory(
            email="kurisu@amadeus.com", phone_number="+6211112222333"
        )

        with pytest.raises(DomainException):
            await user_service.request_email_change(user, other.email)

    async def test_issuing_token_replaces_existing_token_of_same_type(
        self,
        user_factory: UserFactory,
        user_service: UserService,
        token_repo: VerificationTokenRepository,
    ):
        user = await user_factory(email_verified_at=datetime.now(UTC))
        await user_service.request_email_change(user, "kurisu@amadeus.com")

        first_token = await token_repo.get_by_user_and_type(
            user.id, TokenType.EMAIL_CHANGE_VERIFICATION
        )

        assert first_token is not None
        await user_service.request_email_change(user, "kurisu@amadeus.com")

        second_token = await token_repo.get_by_user_and_type(
            user.id, TokenType.EMAIL_CHANGE_VERIFICATION
        )
        assert second_token is not None
        # First token masih tersimpan di memori jadi fine
        assert first_token.id != second_token.id

        deleted_token = await token_repo.get_by_id(first_token.id)
        assert deleted_token is None


class TestChangeNumber:
    async def test_changes_phone_number_and_invalidates_phone_verification_status(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory(phone_verified_at=datetime.now(UTC))
        await user_service.change_phone_number(user, "+621111111111")

        saved = await user_service.get_by_id(user.id)
        assert saved is not None
        assert saved.phone_number == "+621111111111"
        assert saved.phone_verified_at is None

    async def test_issues_valid_token(
        self,
        user_factory: UserFactory,
        user_service: UserService,
        token_repo: VerificationTokenRepository,
    ):
        user = await user_factory()
        await user_service.change_phone_number(user, "+62444333222")

        saved_token = await token_repo.get_by_user_and_type(
            user.id, TokenType.PHONE_OTP
        )
        assert saved_token is not None
        assert saved_token.user_id == user.id

    async def test_phone_number_taken_by_other_user_raises(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory()
        other = await user_factory(
            email="kurisu@amadeus.com", phone_number="+621111111111"
        )

        with pytest.raises(DomainException):
            await user_service.change_phone_number(user, other.phone_number)


class TestChangeProfile:
    async def test_all_changes_saved_to_db(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory()
        await user_service.update_profile(
            user, {"full_name": "Okabe Rintaro", "avatar_url": "/picture.jpg"}
        )

        saved = await user_service.get_by_id(user.id)

        assert saved is not None
        assert saved.full_name == "Okabe Rintaro"
        assert saved.avatar_url == "/picture.jpg"

    async def test_avatar_url_unchanged(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory()
        await user_service.update_profile(user, {"full_name": "Okabe Rintaro"})

        saved = await user_service.get_by_id(user.id)

        assert saved is not None
        assert saved.full_name == "Okabe Rintaro"
        assert saved.avatar_url is None

    async def test_remove_avatar_url(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory(avatar_url="/picture.jpg")
        await user_service.update_profile(user, {"avatar_url": None})

        saved = await user_service.get_by_id(user.id)

        assert saved is not None
        assert saved.avatar_url is None


class TestStatusChange:
    async def test_suspend_and_unsuspend(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory()
        await user_service.suspend(user)

        suspended = await user_service.get_by_id(user.id)
        assert suspended is not None
        assert suspended.status == UserStatus.SUSPENDED

        await user_service.unsuspend(suspended)

        unsuspended = await user_service.get_by_id(user.id)
        assert unsuspended is not None
        assert unsuspended.status == UserStatus.ACTIVE

    async def test_delete_remove_visibility(
        self, user_factory: UserFactory, user_service: UserService
    ):
        user = await user_factory()
        await user_service.delete(user)

        deleted = await user_service.get_by_id(user.id)
        assert deleted is None

        _, count = await user_service.list(1, 20, None, None)
        assert count == 0


class TestList:
    async def test_list_success(
        self, user_factory: UserFactory, user_service: UserService
    ):
        for i in range(10):
            if i % 2 == 1:
                await user_factory(
                    email=f"user{i}@gmail.com",
                    phone_number=f"+62111111111{i}",
                    role=UserRole.SELLER,
                )
                continue

            await user_factory(
                email=f"user{i}@gmail.com",
                phone_number=f"+62111111111{i}",
                role=UserRole.ADMIN,
            )

        await user_factory(
            email="sus@gmail.com",
            phone_number="+629292929299",
            status=UserStatus.SUSPENDED,
        )

        _, count_umkm = await user_service.list(1, 10, None, role=UserRole.SELLER)
        assert count_umkm == 5

        _, count_admin = await user_service.list(1, 10, None, role=UserRole.ADMIN)
        assert count_admin == 5

        _, count_suspended = await user_service.list(
            1, 10, status=UserStatus.SUSPENDED, role=None
        )
        assert count_suspended == 1
