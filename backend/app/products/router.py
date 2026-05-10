from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.auth.dependency import CurrentStoreDep
from app.products.dependency import AuthorizedProductTargetDep, ProductServiceDep
from app.products.dto import CreateProductDTO
from app.products.enum import ProductCategory
from app.products.schema import (
    CreateProductRequest,
    Pagination,
    ProductDetailResponse,
    ProductListResponse,
    ProductSummaryResponse,
    UpdateAvailabilityRequest,
    UpdateProductRequest,
)
from app.schema import MessageResponse

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


@product_router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(
    product_service: ProductServiceDep,
    store: CurrentStoreDep,
    payload: CreateProductRequest,
) -> ProductDetailResponse:
    dto = CreateProductDTO(
        store=store,
        name=payload.name,
        price=payload.price,
        category=payload.category,
        description=payload.description,
        photo_url=payload.photo_url,
    )
    product = await product_service.create(dto)

    return ProductDetailResponse.model_validate(product)


@product_router.get("/{id}", status_code=status.HTTP_200_OK)
async def get_product_details(
    product_service: ProductServiceDep, id: UUID
) -> ProductDetailResponse:
    product = await product_service.get_details(id)

    return ProductDetailResponse.model_validate(product)


@product_router.patch("/{id}", status_code=status.HTTP_200_OK)
async def update_product_information(
    product_service: ProductServiceDep,
    product: AuthorizedProductTargetDep,
    payload: UpdateProductRequest,
) -> ProductDetailResponse:
    product = await product_service.update_information(
        product, payload.model_dump(exclude_unset=True)
    )
    return ProductDetailResponse.model_validate(product)


@product_router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_product(
    product_service: ProductServiceDep,
    product: AuthorizedProductTargetDep,
) -> MessageResponse:
    await product_service.delete(product)
    return MessageResponse(message="Produk berhasil dihapus")


@product_router.patch("/{id}/availability", status_code=status.HTTP_200_OK)
async def update_product_availability(
    product_service: ProductServiceDep,
    product: AuthorizedProductTargetDep,
    payload: UpdateAvailabilityRequest,
) -> ProductDetailResponse:
    product = await product_service.update_availability(product, payload.is_available)
    return ProductDetailResponse.model_validate(product)
