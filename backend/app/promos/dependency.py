from typing import Annotated
from uuid import UUID

from fastapi import Depends

from app.auth.dependency import CurrentStoreDep
from app.dependency import SessionDep
from app.domains.promo import Promo
from app.exception import NotAllowedException
from app.promos.repository import PromoRepository
from app.promos.service import PromoService


def get_promo_repo(session: SessionDep) -> PromoRepository:
    return PromoRepository(session=session)


PromoRepoDep = Annotated[PromoRepository, Depends(get_promo_repo)]


def get_promo_service(promo_repo: PromoRepoDep) -> PromoService:
    return PromoService(promo_repo=promo_repo)


PromoServiceDep = Annotated[PromoService, Depends(get_promo_service)]


async def authorized_promo_target_from_path(
    promo_service: PromoServiceDep, id: UUID, store: CurrentStoreDep
) -> Promo:
    promo = await promo_service.get_details(id)
    if promo.store_id != store.id:
        raise NotAllowedException("Aksi dilarang")
    return promo


AuthorizedPromoTargetDep = Annotated[Promo, Depends(authorized_promo_target_from_path)]
