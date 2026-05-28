from uuid import UUID

from app.auth.dto import RegisterSellerDTO, RegisterStudentDTO
from app.config import settings
from app.exception import AuthenticationException, DomainException, NotAllowedException
from app.notifications.task import (
    send_password_reset_link_task,
    send_verification_email_task,
)
from app.security import create_access_token, hash_password, verify_password
from app.stores.repository import StoreRepository
from app.students.repository import StudentRepository
from app.students.student import Student, User
from app.users.repository import UserRepository, VerificationTokenRepository
from app.users.seller import Seller
from app.users.verification_token import VerificationToken, VerificationTokenType


class AuthService:
    def __init__(
        self,
        user_repo: UserRepository,
        token_repo: VerificationTokenRepository,
        student_repo: StudentRepository,
        store_repo: StoreRepository,
    ) -> None:
        self._user_repo = user_repo
        self._token_repo = token_repo
        self._student_repo = student_repo
        self._store_repo = store_repo

    async def register_student(self, dto: RegisterStudentDTO) -> None:
        await self._ensure_email_and_phone_not_taken(dto.email, dto.phone_number)

        student = Student.register(
            full_name=dto.full_name,
            email=dto.email,
            phone_number=dto.phone_number,
            password_hash=hash_password(dto.password),
            nim=dto.nim,
            faculty=dto.faculty,
            department=dto.department,
        )

        await self._student_repo.save(student)

        verification_link = await self._build_email_verification_link(student)
        send_verification_email_task.delay(  # pyright: ignore[reportCallIssue]
            to=student.email, verification_link=verification_link
        )

    async def register_seller(self, dto: RegisterSellerDTO) -> None:
        await self._ensure_email_and_phone_not_taken(dto.email, dto.phone_number)

        seller = Seller.register(
            full_name=dto.full_name,
            email=dto.email,
            phone_number=dto.phone_number,
            password_hash=hash_password(dto.password),
        )

        store = seller.create_store(
            name=dto.store.name,
            description=dto.store.description,
            address=dto.store.address,
            photo_url=dto.store.photo_url,
            maps_link=dto.store.maps_link,
            qris_image_url=dto.store.qris_image_url,
        )

        await self._user_repo.save(seller)
        await self._store_repo.save(store)

        verification_link = await self._build_email_verification_link(seller)
        send_verification_email_task.delay(  # pyright: ignore[reportCallIssue]
            to=seller.email, verification_link=verification_link
        )

    async def login(self, email: str, password: str) -> str:
        user = await self._user_repo.get_by_email(email.strip().lower())
        if user is None or not verify_password(password, user.password_hash):
            raise AuthenticationException(
                "Email atau password salah", "invalid_credentials"
            )

        if not user.is_email_verified:
            raise AuthenticationException(
                "Email belum diverifikasi", "email_unverified"
            )

        if user.is_suspended:
            raise NotAllowedException(
                "Akun Anda telah ditangguhkan", "account_suspended"
            )

        access_token = create_access_token(
            {"sub": str(user.id), "role": user.role.value}
        )

        return access_token

    async def verify_email_change(self, token_id: UUID, raw_token: str) -> None:
        token = await self._token_repo.get_by_id(token_id)
        if token is None:
            raise DomainException("Tautan verifikasi tidak valid", "invalid_token")

        token.verify(raw_token, VerificationTokenType.EMAIL_CHANGE_VERIFICATION)

        user = await self._user_repo.get_by_id(token.user_id)
        assert user is not None
        user.apply_pending_email()

        await self._user_repo.update(user)
        await self._token_repo.delete_by_id(token.id)

    async def verify_email(self, token_id: UUID, raw_token: str) -> None:
        token = await self._token_repo.get_by_id(token_id)
        if token is None:
            raise DomainException("Tautan verifikasi tidak valid", "invalid_token")

        token.verify(raw_token, VerificationTokenType.EMAIL_VERIFICATION)

        user = await self._user_repo.get_by_id(token.user_id)
        assert user is not None
        user.mark_email_as_verified()

        await self._user_repo.update(user)
        await self._token_repo.delete_by_id(token.id)

    async def issue_email_verification_token(self, email: str) -> None:
        email = email.strip().lower()
        user = await self._user_repo.get_by_email(email.strip().lower())
        if user is None or user.is_email_verified:
            return None
        verification_link = await self._build_email_verification_link(user)
        send_verification_email_task.delay(  # pyright: ignore[reportCallIssue]
            to=email, verification_link=verification_link
        )

    async def request_reset_password(self, email: str) -> None:
        user = await self._user_repo.get_by_email(email.strip().lower())
        if user is None:
            return

        token, raw_token = await self._issue_verification_token(
            user, VerificationTokenType.PASSWORD_RESET
        )

        reset_password_link = f"{settings.FRONTEND_URL}/click/reset-password?token={raw_token}&id={token.id}"

        send_password_reset_link_task.delay(
            to=user.email, reset_password_link=reset_password_link
        )  # pyright: ignore[reportCallIssue]

    async def confirm_reset_password(
        self, token_id: UUID, raw_token: str, new_password: str
    ) -> None:
        token = await self._token_repo.get_by_id(token_id)
        if token is None:
            raise DomainException("Token reset password tidak valid", "invalid_token")

        token.verify(raw_token, VerificationTokenType.PASSWORD_RESET)

        user = await self._user_repo.get_by_id(token.user_id)
        assert user is not None
        user.change_password(hash_password(new_password))

        await self._user_repo.update(user)
        await self._token_repo.delete_by_id(token.id)

    async def _ensure_email_and_phone_not_taken(
        self, email: str, phone_number: str
    ) -> None:
        existing = await self._user_repo.get_by_email_or_phone(
            email.strip().lower(), phone_number.strip()
        )
        if existing is not None:
            if existing.email == email.strip().lower():
                raise DomainException("Email sudah digunakan", "email_taken")
            raise DomainException("Nomor telepon sudah digunakan", "phone_taken")

    async def _build_email_verification_link(self, user: User) -> str:
        token, raw_token = await self._issue_verification_token(
            user, VerificationTokenType.EMAIL_VERIFICATION
        )

        verification_link = f"{settings.FRONTEND_URL}/click/verify-email?token={raw_token}&id={token.id}"

        return verification_link

    async def _issue_verification_token(
        self, user: User, type: VerificationTokenType
    ) -> tuple[VerificationToken, str]:
        await self._token_repo.delete_by_user_and_type(user.id, type)
        token, raw_token = VerificationToken.create(user.id, type)

        await self._token_repo.save(token)
        return token, raw_token
