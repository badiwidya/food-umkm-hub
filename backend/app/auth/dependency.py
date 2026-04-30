from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.auth.service import AuthService
from app.exception import AuthenticationException, NotAllowedException
from app.security import JWTPayload, verify_access_token
from app.students.dependency import get_student_repo, get_student_service
from app.students.entity import Student
from app.students.repository import StudentRepository
from app.students.service import StudentService
from app.users.dependency import get_token_repo, get_user_repo, get_user_service
from app.users.entity import User
from app.users.enum import UserRole
from app.users.repository import UserRepository, VerificationTokenRepository
from app.users.service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


async def get_auth_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
    token_repo: Annotated[VerificationTokenRepository, Depends(get_token_repo)],
    student_repo: Annotated[StudentRepository, Depends(get_student_repo)],
) -> AuthService:
    return AuthService(
        user_repo=user_repo, token_repo=token_repo, student_repo=student_repo
    )


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


def get_token_payload(
    token: Annotated[str | None, Depends(oauth2_scheme)] = None,
) -> JWTPayload:
    if token is None:
        raise AuthenticationException("Autentikasi diperlukan.", "missing_token")
    payload = verify_access_token(token)

    return payload


JWTPayloadDep = Annotated[JWTPayload, Depends(get_token_payload)]


def ensure_admin(payload: JWTPayloadDep) -> None:
    if UserRole(payload.role) != UserRole.ADMIN:
        raise NotAllowedException("Aksi dilarang.")


EnsureAdminDep = Depends(ensure_admin)


async def get_current_user(
    payload: JWTPayloadDep,
    user_service: Annotated[UserService, Depends(get_user_service)],
) -> User:
    user = await user_service.get_by_id(payload.sub)
    if user is None:
        raise AuthenticationException("Autentikasi gagal.")
    _ensure_user_active(user)
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]


async def get_current_student(
    payload: JWTPayloadDep,
    student_service: Annotated[StudentService, Depends(get_student_service)],
) -> Student:
    if UserRole(payload.role) != UserRole.STUDENT:
        raise NotAllowedException("Aksi dilarang.")
    student = await student_service.get_by_user_id(payload.sub)
    if student is None:
        raise AuthenticationException("Autentikasi gagal.")
    _ensure_user_active(student.user)
    return student


CurrentStudentDep = Annotated[Student, Depends(get_current_student)]


def _ensure_user_active(user: User):
    if user.is_suspended:
        raise NotAllowedException("Akun Anda telah ditangguhkan.", "account_suspended")
