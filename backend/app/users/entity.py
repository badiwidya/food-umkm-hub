import hashlib
import hmac
import secrets
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid7

from app.exception import DomainException
from app.sentinel import UNSET, TUnset
from app.users.enum import TokenType, UserRole, UserStatus


@dataclass(kw_only=True)
class User:
    id: UUID = field(default_factory=uuid7)
    full_name: str
    avatar_url: str | None = None

    email: str
    pending_email: str | None = None
    phone_number: str
    password_hash: str

    role: UserRole
    status: UserStatus = UserStatus.INACTIVE

    email_verified_at: datetime | None = None
    phone_verified_at: datetime | None = None

    deleted_at: datetime | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @classmethod
    def register(
        cls,
        full_name: str,
        email: str,
        phone_number: str,
        password_hash: str,
        role: UserRole,
    ) -> User:
        return cls(
            full_name=full_name.strip(),
            email=email.strip().lower(),
            phone_number=phone_number.strip(),
            password_hash=password_hash,
            role=role,
        )

    @property
    def is_email_verified(self) -> bool:
        return self.email_verified_at is not None

    @property
    def is_phone_verified(self) -> bool:
        return self.phone_verified_at is not None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    @property
    def is_suspended(self) -> bool:
        return self.status == UserStatus.SUSPENDED

    def change_profile_details(
        self,
        full_name: str | TUnset = UNSET,
        avatar_url: str | None | TUnset = UNSET,
    ) -> None:
        has_changed = False
        if not isinstance(full_name, TUnset):
            if full_name.strip() != self.full_name:
                self.full_name = full_name.strip()
                has_changed = True

        if not isinstance(avatar_url, TUnset):
            if avatar_url != self.avatar_url:
                self.avatar_url = avatar_url
                has_changed = True

        if has_changed:
            self._touch()

    def mark_email_as_verified(self) -> None:
        self.email_verified_at = datetime.now(UTC)
        if self.status == UserStatus.INACTIVE:
            self.status = UserStatus.ACTIVE
        self._touch()

    def request_email_change(self, new_email: str) -> None:
        if not self.is_email_verified:
            raise DomainException(
                "Email saat ini belum diverifikasi.", "email_unverified"
            )

        if new_email.strip().lower() == self.email:
            raise DomainException("Email baru tidak boleh sama dengan email saat ini.")

        self.pending_email = new_email.strip().lower()
        self._touch()

    def apply_pending_email(self) -> None:
        if not self.pending_email:
            raise DomainException(
                "Tidak ada permintaan perubahan email baru.",
            )

        self.email = self.pending_email
        self.pending_email = None
        self.email_verified_at = datetime.now(UTC)
        self._touch()

    def mark_phone_as_verified(self) -> None:
        self.phone_verified_at = datetime.now(UTC)
        self._touch()

    def change_phone_number(self, new_number: str) -> None:
        if new_number.strip() == self.phone_number:
            raise DomainException(
                "Nomor telepon baru tidak boleh sama dengan nomor telepon saat ini."
            )
        self.phone_number = new_number.strip()
        self.phone_verified_at = None
        self._touch()

    def change_password(self, new_password_hash: str) -> None:
        self.password_hash = new_password_hash
        self._touch()

    def delete(self) -> None:
        # Apapun yang terjadi, akun admin tidak boleh dihapus (baik oleh diri sendiri
        # ataupun admin lain). Ada prosedur yang harus diikuti.
        if self.role == UserRole.ADMIN:
            raise DomainException("Akun Administrator tidak dapat dihapus.")

        if self.is_deleted:
            return

        self.deleted_at = datetime.now(UTC)
        self._touch()

    def suspend(self) -> None:
        # Apapun yang terjadi, akun admin tidak boleh disuspend (baik oleh diri sendiri
        # ataupun admin lain).
        if self.role == UserRole.ADMIN:
            raise DomainException("Akun Administrator tidak dapat disuspend.")

        if self.is_suspended:
            return
        self.status = UserStatus.SUSPENDED
        self._touch()

    def unsuspend(self) -> None:
        if not self.is_suspended:
            return
        self.status = UserStatus.ACTIVE
        self._touch()

    def _touch(self) -> None:
        self.updated_at = datetime.now(UTC)


@dataclass(kw_only=True)
class VerificationToken:
    id: UUID = field(default_factory=uuid7)
    user_id: UUID
    token_type: TokenType
    token_hash: str
    expires_at: datetime

    @classmethod
    def create(
        cls, user_id: UUID, token_type: TokenType
    ) -> tuple[VerificationToken, str]:
        now = datetime.now(UTC)

        if token_type == TokenType.PHONE_OTP:
            raw_token = str(secrets.randbelow(1000000)).zfill(6)
            expires_at = now + timedelta(minutes=5)
        elif token_type == TokenType.EMAIL_VERIFICATION:
            raw_token = secrets.token_urlsafe(32)
            expires_at = now + timedelta(hours=24)
        elif token_type == TokenType.EMAIL_CHANGE_VERIFICATION:
            raw_token = secrets.token_urlsafe(32)
            expires_at = now + timedelta(hours=3)
        elif token_type == TokenType.PASSWORD_RESET:
            raw_token = secrets.token_urlsafe(32)
            expires_at = now + timedelta(hours=1)

        return cls(
            user_id=user_id,
            token_hash=hashlib.sha256(raw_token.encode()).hexdigest(),
            token_type=token_type,
            expires_at=expires_at,
        ), raw_token

    @property
    def is_expired(self) -> bool:
        return self.expires_at < datetime.now(UTC)

    def verify(self, raw_token: str, expected_type: TokenType) -> None:
        exp_err_type = "expired_token"
        inv_err_type = "invalid_token"
        if (
            expected_type == TokenType.EMAIL_VERIFICATION
            or expected_type == TokenType.EMAIL_CHANGE_VERIFICATION
        ):
            name = "Tautan verifikasi"
        elif expected_type == TokenType.PASSWORD_RESET:
            name = "Tautan reset password"
        elif expected_type == TokenType.PHONE_OTP:
            name = "Kode OTP"
            exp_err_type = "expired_otp"
            inv_err_type = "invalid_otp"

        if self.token_type != expected_type:
            raise DomainException(f"{name} tidak valid.", inv_err_type)

        if self.is_expired:
            raise DomainException(f"{name} sudah tidak berlaku.", exp_err_type)

        if not hmac.compare_digest(
            hashlib.sha256(raw_token.encode()).hexdigest(), self.token_hash
        ):
            raise DomainException(f"{name} tidak valid.", inv_err_type)
