from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from uuid import UUID, uuid7

from app.exception import DomainException
from app.sentinel import UNSET, TUnset


class UserRole(StrEnum):
    ADMIN = "admin"
    STUDENT = "student"
    SELLER = "seller"


class UserStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


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

    def change_profile_information(
        self,
        full_name: str | TUnset = UNSET,
        avatar_url: str | None | TUnset = UNSET,
    ) -> None:
        has_changed = False

        if not isinstance(full_name, TUnset):
            normalized_name = full_name.strip()
            if not normalized_name:
                raise DomainException("Nama tidak boleh kosong")
            if normalized_name != self.full_name:
                self.full_name = normalized_name
                has_changed = True

        if not isinstance(avatar_url, TUnset):
            normalized_avatar = avatar_url.strip() if avatar_url is not None else None
            if normalized_avatar != self.avatar_url:
                self.avatar_url = normalized_avatar
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
                "Email saat ini belum diverifikasi", "email_unverified"
            )

        if new_email.strip().lower() == self.email:
            raise DomainException("Email baru tidak boleh sama dengan email saat ini")

        self.pending_email = new_email.strip().lower()
        self._touch()

    def apply_pending_email(self) -> None:
        if not self.pending_email:
            raise DomainException(
                "Tidak ada permintaan perubahan email baru",
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
                "Nomor telepon baru tidak boleh sama dengan nomor telepon saat ini"
            )
        self.phone_number = new_number.strip()
        self.phone_verified_at = None
        self._touch()

    def change_password(self, new_password_hash: str) -> None:
        self.password_hash = new_password_hash
        self._touch()

    def delete(self) -> None:
        if self.is_deleted:
            return

        self.deleted_at = datetime.now(UTC)
        self._touch()

    def _suspend(self) -> None:
        if self.is_suspended:
            return
        self.status = UserStatus.SUSPENDED
        self._touch()

    def _unsuspend(self) -> None:
        if not self.is_suspended:
            return
        self.status = UserStatus.ACTIVE
        self._touch()

    def _touch(self) -> None:
        self.updated_at = datetime.now(UTC)

    @staticmethod
    def _register_validate(
        full_name: str,
        email: str,
        phone_number: str,
    ) -> dict[str, str]:
        normalized_name = full_name.strip()
        if not normalized_name:
            raise DomainException("Nama tidak boleh kosong")

        normalized_email = email.strip().lower()
        if not normalized_email:
            raise DomainException("Email tidak boleh kosong")

        normalized_phone = phone_number.strip()
        if not normalized_phone:
            raise DomainException("Nomor telepon tidak boleh kosong")

        return {
            "full_name": normalized_name,
            "email": normalized_email,
            "phone_number": normalized_phone,
        }
