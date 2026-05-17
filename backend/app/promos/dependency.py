from typing import Annotated

from fastapi import Depends

from app.dependency import SessionDep
from app.promos.repository import PromoRepository
from app.promos.service import PromoService


def get_promo_repo(session: SessionDep) -> PromoRepository:
    return PromoRepository(session=session)


PromoRepositoryDep = Annotated[PromoRepository, Depends(get_promo_repo)]


def get_promo_service(promo_repo: PromoRepositoryDep) -> PromoService:
    return PromoService(promo_repo=promo_repo)


PromoServiceDep = Annotated[PromoService, Depends(get_promo_service)]
