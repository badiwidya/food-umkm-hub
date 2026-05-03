from datetime import UTC, datetime, timedelta

import pytest

from app.exception import DomainException
from app.users.entity import User, VerificationToken
from app.users.enum import TokenType, UserRole, UserStatus


@pytest.fixture
def user() -> User:
    return User.register(
        full_name="  Budi Santoso  ",
        email="  BUDI@EXAMPLE.COM  ",
        phone_number="  081234567890  ",
        password_hash="hashed_password",
        role=UserRole.STUDENT,
    )


@pytest.fixture
def verified_user(user: User) -> User:
    user.mark_email_as_verified()
    return user


@pytest.fixture
def admin() -> User:
    return User.register(
        full_name="Admin",
        email="admin@example.com",
        phone_number="0811",
        password_hash="x",
        role=UserRole.ADMIN,
    )


# User.register


def test_register_normalizes_input(user: User):
    assert user.full_name == "Budi Santoso"
    assert user.email == "budi@example.com"
    assert user.phone_number == "081234567890"
    assert user.status == UserStatus.INACTIVE


# User basic state changes


def test_email_verification_activates_user(user: User):
    user.mark_email_as_verified()

    assert user.is_email_verified is True
    assert user.status == UserStatus.ACTIVE


def test_suspend_and_unsuspend_flow(user: User):
    user.suspend()
    assert user.is_suspended is True

    user.unsuspend()
    assert user.status == UserStatus.ACTIVE


def test_delete_marks_user_deleted(user: User):
    user.delete()
    assert user.is_deleted is True


# User protections


def test_admin_cannot_be_deleted_or_suspended(admin: User):
    with pytest.raises(DomainException):
        admin.delete()

    with pytest.raises(DomainException):
        admin.suspend()


# Profile update


def test_change_profile_details(user: User):
    user.change_info(full_name="Nama Baru", avatar_url=None)

    assert user.full_name == "Nama Baru"
    assert user.avatar_url is None


def test_change_profile_details_rejects_invalid_name(user: User):
    with pytest.raises(DomainException):
        user.change_info(full_name="   ")


# Email change flow


def test_request_email_change_requires_verified_email(user: User):
    with pytest.raises(DomainException) as exc:
        user.request_email_change("new@example.com")

    assert exc.value.type == "email_unverified"


def test_request_email_change_sets_pending_email(verified_user: User):
    verified_user.request_email_change("NEW@EXAMPLE.COM")

    assert verified_user.pending_email == "new@example.com"


def test_apply_pending_email(verified_user: User):
    verified_user.pending_email = "new@example.com"

    verified_user.apply_pending_email()

    assert verified_user.email == "new@example.com"
    assert verified_user.pending_email is None
    assert verified_user.is_email_verified is True


def test_request_email_change_same_as_current_raises(verified_user: User):
    with pytest.raises(DomainException):
        verified_user.request_email_change(verified_user.email)


# Phone & password


def test_change_phone_resets_verification(user: User):
    user.mark_phone_as_verified()

    user.change_phone_number("089999999999")

    assert user.phone_number == "089999999999"
    assert user.is_phone_verified is False


def test_change_phone_number_same_as_current_raises(user: User):
    user.mark_email_as_verified()

    with pytest.raises(DomainException):
        user.change_phone_number(user.phone_number)


def test_change_password(user: User):
    user.change_password("new_hash")
    assert user.password_hash == "new_hash"


# VerificationToken


def test_create_phone_otp_token(user: User):
    token, raw = VerificationToken.create(user.id, TokenType.PHONE_OTP)

    assert raw.isdigit()
    assert len(raw) == 6
    assert token.token_type == TokenType.PHONE_OTP


def test_create_email_token(user: User):
    token, raw = VerificationToken.create(user.id, TokenType.EMAIL_VERIFICATION)

    assert isinstance(raw, str)
    assert token.token_type == TokenType.EMAIL_VERIFICATION


def test_token_verify_success(user: User):
    token, raw = VerificationToken.create(user.id, TokenType.EMAIL_VERIFICATION)

    token.verify(raw, TokenType.EMAIL_VERIFICATION)


def test_token_verify_wrong_type(user: User):
    token, raw = VerificationToken.create(user.id, TokenType.EMAIL_VERIFICATION)

    with pytest.raises(DomainException):
        token.verify(raw, TokenType.PASSWORD_RESET)


def test_token_verify_expired(user: User):
    token, raw = VerificationToken.create(user.id, TokenType.EMAIL_VERIFICATION)
    token.expires_at = datetime.now(UTC) - timedelta(seconds=1)

    with pytest.raises(DomainException):
        token.verify(raw, TokenType.EMAIL_VERIFICATION)


def test_token_verify_invalid_value(user: User):
    token, _ = VerificationToken.create(user.id, TokenType.PHONE_OTP)

    with pytest.raises(DomainException):
        token.verify("000000", TokenType.PHONE_OTP)
