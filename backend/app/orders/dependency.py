from typing import Annotated
from uuid import UUID

from fastapi import Depends

from app.auth.dependency import CurrentUserDep
from app.dependency import SessionDep
from app.domains.order import Order
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


async def authorized_order_target_from_path(
    order_service: OrderServiceDep, user: CurrentUserDep, id: UUID
) -> Order:
    order = await order_service.get_details(user, id)
    return order


AuthorizedOrderTargetDep = Annotated[Order, Depends(authorized_order_target_from_path)]
