from typing import Annotated, cast
from uuid import UUID

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.auth.service import AuthService
from app.exception import AuthenticationException, NotAllowedException
from app.security import JWTPayload, verify_access_token
from app.stores.dependency import StoreRepoDep, StoreServiceDep
from app.stores.store import Store
from app.students.dependency import StudentRepoDep, StudentServiceDep
from app.students.student import Student
from app.users.admin import Admin
from app.users.dependency import UserRepoDep, UserServiceDep, VerificationTokenRepoDep
from app.users.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


async def get_auth_service(
    user_repo: UserRepoDep,
    token_repo: VerificationTokenRepoDep,
    student_repo: StudentRepoDep,
    store_repo: StoreRepoDep,
) -> AuthService:
    return AuthService(
        user_repo=user_repo,
        token_repo=token_repo,
        student_repo=student_repo,
        store_repo=store_repo,
    )


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


def get_token_payload(
    token: Annotated[str | None, Depends(oauth2_scheme)] = None,
) -> JWTPayload:
    if token is None:
        raise AuthenticationException("Autentikasi diperlukan", "missing_token")
    payload = verify_access_token(token)

    return payload


JWTPayloadDep = Annotated[JWTPayload, Depends(get_token_payload)]


def ensure_admin(payload: JWTPayloadDep) -> UUID:
    if UserRole(payload.role) != UserRole.ADMIN:
        raise NotAllowedException("Aksi dilarang")
    return payload.sub


EnsureAdminDep = Depends(ensure_admin)


async def get_current_admin(
    admin_id: Annotated[UUID, Depends(ensure_admin)], user_service: UserServiceDep
):
    admin = await user_service.get_details(admin_id)
    if admin is None:
        raise AuthenticationException("Autentikasi gagal")
    return cast(Admin, admin)


CurrentAdminDep = Annotated[Admin, Depends(get_current_admin)]


async def get_current_user(
    payload: JWTPayloadDep,
    user_service: UserServiceDep,
) -> User:
    user = await user_service.get_details(payload.sub)
    if user is None:
        raise AuthenticationException("Autentikasi gagal")
    if user.is_suspended:
        raise NotAllowedException("Akun Anda telah ditangguhkan", "account_suspended")
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]


async def get_current_student(
    payload: JWTPayloadDep,
    student_service: StudentServiceDep,
) -> Student:
    if UserRole(payload.role) != UserRole.STUDENT:
        raise NotAllowedException("Aksi dilarang")
    student = await student_service.get_details(payload.sub)
    if student is None:
        raise AuthenticationException("Autentikasi gagal")
    if student.is_suspended:
        raise NotAllowedException("Akun Anda telah ditangguhkan", "account_suspended")
    return student


CurrentStudentDep = Annotated[Student, Depends(get_current_student)]


async def get_current_store(
    payload: JWTPayloadDep, store_service: StoreServiceDep
) -> Store:
    if UserRole(payload.role) != UserRole.SELLER:
        raise NotAllowedException("Aksi dilarang.")
    store = await store_service.get_details_by_owner_id(payload.sub)
    if store is None:
        raise AuthenticationException("Autentikasi gagal")
    return store


CurrentStoreDep = Annotated[Store, Depends(get_current_store)]
