from datetime import UTC, datetime

import pytest

from app.auth.dto import RegisterStudentDTO
from app.auth.service import AuthService
from app.exception import AuthenticationException, DomainException, NotAllowedException
from app.security import hash_password
from app.users.user import User, UserRole, UserStatus


class FakeUserRepository:
    def __init__(self, users: list[User] | None = None) -> None:
        self.users = users or []

    async def get_by_email(self, email: str) -> User | None:
        return next((user for user in self.users if user.email == email), None)

    async def get_by_email_or_phone(self, email: str, phone_number: str) -> User | None:
        return next(
            (
                user
                for user in self.users
                if user.email == email or user.phone_number == phone_number
            ),
            None,
        )

    async def get_by_id(self, id):
        return next((user for user in self.users if user.id == id), None)

    async def save(self, user: User) -> None:
        self.users.append(user)

    async def update(self, user: User) -> None:
        return None


class FakeTokenRepository:
    async def delete_by_user_and_type(self, user_id, type) -> None:
        return None

    async def save(self, token) -> None:
        return None


class FakeStudentRepository:
    def __init__(self) -> None:
        self.saved = []

    async def save(self, student) -> None:
        self.saved.append(student)


class FakeStoreRepository:
    async def save(self, store) -> None:
        return None


def make_auth_service(user_repo: FakeUserRepository) -> AuthService:
    return AuthService(
        user_repo=user_repo,
        token_repo=FakeTokenRepository(),
        student_repo=FakeStudentRepository(),
        store_repo=FakeStoreRepository(),
    )


def make_user(
    email: str = "user@example.com",
    phone_number: str = "081234567890",
    status: UserStatus = UserStatus.ACTIVE,
    verified: bool = True,
) -> User:
    return User(
        full_name="User",
        email=email,
        phone_number=phone_number,
        password_hash=hash_password("password123"),
        role=UserRole.STUDENT,
        status=status,
        email_verified_at=datetime.now(UTC) if verified else None,
    )


@pytest.fixture
def register_student_dto() -> RegisterStudentDTO:
    return RegisterStudentDTO(
        full_name="Test Student",
        email="student@example.com",
        phone_number="081234567890",
        password="password123",
        nim="g64000001",
        faculty="FMIPA",
        department="Ilmu Komputer",
    )


@pytest.mark.anyio
async def test_register_student_saves_normalized_student(
    register_student_dto: RegisterStudentDTO, monkeypatch: pytest.MonkeyPatch
) -> None:
    user_repo = FakeUserRepository()
    student_repo = FakeStudentRepository()
    service = AuthService(
        user_repo=user_repo,
        token_repo=FakeTokenRepository(),
        student_repo=student_repo,
        store_repo=FakeStoreRepository(),
    )
    from app.notifications.task import send_verification_email_task

    monkeypatch.setattr(send_verification_email_task, "delay", lambda **kwargs: None)

    await service.register_student(register_student_dto)

    assert len(student_repo.saved) == 1
    assert student_repo.saved[0].email == "student@example.com"
    assert student_repo.saved[0].nim == "G64000001"


@pytest.mark.anyio
async def test_register_student_rejects_duplicate_email(
    register_student_dto: RegisterStudentDTO,
) -> None:
    service = make_auth_service(
        FakeUserRepository([make_user(email="student@example.com")])
    )

    with pytest.raises(DomainException):
        await service.register_student(register_student_dto)


@pytest.mark.anyio
async def test_login_returns_token_for_verified_active_user() -> None:
    service = make_auth_service(FakeUserRepository([make_user()]))

    token = await service.login(" user@example.com ", "password123")

    assert token


@pytest.mark.anyio
async def test_login_rejects_wrong_password() -> None:
    service = make_auth_service(FakeUserRepository([make_user()]))

    with pytest.raises(AuthenticationException):
        await service.login("user@example.com", "wrong-password")


@pytest.mark.anyio
async def test_login_rejects_unverified_user() -> None:
    service = make_auth_service(FakeUserRepository([make_user(verified=False)]))

    with pytest.raises(AuthenticationException):
        await service.login("user@example.com", "password123")


@pytest.mark.anyio
async def test_login_rejects_suspended_user() -> None:
    service = make_auth_service(
        FakeUserRepository([make_user(status=UserStatus.SUSPENDED)])
    )

    with pytest.raises(NotAllowedException):
        await service.login("user@example.com", "password123")
