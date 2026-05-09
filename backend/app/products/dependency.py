from typing import Annotated

from fastapi import Depends

from app.dependency import SessionDep
from app.products.repository import ProductRepository
from app.products.service import ProductService


def get_product_repo(session: SessionDep) -> ProductRepository:
    return ProductRepository(session=session)


ProductRepoDep = Annotated[ProductRepository, Depends(get_product_repo)]


def get_product_service(product_repo: ProductRepoDep) -> ProductService:
    return ProductService(product_repo=product_repo)


ProductServiceDep = Annotated[ProductService, Depends(get_product_service)]
