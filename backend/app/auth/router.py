from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, status

from app.auth.dependency import get_auth_service
from app.auth.dto import RegisterMahasiswaDTO, RegisterUMKMDTO
from app.auth.schema import (
    ConfirmResetPasswordRequest,
    LoginRequest,
    LoginResponse,
    RegisterMahasiswaRequest,
    RegisterUMKMRequest,
    ResendEmailVerificationRequest,
    ResetPasswordRequest,
    VerifyTokenRequest,
)
from app.auth.service import AuthService
from app.notifications.email import send_email

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@auth_router.post(
    "/mahasiswa/register",
    summary="Pendaftaran akun mahasiswa.",
    status_code=status.HTTP_201_CREATED,
)
async def register_mahasiswa(
    payload: RegisterMahasiswaRequest,
    auth_service: AuthServiceDep,
    background_tasks: BackgroundTasks,
):
    dto = RegisterMahasiswaDTO(
        full_name=payload.full_name,
        email=payload.email,
        phone_number=str(payload.phone_number),
        password=payload.password,
    )

    link = await auth_service.register_student(dto)
    background_tasks.add_task(send_email, payload.email, "Aktivasi Akun", link)


@auth_router.post(
    "/umkm/register",
    summary="Pendaftaran akun UMKM.",
    status_code=status.HTTP_201_CREATED,
)
async def register_umkm(
    payload: RegisterUMKMRequest,
    auth_service: AuthServiceDep,
    background_tasks: BackgroundTasks,
):
    dto = RegisterUMKMDTO(
        full_name=payload.full_name,
        email=payload.email,
        phone_number=str(payload.phone_number),
        password=payload.password,
    )

    link = await auth_service.register_merchant(dto)
    background_tasks.add_task(
        send_email,
        payload.email,
        "Aktivasi Akun",
        link,
    )


@auth_router.post(
    "/login",
    summary="Login dan mendapatkan access token.",
    status_code=status.HTTP_200_OK,
)
async def login(
    payload: LoginRequest,
    auth_service: AuthServiceDep,
):
    token = await auth_service.login(payload.email, payload.password)

    return LoginResponse(access_token=token)


@auth_router.post(
    "/email/verify",
    summary="Verifikasi email setelah pendaftaran.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def verify_email(
    payload: VerifyTokenRequest,
    auth_service: AuthServiceDep,
):
    await auth_service.verify_email(payload.token_id, payload.token)


@auth_router.post(
    "/email/resend",
    summary="Mengirim ulang email verifikasi akun.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def resend_email_verification(
    payload: ResendEmailVerificationRequest,
    auth_service: AuthServiceDep,
    background_tasks: BackgroundTasks,
):
    """Selalu mengembalikan 204 meski email tidak terdaftar atau sudah terverifikasi"""
    link = await auth_service.issue_email_verification_token(payload.email)
    if link:
        background_tasks.add_task(send_email, payload.email, "Aktivasi Akun", link)


@auth_router.post(
    "/email-change/verify",
    summary="Verifikasi perubahan email",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def verify_email_change(
    payload: VerifyTokenRequest,
    auth_service: AuthServiceDep,
):
    """Melakukan permintaan perubahan email ada di endpoint `POST /users/me/email`."""
    await auth_service.verify_email_change(payload.token_id, payload.token)


@auth_router.post(
    "/password/reset",
    summary="Meminta tautan reset password.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def request_reset_password(
    payload: ResetPasswordRequest,
    auth_service: AuthServiceDep,
    background_tasks: BackgroundTasks,
):
    """Selalu mengembalikan 204 meski email tidak terdaftar."""
    link = await auth_service.request_reset_password(payload.email)
    if link:
        background_tasks.add_task(
            send_email, payload.email, "Permintaan Reset Password", link
        )


@auth_router.post(
    "/password/reset/confirm",
    summary="Konfirmasi reset password dengan token.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def confirm_reset_password(
    payload: ConfirmResetPasswordRequest,
    auth_service: AuthServiceDep,
):
    await auth_service.confirm_reset_password(
        payload.token_id, payload.token, payload.new_password
    )
