from typing import Annotated
from uuid import UUID

from fastapi import Depends

from app.auth.dependency import CurrentStoreDep
from app.dependency import SessionDep
from app.exception import NotAllowedException
from app.products.entity import Product
from app.products.repository import ProductRepository
from app.products.service import ProductService


def get_product_repo(session: SessionDep) -> ProductRepository:
    return ProductRepository(session=session)


ProductRepoDep = Annotated[ProductRepository, Depends(get_product_repo)]


def get_product_service(product_repo: ProductRepoDep) -> ProductService:
    return ProductService(product_repo=product_repo)


ProductServiceDep = Annotated[ProductService, Depends(get_product_service)]


async def authorized_product_target_from_path(
    product_service: ProductServiceDep, id: UUID, store: CurrentStoreDep
) -> Product:
    product = await product_service.get_details(id)
    if product.store_id != store.id:
        raise NotAllowedException("Aksi dilarang")
    return product


AuthorizedProductTargetDep = Annotated[
    Product, Depends(authorized_product_target_from_path)
]
