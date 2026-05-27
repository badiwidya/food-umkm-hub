import resend

from app.config import Environment, settings


def send_email(to: str, subject: str, html_body: str) -> None:
    resend.api_key = settings.RESEND_API_KEY
    if settings.APP_ENV == Environment.LOCAL:
        print("====================================")
        print(f"[EMAIL] to={to}, subject={subject}")
        print(html_body)
        print("====================================")
        return

    resend.Emails.send(
        {
            "from": settings.RESEND_SENDER_EMAIL,
            "to": to,
            "subject": subject,
            "html": html_body,
        }
    )
