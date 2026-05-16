from dataclasses import asdict
from urllib.parse import parse_qs, urlparse
from uuid import UUID

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dto import RegisterSellerDTO, RegisterStoreDTO, RegisterStudentDTO
from app.auth.service import AuthService
from app.exception import AuthenticationException, DomainException, NotAllowedException
from app.security import verify_password
from app.stores.repository import StoreRepository
from app.students.repository import StudentRepository
from app.users.enum import UserRole
from app.users.repository import UserRepository, VerificationTokenRepository
from tests.integration.conftest import UserFactory


@pytest.fixture
def user_repo(db_session: AsyncSession) -> UserRepository:
    return UserRepository(db_session)


@pytest.fixture
def token_repo(db_session: AsyncSession) -> VerificationTokenRepository:
    return VerificationTokenRepository(db_session)


@pytest.fixture
def store_repo(db_session: AsyncSession) -> StoreRepository:
    return StoreRepository(db_session)


@pytest.fixture
def auth_service(db_session: AsyncSession) -> AuthService:
    return AuthService(
        user_repo=UserRepository(db_session),
        token_repo=VerificationTokenRepository(db_session),
        student_repo=StudentRepository(db_session),
        store_repo=StoreRepository(db_session),
    )


@pytest.fixture
def student_dto() -> RegisterStudentDTO:
    return RegisterStudentDTO(
        full_name="Makise Kurisu",
        email="makise@amadeus.com",
        phone_number="+6288887776666",
        password="supersecret",
        nim="G1234567890",
        faculty="FMIPA",
        department="Ilmu Komputer",
    )


@pytest.fixture
def seller_dto() -> RegisterSellerDTO:
    return RegisterSellerDTO(
        full_name="Okabe Rintaro",
        email="okabe@futurenet.com",
        phone_number="+6299998887777",
        password="supersecret",
        store=RegisterStoreDTO(
            name="Future Gadget Lab",
            description="Toko perangkat masa depan.",
            address="Akihabara, Jakarta",
            photo_url=None,
            maps_link=None,
            qris_image_url=None,
        ),
    )


class TestRegisterStudent:
    async def test_creates_user_and_student(
        self,
        auth_service: AuthService,
        student_dto: RegisterStudentDTO,
        user_repo: UserRepository,
    ):
        await auth_service.register_student(student_dto)

        user = await user_repo.get_by_email(student_dto.email)
        assert user is not None
        assert user.role == UserRole.STUDENT
        assert not user.is_email_verified

    async def test_returns_verification_link(
        self,
        auth_service: AuthService,
        student_dto: RegisterStudentDTO,
    ):
        link = await auth_service.register_student(student_dto)
        parsed = parse_qs(urlparse(link).query)
        assert "token" in parsed
        assert "id" in parsed

    async def test_issues_verification_token(
        self,
        auth_service: AuthService,
        student_dto: RegisterStudentDTO,
        token_repo: VerificationTokenRepository,
        user_repo: UserRepository,
    ):
        link = await auth_service.register_student(student_dto)
        params = parse_qs(urlparse(link).query)

        token = await token_repo.get_by_id(UUID(params["id"][0]))
        assert token is not None

        user = await user_repo.get_by_email(student_dto.email)
        assert user is not None
        assert token.user_id == user.id

    async def test_duplicate_email_raises(
        self,
        auth_service: AuthService,
        student_dto: RegisterStudentDTO,
    ):
        await auth_service.register_student(student_dto)

        duplicate = RegisterStudentDTO(
            **{**student_dto.__dict__, "phone_number": "+6211112222333"}
        )
        with pytest.raises(DomainException) as exc:
            await auth_service.register_student(duplicate)
        assert exc.value.type == "email_taken"

    async def test_duplicate_phone_raises(
        self,
        auth_service: AuthService,
        student_dto: RegisterStudentDTO,
    ):
        await auth_service.register_student(student_dto)

        duplicate = RegisterStudentDTO(
            **{**asdict(student_dto), "email": "other@amadeus.com"}
        )
        with pytest.raises(DomainException) as exc:
            await auth_service.register_student(duplicate)
        assert exc.value.type == "phone_taken"


class TestRegisterSeller:
    async def test_creates_user_and_store(
        self,
        auth_service: AuthService,
        seller_dto: RegisterSellerDTO,
        user_repo: UserRepository,
        store_repo: StoreRepository,
    ):
        await auth_service.register_seller(seller_dto)

        user = await user_repo.get_by_email(seller_dto.email)
        assert user is not None
        assert user.role == UserRole.SELLER

        store = await store_repo.get_by_owner_id(user.id)
        assert store is not None
        assert store.store.name == seller_dto.store.name

    async def test_store_starts_pending(
        self,
        auth_service: AuthService,
        seller_dto: RegisterSellerDTO,
        user_repo: UserRepository,
        store_repo: StoreRepository,
    ):
        from app.stores.enum import ApprovalStatus

        await auth_service.register_seller(seller_dto)

        user = await user_repo.get_by_email(seller_dto.email)
        assert user is not None

        store = await store_repo.get_by_owner_id(user.id)
        assert store is not None
        assert store.store.approval_status == ApprovalStatus.PENDING


class TestLogin:
    async def test_returns_access_token(
        self,
        auth_service: AuthService,
        user_factory: UserFactory,
    ):
        from datetime import UTC, datetime

        await user_factory(email_verified_at=datetime.now(UTC))
        token = await auth_service.login("makise@amadeus.com", "supersecret")
        assert token is not None

    async def test_wrong_password_raises(
        self,
        auth_service: AuthService,
        user_factory: UserFactory,
    ):
        from datetime import UTC, datetime

        await user_factory(email_verified_at=datetime.now(UTC))
        with pytest.raises(AuthenticationException) as exc:
            await auth_service.login("makise@amadeus.com", "wrongpassword")
        assert exc.value.type == "invalid_credentials"

    async def test_nonexistent_email_raises(
        self,
        auth_service: AuthService,
    ):
        with pytest.raises(AuthenticationException) as exc:
            await auth_service.login("nobody@amadeus.com", "supersecret")
        assert exc.value.type == "invalid_credentials"

    async def test_unverified_email_raises(
        self,
        auth_service: AuthService,
        user_factory: UserFactory,
    ):
        await user_factory()
        with pytest.raises(AuthenticationException) as exc:
            await auth_service.login("makise@amadeus.com", "supersecret")
        assert exc.value.type == "email_unverified"

    async def test_suspended_user_raises(
        self,
        db_session: AsyncSession,
        auth_service: AuthService,
        user_factory: UserFactory,
    ):
        from datetime import UTC, datetime

        user = await user_factory(email_verified_at=datetime.now(UTC))
        user.suspend()
        await UserRepository(db_session).update(user)

        with pytest.raises(NotAllowedException) as exc:
            await auth_service.login("makise@amadeus.com", "supersecret")
        assert exc.value.type == "account_suspended"


class TestVerifyEmail:
    async def test_activates_user(
        self,
        auth_service: AuthService,
        student_dto: RegisterStudentDTO,
        user_repo: UserRepository,
    ):
        link = await auth_service.register_student(student_dto)
        params = parse_qs(urlparse(link).query)

        await auth_service.verify_email(UUID(params["id"][0]), params["token"][0])

        user = await user_repo.get_by_email(student_dto.email)
        assert user is not None
        assert user.is_email_verified

    async def test_token_deleted_after_verification(
        self,
        auth_service: AuthService,
        student_dto: RegisterStudentDTO,
        token_repo: VerificationTokenRepository,
    ):
        link = await auth_service.register_student(student_dto)
        params = parse_qs(urlparse(link).query)
        token_id = UUID(params["id"][0])

        await auth_service.verify_email(token_id, params["token"][0])

        assert await token_repo.get_by_id(token_id) is None

    async def test_invalid_token_id_raises(
        self,
        auth_service: AuthService,
    ):
        from uuid import uuid4

        with pytest.raises(DomainException) as exc:
            await auth_service.verify_email(uuid4(), "randomtoken")
        assert exc.value.type == "invalid_token"


class TestConfirmResetPassword:
    async def test_changes_password(
        self,
        auth_service: AuthService,
        user_factory: UserFactory,
        user_repo: UserRepository,
    ):
        user = await user_factory()
        link = await auth_service.request_reset_password(user.email)
        assert link is not None

        params = parse_qs(urlparse(link).query)
        await auth_service.confirm_reset_password(
            UUID(params["id"][0]), params["token"][0], "newpassword123"
        )

        saved = await user_repo.get_by_id(user.id)
        assert saved is not None
        assert verify_password("newpassword123", saved.password_hash)

    async def test_token_deleted_after_reset(
        self,
        auth_service: AuthService,
        user_factory: UserFactory,
        token_repo: VerificationTokenRepository,
    ):
        user = await user_factory()
        link = await auth_service.request_reset_password(user.email)
        assert link is not None

        params = parse_qs(urlparse(link).query)
        token_id = UUID(params["id"][0])

        await auth_service.confirm_reset_password(
            token_id, params["token"][0], "newpassword123"
        )

        assert await token_repo.get_by_id(token_id) is None

    async def test_invalid_token_raises(
        self,
        auth_service: AuthService,
        user_factory: UserFactory,
    ):
        from uuid import uuid4

        await user_factory()
        with pytest.raises(DomainException) as exc:
            await auth_service.confirm_reset_password(uuid4(), "faketoken", "newpass")
        assert exc.value.type == "invalid_token"

    async def test_nonexistent_email_returns_none(
        self,
        auth_service: AuthService,
    ):
        result = await auth_service.request_reset_password("nobody@amadeus.com")
        assert result is None
