from enum import StrEnum
from pathlib import Path

from pydantic import computed_field
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(StrEnum):
    LOCAL = "local"
    PRODUCTION = "production"


def _get_env_path() -> str:
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        raise FileNotFoundError(".env not found")
    return str(env_path)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_get_env_path(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: Environment = Environment.LOCAL

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_DB: str

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
