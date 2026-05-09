from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.products.dependency import ProductServiceDep
from app.products.enum import ProductCategory
from app.products.schema import (
    Pagination,
    ProductDetailResponse,
    ProductListResponse,
    ProductSummaryResponse,
)

product_router = APIRouter(prefix="/products", tags=["Products"])


@product_router.get("/", status_code=status.HTTP_200_OK)
async def get_all_products(
    product_service: ProductServiceDep,
    store_open: Annotated[bool | None, Query()] = None,
    available: Annotated[bool | None, Query()] = None,
    category: Annotated[ProductCategory | None, Query()] = None,
    keyword: Annotated[str | None, Query(alias="q")] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 16,
) -> ProductListResponse:
    products, count = await product_service.list(
        is_store_open=store_open,
        is_product_available=available,
        category=category,
        keyword=keyword,
        page=page,
        page_size=page_size,
    )

    return ProductListResponse(
        metadata=Pagination(
            page=page,
            page_size=page_size,
            total=count,
        ),
        data=[ProductSummaryResponse.model_validate(product) for product in products],
    )


@product_router.get("/{id}", status_code=status.HTTP_200_OK)
async def get_product_details(
    product_service: ProductServiceDep, id: UUID
) -> ProductDetailResponse:
    product = await product_service.get_details(id)

    return ProductDetailResponse.model_validate(product)
