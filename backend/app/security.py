from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import UUID

import bcrypt
import jwt

from app.config import settings
from app.exception import AuthenticationException


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


@dataclass(frozen=True)
class JWTPayload:
    sub: UUID
    role: str


def create_access_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=settings.JWT_TTL_MINUTES)
    payload.update({"exp": expire})

    return jwt.encode(payload, settings.JWT_SECRET, settings.JWT_ALGORITHM)


def verify_access_token(token: str) -> JWTPayload:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, [settings.JWT_ALGORITHM])

        if "sub" not in payload or "role" not in payload:
            raise jwt.InvalidTokenError

        return JWTPayload(sub=UUID(payload["sub"]), role=payload["role"])
    except jwt.ExpiredSignatureError as e:
        raise AuthenticationException("Sesi telah berakhir", "expired_token") from e
    except jwt.InvalidTokenError as e:
        raise AuthenticationException("Autentikasi gagal", "invalid_token") from e
