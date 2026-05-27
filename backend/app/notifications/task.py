from celery import shared_task

from app.notifications.email import send_email


@shared_task(
    name="email.send_verification_email",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    retry_kwargs={"max_retries": 3},
)
def send_verification_email_task(to: str, verification_link: str) -> None:
    send_email(
        to,
        "Verifikasi email Anda",
        html_body=f'<a href="{verification_link}">Klik</a> untuk memverifikasi email Anda',
    )


@shared_task(
    name="email.send_phone_otp",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    retry_kwargs={"max_retries": 3},
)
def send_otp_task(to: str, otp: str) -> None:
    send_email(to, "Verifikasi nomor telepon Anda", html_body=f"Kode OTP: {otp}")


@shared_task(
    name="email.send_reset_password_link",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    retry_kwargs={"max_retries": 3},
)
def send_password_reset_link_task(to: str, reset_password_link: str) -> None:
    send_email(
        to,
        "Reset password Anda",
        html_body=f'<a href="{reset_password_link}">Klik</a> untuk me-reset password Anda',
    )


@shared_task(
    name="email.send_notification",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_jitter=True,
    retry_kwargs={"max_retries": 3},
)
def send_notification(to: str, subject: str, body: str) -> None:
    send_email(to, subject, html_body=body)
