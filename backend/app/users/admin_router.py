"""
Prefix: /admin/users
"""

from typing import Annotated

from fastapi import APIRouter, Query, status

from app.users.dependency import UserServiceDep, UserTargetDep
from app.users.enum import UserRole, UserStatus
from app.users.schema import Pagination, UserListResponse, UserResponse

user_admin_router = APIRouter()


@user_admin_router.get(
    "/",
    summary="Mendapatkan daftar semua pengguna.",
    status_code=status.HTTP_200_OK,
)
async def list_users(
    user_service: UserServiceDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    status: Annotated[UserStatus | None, Query()] = None,
    role: Annotated[UserRole | None, Query()] = None,
) -> UserListResponse:
    users, count = await user_service.list(
        page=page, page_size=page_size, status_filter=status, role_filter=role
    )
    return UserListResponse(
        metadata=Pagination(page=page, page_size=page_size, total=count),
        data=[UserResponse.model_validate(user) for user in users],
    )


@user_admin_router.delete(
    "/{id}",
    summary="Menghapus akun pengguna tertentu.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_target_user(
    target: UserTargetDep, user_service: UserServiceDep
) -> None:
    await user_service.delete(target)


@user_admin_router.post(
    "/{id}/suspend",
    summary="Menangguhkan akun pengguna tertentu.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def suspend_target_user(
    target: UserTargetDep, user_service: UserServiceDep
) -> None:
    await user_service.suspend(target)


@user_admin_router.post(
    "/{id}/unsuspend",
    summary="Memulihkan akun pengguna yang ditangguhkan.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def unsuspend_target_user(
    target: UserTargetDep, user_service: UserServiceDep
) -> None:
    await user_service.unsuspend(target)
