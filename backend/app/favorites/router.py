from uuid import UUID

from fastapi import APIRouter, status

from app.auth.dependency import CurrentStudentDep
from app.dependency import PaginationQueryDep
from app.favorites.dependency import FavoriteServiceDep
from app.favorites.schema import FavoriteStatusResponse
from app.products.schema import ProductListResponse, ProductSummaryResponse
from app.stores.schema import StoreListResponse, StoreSummaryResponse

favorite_router = APIRouter(prefix="/favorites", tags=["Favorites"])


@favorite_router.get("/stores", status_code=status.HTTP_200_OK)
async def list_favorite_stores(
    favorite_service: FavoriteServiceDep,
    student: CurrentStudentDep,
    pagination: PaginationQueryDep,
) -> StoreListResponse:
    stores, count = await favorite_service.list_stores(
        student=student,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return StoreListResponse(
        total=count,
        page=pagination.page,
        page_size=pagination.page_size,
        data=[StoreSummaryResponse.model_validate(store) for store in stores],
    )


@favorite_router.post("/stores/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
async def add_store_favorite(
    favorite_service: FavoriteServiceDep,
    student: CurrentStudentDep,
    store_id: UUID,
) -> None:
    await favorite_service.add_store(student, store_id)


@favorite_router.delete("/stores/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_store_favorite(
    favorite_service: FavoriteServiceDep,
    student: CurrentStudentDep,
    store_id: UUID,
) -> None:
    await favorite_service.remove_store(student, store_id)


@favorite_router.get(
    "/stores/{store_id}/status",
    status_code=status.HTTP_200_OK,
)
async def get_store_favorite_status(
    favorite_service: FavoriteServiceDep,
    student: CurrentStudentDep,
    store_id: UUID,
) -> FavoriteStatusResponse:
    return FavoriteStatusResponse(
        is_favorited=await favorite_service.is_store_favorited(student, store_id)
    )


@favorite_router.get("/products", status_code=status.HTTP_200_OK)
async def list_favorite_products(
    favorite_service: FavoriteServiceDep,
    student: CurrentStudentDep,
    pagination: PaginationQueryDep,
) -> ProductListResponse:
    products, count = await favorite_service.list_products(
        student=student,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return ProductListResponse(
        total=count,
        page=pagination.page,
        page_size=pagination.page_size,
        data=[ProductSummaryResponse.model_validate(product) for product in products],
    )


@favorite_router.post("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def add_product_favorite(
    favorite_service: FavoriteServiceDep,
    student: CurrentStudentDep,
    product_id: UUID,
) -> None:
    await favorite_service.add_product(student, product_id)


@favorite_router.delete(
    "/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def remove_product_favorite(
    favorite_service: FavoriteServiceDep,
    student: CurrentStudentDep,
    product_id: UUID,
) -> None:
    await favorite_service.remove_product(student, product_id)


@favorite_router.get(
    "/products/{product_id}/status",
    status_code=status.HTTP_200_OK,
)
async def get_product_favorite_status(
    favorite_service: FavoriteServiceDep,
    student: CurrentStudentDep,
    product_id: UUID,
) -> FavoriteStatusResponse:
    return FavoriteStatusResponse(
        is_favorited=await favorite_service.is_product_favorited(student, product_id)
    )
