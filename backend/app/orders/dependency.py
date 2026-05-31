from typing import Annotated
from uuid import UUID

from fastapi import Depends

from app.auth.dependency import CurrentUserDep
from app.dependency import SessionDep
from app.exception import NotAllowedException
from app.orders.order import Order
from app.orders.repository import OrderRepository
from app.orders.service import OrderService
from app.products.dependency import ProductRepoDep
from app.promos.dependency import PromoRepoDep
from app.reviews.repository import ReviewRepository
from app.stores.dependency import StoreRepoDep
from app.users.dependency import UserRepoDep
from app.users.user import User, UserRole


def get_order_repo(session: SessionDep) -> OrderRepository:
    return OrderRepository(session=session)


OrderRepoDep = Annotated[OrderRepository, Depends(get_order_repo)]


def get_order_service(
    order_repo: OrderRepoDep,
    product_repo: ProductRepoDep,
    promo_repo: PromoRepoDep,
    store_repo: StoreRepoDep,
    user_repo: UserRepoDep,
    session: SessionDep,
) -> OrderService:
    return OrderService(
        order_repo=order_repo,
        product_repo=product_repo,
        promo_repo=promo_repo,
        store_repo=store_repo,
        user_repo=user_repo,
        review_repo=ReviewRepository(session=session),
    )


OrderServiceDep = Annotated[OrderService, Depends(get_order_service)]


async def _get_order_and_authorized_user(
    order_service: OrderServiceDep, user: CurrentUserDep, id: UUID
) -> tuple[Order, User]:
    order = await order_service.get_details(user, id)
    return order, user


_AuthorizedOrderUserDep = Annotated[
    tuple[Order, User], Depends(_get_order_and_authorized_user)
]


async def authorized_order_target_from_path(data: _AuthorizedOrderUserDep) -> Order:
    order, _ = data
    return order


AuthorizedOrderTargetDep = Annotated[Order, Depends(authorized_order_target_from_path)]


async def authorized_student_order_target_from_path(
    data: _AuthorizedOrderUserDep,
) -> Order:
    order, user = data
    if user.role != UserRole.STUDENT:
        raise NotAllowedException("Aksi dilarang")
    return order


AuthorizedStudentOrderTargetDep = Annotated[
    Order, Depends(authorized_student_order_target_from_path)
]


async def authorized_seller_order_target_from_path(
    data: _AuthorizedOrderUserDep,
) -> Order:
    order, user = data
    if user.role != UserRole.SELLER:
        raise NotAllowedException("Aksi dilarang")
    return order


AuthorizedSellerOrderTargetDep = Annotated[
    Order, Depends(authorized_seller_order_target_from_path)
]
