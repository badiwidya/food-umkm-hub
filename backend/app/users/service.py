from typing import Any
from uuid import UUID

from app.config import settings
from app.exception import DomainException
from app.notifications.task import send_otp_task, send_verification_email_task
from app.security import hash_password, verify_password
from app.sentinel import UNSET
from app.users.admin import Admin
from app.users.repository import UserRepository, VerificationTokenRepository
from app.users.user import User, UserRole, UserStatus
from app.users.verification_token import VerificationToken, VerificationTokenType


class UserService:
    def __init__(
        self, user_repo: UserRepository, token_repo: VerificationTokenRepository
    ) -> None:
        self._user_repo = user_repo
        self._token_repo = token_repo

    async def get_details(self, user_id: UUID) -> User | None:
        return await self._user_repo.get_by_id(user_id)

    async def list(
        self,
        page: int,
        page_size: int,
        status: UserStatus | None,
        role: UserRole | None,
    ) -> tuple[list[User], int]:
        limit = page_size
        offset = (page - 1) * page_size
        users, total_count = await self._user_repo.get_all(
            limit=limit, offset=offset, status=status, role=role
        )

        return users, total_count

    async def update_profile(self, user: User, updates: dict[str, Any]) -> User:
        user.change_profile_information(
            full_name=updates.get("full_name", UNSET),
            avatar_url=updates.get("avatar_url", UNSET),
        )

        await self._user_repo.update(user)
        return user

    async def request_email_change(self, user: User, new_email: str) -> None:
        existing = await self._user_repo.get_by_email(new_email.strip().lower())
        if existing is not None and existing.id != user.id:
            raise DomainException("Email sudah digunakan oleh akun lain")

        user.request_email_change(new_email)
        await self._user_repo.update(user)

        await self.issue_email_change_verification_link(user)

    async def issue_email_change_verification_link(self, user: User) -> None:
        if not user.pending_email:
            raise DomainException("Tidak ada email yang perlu diverifikasi")

        token, raw_token = await self._issue_verification_token(
            user, VerificationTokenType.EMAIL_CHANGE_VERIFICATION
        )

        verification_link = f"{settings.FRONTEND_URL}/click/change-email?token={raw_token}&id={token.id}"
        send_verification_email_task.delay(
            to=user.pending_email, verification_link=verification_link
        )  # pyright: ignore[reportCallIssue]

    async def verify_phone(self, user: User, raw_otp: str) -> None:
        token = await self._token_repo.get_by_user_and_type(
            user.id, VerificationTokenType.PHONE_OTP
        )
        if token is None:
            raise DomainException("Tidak ada kode OTP yang aktif", "otp_not_found")

        token.verify(raw_otp, VerificationTokenType.PHONE_OTP)

        user.mark_phone_as_verified()

        await self._user_repo.update(user)
        await self._token_repo.delete_by_id(token.id)

    async def change_phone_number(self, user: User, new_number: str) -> User:
        existing = await self._user_repo.get_by_phone_number(new_number.strip())
        if existing is not None and existing.id != user.id:
            raise DomainException("Nomor telepon sudah digunakan oleh akun lain")

        user.change_phone_number(new_number)
        await self._user_repo.update(user)

        return user

    async def issue_phone_verification_otp(self, user: User) -> None:
        if user.is_phone_verified:
            raise DomainException("Tidak ada nomor telepon yang perlu diverifikasi")

        _, raw_otp = await self._issue_verification_token(
            user, VerificationTokenType.PHONE_OTP
        )
        send_otp_task.delay(to=user.email, otp=raw_otp)  # pyright: ignore[reportCallIssue]

    async def change_password(
        self, user: User, old_password: str, new_password: str
    ) -> None:
        if not verify_password(old_password, user.password_hash):
            raise DomainException("Password lama tidak sesuai")

        new_password_hash = hash_password(new_password)
        user.change_password(new_password_hash)

        await self._user_repo.update(user)

    async def suspend_target(self, admin: Admin, user: User) -> None:
        admin.suspend_user(user)
        await self._user_repo.update(user)

    async def unsuspend_target(self, admin: Admin, user: User) -> None:
        admin.unsuspend_user(user)
        await self._user_repo.update(user)

    async def delete_target(self, admin: Admin, user: User) -> None:
        admin.delete_user(user)
        await self._user_repo.update(user)

    async def delete_self(self, user: User) -> None:
        user.delete()
        await self._user_repo.update(user)

    async def _issue_verification_token(
        self, user: User, type: VerificationTokenType
    ) -> tuple[VerificationToken, str]:
        # Memastikan tidak ada token lama yang tersimpan
        await self._token_repo.delete_by_user_and_type(user.id, type)
        token, raw_token = VerificationToken.create(user.id, type)

        await self._token_repo.save(token)
        return token, raw_token
