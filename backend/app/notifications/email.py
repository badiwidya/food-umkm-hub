from app.config import Environment, settings


# TODO: implement email API service
async def send_email(to: str, subject: str, body: str) -> None:
    if settings.APP_ENV == Environment.LOCAL:
        print("====================================")
        print(f"[EMAIL] to={to}, subject={subject}")
        print(body)
        print("====================================")
        return

    raise NotImplementedError
