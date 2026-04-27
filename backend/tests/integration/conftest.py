import os
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from alembic.config import Config
from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from alembic import command
from app.config import settings
from app.database import factory

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

ALEMBIC_INI_PATH = os.path.join(BASE_DIR, "alembic.ini")


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    alembic_cfg = Config(ALEMBIC_INI_PATH)
    command.upgrade(alembic_cfg, "head")
    yield


@pytest_asyncio.fixture
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
