from app.config import Environment, settings


# TODO: implement SMS/Whatsapp/Email API
async def send_otp(to: str, otp: str) -> None:
    if settings.APP_ENV == Environment.LOCAL:
        print("=======================")
        print(f"[{to}] OTP: {otp}")
        print("=======================")
        return

    raise NotImplementedError
