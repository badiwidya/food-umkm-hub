from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.exception import AuthenticationException, NotAllowedException
from app.security import JWTPayload, verify_access_token
from app.users.dependency import get_user_service
from app.users.entity import User
from app.users.enum import UserRole
from app.users.service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def get_token_payload(
    token: Annotated[str | None, Depends(oauth2_scheme)] = None,
) -> JWTPayload:
    if token is None:
        raise AuthenticationException("Autentikasi diperlukan.", "missing_token")
    payload = verify_access_token(token)

    return payload


_JWTPayloadDep = Annotated[JWTPayload, Depends(get_token_payload)]


def ensure_admin(payload: _JWTPayloadDep) -> None:
    if UserRole(payload.role) != UserRole.ADMIN:
        raise NotAllowedException("Aksi dilarang.")


async def get_current_user(
    payload: _JWTPayloadDep,
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> User:
    user = await user_service.get_by_id(payload.sub)
    if user is None:
        raise AuthenticationException("Autentikasi gagal.")
    if user.is_suspended:
        raise NotAllowedException("Akun Anda telah ditangguhkan.", "account_suspended")
    return user
