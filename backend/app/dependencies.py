from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import factory


async def get_db_session() -> AsyncGenerator[AsyncSession]:
    async with factory() as session, session.begin():
        yield session
