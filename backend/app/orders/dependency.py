from typing import Annotated

from fastapi import Depends

from app.dependency import SessionDep
from app.orders.repository import OrderRepository
from app.orders.service import OrderService
from app.products.dependency import ProductRepoDep
from app.promos.dependency import PromoRepoDep
from app.stores.dependency import StoreRepoDep


def get_order_repo(session: SessionDep) -> OrderRepository:
    return OrderRepository(session=session)


OrderRepoDep = Annotated[OrderRepository, Depends(get_order_repo)]


def get_order_service(
    order_repo: OrderRepoDep,
    product_repo: ProductRepoDep,
    promo_repo: PromoRepoDep,
    store_repo: StoreRepoDep,
) -> OrderService:
    return OrderService(
        order_repo=order_repo,
        product_repo=product_repo,
        promo_repo=promo_repo,
        store_repo=store_repo,
    )


OrderServiceDep = Annotated[OrderService, Depends(get_order_service)]
