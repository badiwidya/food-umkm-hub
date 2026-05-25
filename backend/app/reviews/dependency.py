from typing import Annotated

from fastapi import Depends

from app.dependency import SessionDep
from app.orders.repository import OrderRepository
from app.products.repository import ProductRepository
from app.reviews.repository import ReviewRepository
from app.reviews.service import ReviewService
from app.stores.repository import StoreRepository


def get_review_repo(session: SessionDep) -> ReviewRepository:
    return ReviewRepository(session=session)


ReviewRepoDep = Annotated[ReviewRepository, Depends(get_review_repo)]


def get_review_service(session: SessionDep) -> ReviewService:
    return ReviewService(
        review_repo=ReviewRepository(session=session),
        order_repo=OrderRepository(session=session),
        product_repo=ProductRepository(session=session),
        store_repo=StoreRepository(session=session),
    )


ReviewServiceDep = Annotated[ReviewService, Depends(get_review_service)]
