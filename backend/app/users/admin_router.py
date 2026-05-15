"""
Prefix: /admin/users
"""

from typing import Annotated

from fastapi import APIRouter, Query, status

from app.dependency import PaginationQueryDep
from app.users.dependency import UserServiceDep, UserTargetDep
from app.users.enum import UserRole, UserStatus
from app.users.schema import UserListResponse, UserResponse

user_admin_router = APIRouter()


@user_admin_router.get(
    "/",
    summary="Mendapatkan daftar semua pengguna.",
    status_code=status.HTTP_200_OK,
)
async def list_users(
    user_service: UserServiceDep,
    pagination: PaginationQueryDep,
    status: Annotated[UserStatus | None, Query()] = None,
    role: Annotated[UserRole | None, Query()] = None,
) -> UserListResponse:
    users, count = await user_service.list(
        page=pagination.page,
        page_size=pagination.page_size,
        status=status,
        role=role,
    )
    return UserListResponse(
        page=pagination.page,
        page_size=pagination.page_size,
        total=count,
        data=[UserResponse.model_validate(user) for user in users],
    )


@user_admin_router.delete(
    "/{id}",
    summary="Menghapus akun pengguna tertentu.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_target_user(
    user_service: UserServiceDep, target: UserTargetDep
) -> None:
    await user_service.delete(target)


@user_admin_router.post(
    "/{id}/suspend",
    summary="Menangguhkan akun pengguna tertentu.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def suspend_target_user(
    user_service: UserServiceDep, target: UserTargetDep
) -> None:
    await user_service.suspend(target)


@user_admin_router.post(
    "/{id}/unsuspend",
    summary="Memulihkan akun pengguna yang ditangguhkan.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def unsuspend_target_user(
    user_service: UserServiceDep, target: UserTargetDep
) -> None:
    await user_service.unsuspend(target)
