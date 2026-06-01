from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.auth.dependency import CurrentStoreDep
from app.dependency import PaginationQueryDep
from app.exception import NotFoundException
from app.stores.dependency import StoreServiceDep
from app.stores.schema import (
    StoreDashboardResponse,
    StoreDetailResponse,
    StoreListResponse,
    StoreSummaryResponse,
    UpdateStoreRequest,
)

store_router = APIRouter(prefix="/stores", tags=["Stores"])


@store_router.get(
    "/",
    summary="Mendapatkan daftar toko yang tersedia.",
    status_code=status.HTTP_200_OK,
)
async def list(
    store_service: StoreServiceDep,
    pagination: PaginationQueryDep,
    is_open: Annotated[bool | None, Query()] = None,
    keyword: Annotated[str | None, Query(alias="search")] = None,
) -> StoreListResponse:
    stores, count = await store_service.list_for_public(
        is_open=is_open,
        keyword=keyword,
        page=pagination.page,
        page_size=pagination.page_size,
    )
    return StoreListResponse(
        total=count,
        page=pagination.page,
        page_size=pagination.page_size,
        data=[StoreSummaryResponse.model_validate(store) for store in stores],
    )


@store_router.get(
    "/me",
    summary="Mendapatkan profil toko milik penjual yang sedang login.",
    status_code=status.HTTP_200_OK,
)
async def get_me(store: CurrentStoreDep) -> StoreDetailResponse:
    return StoreDetailResponse.model_validate(store)


@store_router.get(
    "/me/dashboard",
    summary="Mendapatkan ringkasan dashboard toko milik penjual yang sedang login.",
    status_code=status.HTTP_200_OK,
)
async def get_my_dashboard(
    store_service: StoreServiceDep,
    store: CurrentStoreDep,
) -> StoreDashboardResponse:
    dashboard = await store_service.get_dashboard(store)
    return StoreDashboardResponse.model_validate(dashboard)


@store_router.patch(
    "/me",
    summary="Memperbarui informasi toko milik penjual yang sedang login.",
    status_code=status.HTTP_200_OK,
)
async def patch_me(
    store_service: StoreServiceDep, store: CurrentStoreDep, payload: UpdateStoreRequest
) -> StoreDetailResponse:
    updated_store = await store_service.update_information(
        store, payload.model_dump(exclude_unset=True)
    )
    return StoreDetailResponse.model_validate(updated_store)


@store_router.post(
    "/me/open",
    summary="Membuka toko untuk menerima pesanan.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def open_me(store_service: StoreServiceDep, store: CurrentStoreDep) -> None:
    await store_service.open(store)


@store_router.post(
    "/me/close",
    summary="Menutup toko sementara.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def close_me(store_service: StoreServiceDep, store: CurrentStoreDep) -> None:
    await store_service.close(store)


@store_router.post(
    "/me/resubmit",
    summary="Mengajukan ulang pendaftaran toko setelah ditolak.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def resubmit_application(
    store_service: StoreServiceDep, store: CurrentStoreDep
) -> None:
    await store_service.resubmit(store)


@store_router.get(
    "/{id}",
    summary="Mendapatkan detail toko berdasarkan ID.",
    status_code=status.HTTP_200_OK,
)
async def get_detail(store_service: StoreServiceDep, id: UUID) -> StoreDetailResponse:
    store = await store_service.get_details(id)
    if store is None:
        raise NotFoundException("Toko tidak ada")
    return StoreDetailResponse.model_validate(store)
