import resend

from app.config import Environment, settings


# TODO: implement email API service
async def send_email(to: str, subject: str, verification_link: str) -> None:
    if settings.APP_ENV == Environment.LOCAL:
        print("====================================")
        print(f"[EMAIL] to={to}, subject={subject}")
        print(verification_link)
        print("====================================")
        return

    await resend.Emails.send_async(
        {
            "from": settings.RESEND_SENDER_EMAIL,
            "to": to,
            "subject": subject,
            "html": f'<a href="{verification_link}">Klik</a> untuk verifikasi email Anda.',
        }
    )
