from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.auth.dependency import CurrentStoreDep
from app.dependency import PaginationQueryDep
from app.exception import NotFoundException
from app.stores.dependency import StoreServiceDep
from app.stores.schema import (
    StoreListResponse,
    StoreResponse,
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
    keyword: Annotated[str | None, Query(alias="q")] = None,
) -> StoreListResponse:
    stores, count = await store_service.list(
        keyword=keyword, page=pagination.page, page_size=pagination.page_size
    )
    return StoreListResponse(
        total=count,
        page=pagination.page,
        page_size=pagination.page_size,
        data=[StoreResponse.model_validate(store) for store in stores],
    )


@store_router.get(
    "/me",
    summary="Mendapatkan profil toko milik penjual yang sedang login.",
    status_code=status.HTTP_200_OK,
)
async def get_me(store: CurrentStoreDep) -> StoreResponse:
    return StoreResponse.model_validate(store)


@store_router.patch(
    "/me",
    summary="Memperbarui informasi toko milik penjual yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def patch_me(
    payload: UpdateStoreRequest, store: CurrentStoreDep, store_service: StoreServiceDep
) -> None:
    await store_service.update_information(
        store, payload.model_dump(exclude_unset=True)
    )


@store_router.post(
    "/me/open",
    summary="Membuka toko untuk menerima pesanan.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def open_me(store: CurrentStoreDep, store_service: StoreServiceDep) -> None:
    await store_service.open(store)


@store_router.post(
    "/me/close",
    summary="Menutup toko sementara.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def close_me(store: CurrentStoreDep, store_service: StoreServiceDep) -> None:
    await store_service.close(store)


@store_router.post(
    "/me/resubmit",
    summary="Mengajukan ulang pendaftaran toko setelah ditolak.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def resubmit_application(
    store: CurrentStoreDep, store_service: StoreServiceDep
) -> None:
    await store_service.resubmit(store)


@store_router.get(
    "/{id}",
    summary="Mendapatkan detail toko berdasarkan ID.",
    status_code=status.HTTP_200_OK,
)
async def get_detail(id: UUID, store_service: StoreServiceDep) -> StoreResponse:
    store = await store_service.get_by_id(id)
    if store is None:
        raise NotFoundException("Toko tidak ada.")
    return StoreResponse.model_validate(store)
