from fastapi import APIRouter, BackgroundTasks, status

from app.auth.dependency import CurrentUserDep
from app.notifications.email import send_email
from app.notifications.sms import send_otp
from app.users.dependency import (
    UserServiceDep,
)
from app.users.schema import (
    ChangePasswordRequest,
    EmailChangeRequest,
    NumberChangeRequest,
    UpdateProfileRequest,
    UserResponse,
    VerifyPhoneRequest,
)

user_router = APIRouter(prefix="/users", tags=["Users"])


@user_router.patch(
    "/me",
    summary="Memperbarui profil pengguna yang sedang login.",
    status_code=status.HTTP_200_OK,
)
async def update_current_profile(
    user_service: UserServiceDep, user: CurrentUserDep, payload: UpdateProfileRequest
) -> UserResponse:
    data = payload.model_dump(exclude_unset=True)
    updated_user = await user_service.update_profile(user, data)
    return UserResponse.model_validate(updated_user)


@user_router.delete(
    "/me",
    summary="Menghapus akun pengguna yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_current_user(
    user_service: UserServiceDep, user: CurrentUserDep
) -> None:
    await user_service.delete(user)


@user_router.post(
    "/me/email",
    summary="Meminta perubahan email pengguna yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def request_email_change(
    user_service: UserServiceDep,
    background_tasks: BackgroundTasks,
    user: CurrentUserDep,
    payload: EmailChangeRequest,
) -> None:
    url = await user_service.request_email_change(user, payload.email)
    background_tasks.add_task(
        send_email, payload.email, "Verifikasi Perubahan Email", url
    )


@user_router.post(
    "/me/email/resend",
    summary="Mengirim ulang email verifikasi perubahan email.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def resend_email_change_verification(
    user_service: UserServiceDep,
    user: CurrentUserDep,
    background_tasks: BackgroundTasks,
) -> None:
    url = await user_service.issue_email_change_verification_token(user)
    background_tasks.add_task(
        send_email, str(user.pending_email), "Verifikasi Perubahan Email", url
    )


@user_router.post(
    "/me/phone",
    summary="Mengubah nomor telepon pengguna yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def change_phone_number(
    user_service: UserServiceDep,
    background_tasks: BackgroundTasks,
    user: CurrentUserDep,
    payload: NumberChangeRequest,
) -> UserResponse:
    otp, updated_user = await user_service.change_phone_number(
        user, str(payload.phone_number)
    )
    background_tasks.add_task(send_otp, str(payload.phone_number), otp)
    return UserResponse.model_validate(updated_user)


@user_router.post(
    "/me/phone/verify",
    summary="Verifikasi nomor telepon.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def verify_phone(
    user_service: UserServiceDep, user: CurrentUserDep, payload: VerifyPhoneRequest
) -> None:
    await user_service.verify_phone(user, payload.otp)


@user_router.post(
    "/me/phone/resend",
    summary="Mengirim ulang kode OTP verifikasi nomor telepon.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def resend_phone_otp(
    user_service: UserServiceDep,
    background_tasks: BackgroundTasks,
    user: CurrentUserDep,
) -> None:
    otp = await user_service.issue_phone_verification_otp(user)
    background_tasks.add_task(send_otp, user.phone_number, otp)


@user_router.post(
    "/me/password",
    summary="Mengganti password pengguna yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def change_password(
    user_service: UserServiceDep, user: CurrentUserDep, payload: ChangePasswordRequest
) -> None:
    await user_service.change_password(user, payload.old_password, payload.new_password)
