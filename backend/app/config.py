import os
from enum import StrEnum
from typing import Annotated

from pydantic import AfterValidator, HttpUrl, computed_field
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(StrEnum):
    LOCAL = "local"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=os.getenv("ENV_FILE", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: Environment = Environment.LOCAL

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str

    FRONTEND_URL: Annotated[HttpUrl, AfterValidator(lambda v: str(v).rstrip("/"))]

    JWT_SECRET: str
    JWT_TTL_MINUTES: int
    JWT_ALGORITHM: str = "HS256"

    ORDER_EXPIRY_MINUTES: int
    REJECTION_GRACE_PERIOD_MINUTES: int

    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = ""
    R2_PUBLIC_BASE_URL: Annotated[str, AfterValidator(lambda v: str(v).rstrip("/"))] = (
        ""
    )
    R2_PRESIGNED_EXPIRY: int = 300

    RESEND_API_KEY: str = ""
    RESEND_SENDER_EMAIL: str = ""

    @computed_field
    @property
    def DB_ECHO(self) -> bool:
        return self.APP_ENV == Environment.LOCAL

    @computed_field
    @property
    def DB_URI(self) -> str:
        return MultiHostUrl.build(
            scheme="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        ).unicode_string()


settings = Settings()  # type: ignore
