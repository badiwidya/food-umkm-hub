from uuid import UUID

from app.auth.dto import RegisterStudentDTO, RegisterUMKMDTO
from app.config import settings
from app.exception import AuthenticationException, DomainException, NotAllowedException
from app.security import create_access_token, hash_password, verify_password
from app.students.entity import Student
from app.students.repository import StudentRepository
from app.users.entity import User, VerificationToken
from app.users.enum import TokenType, UserRole
from app.users.repository import UserRepository, VerificationTokenRepository


class AuthService:
    def __init__(
        self,
        user_repo: UserRepository,
        token_repo: VerificationTokenRepository,
        student_repo: StudentRepository,
        # TODO: mahasiswa, dan umkm repo
        # mahasiswa_repo: MahasiswaRepository
        # umkm_repo: UMKMRepository
    ) -> None:
        self._user_repo = user_repo
        self._token_repo = token_repo
        self._student_repo = student_repo

    async def register_student(self, dto: RegisterStudentDTO) -> str:
        await self._ensure_email_and_phone_not_taken(dto.email, dto.phone_number)

        user = User.register(
            full_name=dto.full_name,
            email=dto.email,
            phone_number=dto.phone_number,
            password_hash=hash_password(dto.password),
            role=UserRole.STUDENT,
        )

        student = Student.create(
            user=user, nim=dto.nim, faculty=dto.faculty, department=dto.department
        )

        await self._user_repo.save(user)
        await self._student_repo.save(student)

        return await self._build_email_verification_link(user)

    async def register_umkm(self, dto: RegisterUMKMDTO) -> str:
        await self._ensure_email_and_phone_not_taken(dto.email, dto.phone_number)

        user = User.register(
            full_name=dto.full_name,
            email=dto.email,
            phone_number=dto.phone_number,
            password_hash=hash_password(dto.password),
            role=UserRole.SELLER,
        )

        # TODO: Create UMKM
        await self._user_repo.save(user)

        return await self._build_email_verification_link(user)

    async def login(self, email: str, password: str) -> str:
        user = await self._user_repo.get_by_email(email.strip().lower())
        if user is None or not verify_password(password, user.password_hash):
            raise AuthenticationException(
                "Email atau password salah.", "invalid_credentials"
            )

        if not user.is_email_verified:
            raise AuthenticationException(
                "Email belum diverifikasi.", "email_unverified"
            )

        if user.is_suspended:
            raise NotAllowedException(
                "Akun Anda telah ditangguhkan.", "account_suspended"
            )

        access_token = create_access_token(
            {"sub": str(user.id), "role": user.role.value}
        )

        return access_token

    async def verify_email_change(self, token_id: UUID, raw_token: str) -> None:
        token = await self._token_repo.get_by_id(token_id)
        if token is None:
            raise DomainException("Tautan verifikasi tidak valid.", "invalid_token")

        token.verify(raw_token, TokenType.EMAIL_CHANGE_VERIFICATION)

        user = await self._user_repo.get_by_id(token.user_id)
        assert user is not None
        user.apply_pending_email()

        await self._user_repo.update(user)
        await self._token_repo.delete_by_id(token.id)

    async def verify_email(self, token_id: UUID, raw_token: str) -> None:
        token = await self._token_repo.get_by_id(token_id)
        if token is None:
            raise DomainException("Tautan verifikasi tidak valid.", "invalid_token")

        token.verify(raw_token, TokenType.EMAIL_VERIFICATION)

        user = await self._user_repo.get_by_id(token.user_id)
        assert user is not None
        user.mark_email_as_verified()

        await self._user_repo.update(user)
        await self._token_repo.delete_by_id(token.id)

    async def issue_email_verification_token(self, email: str) -> str | None:
        user = await self._user_repo.get_by_email(email.strip().lower())
        if user is None or user.is_email_verified:
            return None
        return await self._build_email_verification_link(user)

    async def request_reset_password(self, email: str) -> str | None:
        user = await self._user_repo.get_by_email(email.strip().lower())
        if user is None:
            return None

        token, raw_token = await self._issue_verification_token(
            user, TokenType.PASSWORD_RESET
        )

        reset_password_link = f"{settings.FRONTEND_URL}/click/reset-password?token={raw_token}&id={token.id}"

        return reset_password_link

    async def confirm_reset_password(
        self, token_id: UUID, raw_token: str, new_password: str
    ) -> None:
        token = await self._token_repo.get_by_id(token_id)
        if token is None:
            raise DomainException("Token reset password tidak valid.", "invalid_token")

        token.verify(raw_token, TokenType.PASSWORD_RESET)

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
                raise DomainException("Email sudah digunakan.", "email_taken")
            raise DomainException("Nomor telepon sudah digunakan.", "phone_taken")

    async def _build_email_verification_link(self, user: User) -> str:
        token, raw_token = await self._issue_verification_token(
            user, TokenType.EMAIL_VERIFICATION
        )

        verification_link = f"{settings.FRONTEND_URL}/click/verify-email?token={raw_token}&id={token.id}"

        return verification_link

    async def _issue_verification_token(
        self, user: User, type: TokenType
    ) -> tuple[VerificationToken, str]:
        await self._token_repo.delete_by_user_and_type(user.id, type)
        token, raw_token = VerificationToken.create(user.id, type)

        await self._token_repo.save(token)
        return token, raw_token
