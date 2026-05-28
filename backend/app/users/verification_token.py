import hashlib
import hmac
import secrets
from dataclasses import dataclass, field
from datetime import UTC, datetime, timedelta
from enum import StrEnum
from uuid import UUID, uuid7

from app.exception import DomainException


class VerificationTokenType(StrEnum):
    EMAIL_VERIFICATION = "email_verification"
    EMAIL_CHANGE_VERIFICATION = "email_change_verification"
    PASSWORD_RESET = "password_reset"
    PHONE_OTP = "phone_otp"


@dataclass(kw_only=True)
class VerificationToken:
    id: UUID = field(default_factory=uuid7)
    user_id: UUID
    token_type: VerificationTokenType
    token_hash: str
    expires_at: datetime

    @classmethod
    def create(
        cls, user_id: UUID, token_type: VerificationTokenType
    ) -> tuple[VerificationToken, str]:
        now = datetime.now(UTC)

        if token_type == VerificationTokenType.PHONE_OTP:
            raw_token = str(secrets.randbelow(1000000)).zfill(6)
            expires_at = now + timedelta(minutes=5)
        elif token_type == VerificationTokenType.EMAIL_VERIFICATION:
            raw_token = secrets.token_urlsafe(32)
            expires_at = now + timedelta(hours=24)
        elif token_type == VerificationTokenType.EMAIL_CHANGE_VERIFICATION:
            raw_token = secrets.token_urlsafe(32)
            expires_at = now + timedelta(hours=3)
        elif token_type == VerificationTokenType.PASSWORD_RESET:
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

    def verify(self, raw_token: str, expected_type: VerificationTokenType) -> None:
        exp_err_type = "expired_token"
        inv_err_type = "invalid_token"
        if (
            expected_type == VerificationTokenType.EMAIL_VERIFICATION
            or expected_type == VerificationTokenType.EMAIL_CHANGE_VERIFICATION
        ):
            name = "Tautan verifikasi"
        elif expected_type == VerificationTokenType.PASSWORD_RESET:
            name = "Tautan reset password"
        elif expected_type == VerificationTokenType.PHONE_OTP:
            name = "Kode OTP"
            exp_err_type = "expired_otp"
            inv_err_type = "invalid_otp"

        if self.token_type != expected_type:
            raise DomainException(f"{name} tidak valid", inv_err_type)

        if self.is_expired:
            raise DomainException(f"{name} sudah tidak berlaku", exp_err_type)

        if not hmac.compare_digest(
            hashlib.sha256(raw_token.encode()).hexdigest(), self.token_hash
        ):
            raise DomainException(f"{name} tidak valid", inv_err_type)
