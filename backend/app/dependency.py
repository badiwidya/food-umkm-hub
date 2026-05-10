from collections.abc import AsyncGenerator
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import factory


@dataclass
class PaginationQuery:
    page: Annotated[int, Query(ge=1)] = 1
    page_size: Annotated[int, Query(ge=1, le=100, alias="pageSize")] = 16


PaginationQueryDep = Annotated[PaginationQuery, Depends()]


async def get_db_session() -> AsyncGenerator[AsyncSession]:
    async with factory() as session, session.begin():
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_db_session)]
