from typing import Annotated

from fastapi import Depends

from app.dependency import SessionDep
from app.favorites.repository import FavoriteRepository
from app.favorites.service import FavoriteService


def get_favorite_repo(session: SessionDep) -> FavoriteRepository:
    return FavoriteRepository(session=session)


FavoriteRepoDep = Annotated[FavoriteRepository, Depends(get_favorite_repo)]


def get_favorite_service(favorite_repo: FavoriteRepoDep) -> FavoriteService:
    return FavoriteService(favorite_repo=favorite_repo)


FavoriteServiceDep = Annotated[FavoriteService, Depends(get_favorite_service)]
