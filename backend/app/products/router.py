from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.auth.dependency import CurrentStoreDep
from app.dependency import PaginationQueryDep
from app.products.dependency import AuthorizedProductTargetDep, ProductServiceDep
from app.products.dto import CreateProductDTO
from app.products.enum import ProductCategory
from app.products.schema import (
    CreateProductRequest,
    ProductDetailResponse,
    ProductListResponse,
    ProductSummaryResponse,
    UpdateAvailabilityRequest,
    UpdateProductRequest,
)
from app.schema import MessageResponse

product_router = APIRouter(prefix="/products", tags=["Products"])
store_product_router = APIRouter(prefix="/stores", tags=["Products"])


@product_router.get("/", status_code=status.HTTP_200_OK)
async def get_all_products(
    product_service: ProductServiceDep,
    pagination: PaginationQueryDep,
    store_open: Annotated[bool | None, Query()] = None,
    available: Annotated[bool | None, Query()] = None,
    category: Annotated[ProductCategory | None, Query()] = None,
    keyword: Annotated[str | None, Query(alias="search")] = None,
) -> ProductListResponse:
    products, count = await product_service.list_all(
        is_store_open=store_open,
        is_product_available=available,
        category=category,
        keyword=keyword,
        page=pagination.page,
        page_size=pagination.page_size,
    )

    return ProductListResponse(
        page=pagination.page,
        page_size=pagination.page_size,
        total=count,
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


@store_product_router.get("/me/products", status_code=status.HTTP_200_OK)
async def get_my_products(
    product_service: ProductServiceDep,
    store: CurrentStoreDep,
    pagination: PaginationQueryDep,
    available: Annotated[bool | None, Query()] = None,
    category: Annotated[ProductCategory | None, Query()] = None,
    keyword: Annotated[str | None, Query(alias="search")] = None,
) -> ProductListResponse:
    products, count = await product_service.list_by_store(
        store_id=store.id,
        is_product_available=available,
        category=category,
        keyword=keyword,
        page=pagination.page,
        page_size=pagination.page_size,
        is_owner=True,
    )
    return ProductListResponse(
        page=pagination.page,
        page_size=pagination.page_size,
        total=count,
        data=[ProductSummaryResponse.model_validate(product) for product in products],
    )


@store_product_router.get("/{store_id}/products", status_code=status.HTTP_200_OK)
async def get_products_by_store(
    product_service: ProductServiceDep,
    store_id: UUID,
    pagination: PaginationQueryDep,
    available: Annotated[bool | None, Query()] = None,
    category: Annotated[ProductCategory | None, Query()] = None,
    keyword: Annotated[str | None, Query(alias="search")] = None,
) -> ProductListResponse:
    products, count = await product_service.list_by_store(
        store_id=store_id,
        is_product_available=available,
        category=category,
        keyword=keyword,
        page=pagination.page,
        page_size=pagination.page_size,
        is_owner=False,
    )
    return ProductListResponse(
        page=pagination.page,
        page_size=pagination.page_size,
        total=count,
        data=[ProductSummaryResponse.model_validate(product) for product in products],
    )
