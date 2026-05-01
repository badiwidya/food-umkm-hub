import os
from collections.abc import AsyncGenerator, Awaitable, Callable
from typing import Any

import pytest
from alembic.config import Config
from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from alembic import command
from app.config import settings
from app.database import factory
from app.security import hash_password
from app.users.entity import User
from app.users.enum import UserRole
from app.users.repository import UserRepository

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

ALEMBIC_INI_PATH = os.path.join(BASE_DIR, "alembic.ini")


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    alembic_cfg = Config(ALEMBIC_INI_PATH)
    command.upgrade(alembic_cfg, "head")
    yield


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession]:
    test_engine = create_async_engine(
        url=settings.DB_URI, poolclass=NullPool, echo=False
    )

    async with test_engine.connect() as connection:
        await connection.begin()

        async with factory(
            bind=connection, join_transaction_mode="create_savepoint"
        ) as session:
            yield session

        await connection.rollback()


UserFactory = Callable[..., Awaitable[Any]]


@pytest.fixture
def user_factory(db_session: AsyncSession) -> UserFactory:
    async def _make_user(
        full_name: str = "Makise Kurisu",
        email: str = "makise@amadeus.com",
        phone_number: str = "+6288887776666",
        password: str = "supersecret",
        role: UserRole = UserRole.STUDENT,
        **kwargs,
    ) -> User:
        user = User.register(
            full_name=full_name,
            email=email,
            phone_number=phone_number,
            password_hash=hash_password(password),
            role=role,
        )

        for k, v in kwargs.items():
            setattr(user, k, v)

        await UserRepository(db_session).save(user)
        await db_session.flush()
        return user

    return _make_user
