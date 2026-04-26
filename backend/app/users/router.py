from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Query, status

from app.auth.dependency import ensure_admin, get_current_user
from app.notifications.email import send_email
from app.notifications.sms import send_otp
from app.users.dependency import get_user_service, user_target_from_path
from app.users.entity import User
from app.users.enum import UserRole, UserStatus
from app.users.schema import (
    ChangePasswordRequest,
    EmailChangeRequest,
    NumberChangeRequest,
    Pagination,
    UpdateProfileRequest,
    UserListResponse,
    UserResponse,
)
from app.users.service import UserService

user_router = APIRouter(prefix="/users", tags=["users"])

UserServiceDep = Annotated[UserService, Depends(get_user_service)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]
EnsureAdminDep = Depends(ensure_admin)
UserTargetDep = Annotated[User, Depends(user_target_from_path)]


@user_router.get(
    "/",
    summary="Mendapatkan daftar semua pengguna.",
    dependencies=[EnsureAdminDep],
    status_code=status.HTTP_200_OK,
)
async def list_users(
    user_service: UserServiceDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    status: Annotated[UserStatus | None, Query()] = None,
    role: Annotated[UserRole | None, Query()] = None,
) -> UserListResponse:
    """Mengambil daftar pengguna terdaftar dengan dukungan filter dan paginasi.

    Hanya dapat diakses oleh **admin**."""

    users, count = await user_service.list(
        page=page,
        page_size=page_size,
        status_filter=status,
        role_filter=role,
    )
    return UserListResponse(
        metadata=Pagination(
            page=page,
            page_size=page_size,
            total=count,
        ),
        data=[UserResponse.model_validate(user) for user in users],
    )


@user_router.patch(
    "/me",
    summary="Memperbarui profil pengguna yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def update_profile(
    user: CurrentUserDep,
    user_service: UserServiceDep,
    payload: UpdateProfileRequest,
) -> None:
    data = payload.model_dump(exclude_unset=True)
    await user_service.change_profile_details(user, data)


@user_router.delete(
    "/me",
    summary="Menghapus akun pengguna yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_current_user(
    user: CurrentUserDep,
    user_service: UserServiceDep,
):
    await user_service.delete(user)


@user_router.post(
    "/me/email",
    summary="Meminta perubahan email pengguna yang sedang login.",
    status_code=status.HTTP_202_ACCEPTED,
)
async def request_email_change(
    user: CurrentUserDep,
    user_service: UserServiceDep,
    background_tasks: BackgroundTasks,
    payload: EmailChangeRequest,
):
    url = await user_service.request_email_change(user, payload.email)
    background_tasks.add_task(
        send_email,
        payload.email,
        "Verifikasi Perubahan Email",
        url,
    )


@user_router.post(
    "/me/email/resend-verification",
    summary="Mengirim ulang email verifikasi perubahan email.",
    status_code=status.HTTP_202_ACCEPTED,
)
async def resend_email_change_verification(
    user: CurrentUserDep,
    user_service: UserServiceDep,
    background_tasks: BackgroundTasks,
):
    url = await user_service.issue_email_change_verification_token(user)
    background_tasks.add_task(
        send_email,
        str(user.pending_email),
        "Verifikasi Perubahan Email",
        url,
    )


@user_router.post(
    "/me/phone",
    summary="Mengubah nomor telepon pengguna yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def change_phone_number(
    user: CurrentUserDep,
    user_service: UserServiceDep,
    background_tasks: BackgroundTasks,
    payload: NumberChangeRequest,
):
    otp = await user_service.change_phone_number(user, str(payload.phone_number))
    background_tasks.add_task(
        send_otp,
        str(payload.phone_number),
        otp,
    )


@user_router.post(
    "/me/phone/resend-verification",
    summary="Mengirim ulang kode OTP verifikasi nomor telepon.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def resend_phone_otp(
    user: CurrentUserDep,
    user_service: UserServiceDep,
    background_tasks: BackgroundTasks,
):
    otp = await user_service.issue_phone_verification_otp(user)
    background_tasks.add_task(
        send_otp,
        user.phone_number,
        otp,
    )


@user_router.post(
    "/me/password",
    summary="Mengganti password pengguna yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def change_password(
    user: CurrentUserDep,
    user_service: UserServiceDep,
    payload: ChangePasswordRequest,
):
    await user_service.change_password(user, payload.old_password, payload.new_password)


@user_router.delete(
    "/{id}",
    summary="Menghapus akun pengguna tertentu.",
    dependencies=[EnsureAdminDep],
)
async def delete_target_user(
    target: UserTargetDep,
    user_service: UserServiceDep,
):
    """Menonaktifkan akun pengguna berdasarkan ID secara permanen.

    Hanya dapat diakses oleh **admin**."""
    await user_service.delete(target)


@user_router.post(
    "/{id}/suspend",
    summary="Menangguhkan akun pengguna tertentu.",
    dependencies=[EnsureAdminDep],
)
async def suspend_target_user(
    target: UserTargetDep,
    user_service: UserServiceDep,
):
    """Menangguhkan akun pengguna berdasarkan ID sehingga tidak dapat login.

    Hanya dapat diakses oleh **admin**."""
    await user_service.suspend(target)


@user_router.post(
    "/{id}/unsuspend",
    summary="Memulihkan akun pengguna yang ditangguhkan.",
    dependencies=[EnsureAdminDep],
)
async def unsuspend_target_user(
    target: UserTargetDep,
    user_service: UserServiceDep,
):
    """Memulihkan akses akun pengguna berdasarkan ID yang sebelumnya ditangguhkan.

    Hanya dapat diakses oleh **admin**."""
    await user_service.unsuspend(target)
