"""
Prefix: /admin/stores
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Query, status

from app.auth.dependency import CurrentAdminDep
from app.dependency import PaginationQueryDep
from app.stores.store import StoreApprovalStatus
from app.exception import NotFoundException
from app.stores.dependency import StoreServiceDep, StoreTargetDep
from app.stores.schema import (
    RejectionNotesRequest,
    StoreWithOwnerDetailResponse,
    StoreWithOwnerListResponse,
    StoreWithOwnerSummaryResponse,
)

store_admin_router = APIRouter()


@store_admin_router.get(
    "/",
    summary="Mendapatkan daftar semua toko beserta data pemiliknya.",
    status_code=status.HTTP_200_OK,
)
async def list_all(
    store_service: StoreServiceDep,
    pagination: PaginationQueryDep,
    keyword: Annotated[str | None, Query(alias="search")] = None,
    status: Annotated[StoreApprovalStatus | None, Query()] = None,
) -> StoreWithOwnerListResponse:
    stores, count = await store_service.list_for_admin(
        keyword=keyword,
        page=pagination.page,
        page_size=pagination.page_size,
        status=status,
    )

    return StoreWithOwnerListResponse(
        page=pagination.page,
        page_size=pagination.page_size,
        total=count,
        data=[StoreWithOwnerSummaryResponse.model_validate(store) for store in stores],
    )


@store_admin_router.get(
    "/{id}",
    summary="Mendapatkan detail toko beserta data pemiliknya berdasarkan ID.",
    status_code=status.HTTP_200_OK,
)
async def get_store_with_owner_details(
    store_service: StoreServiceDep, id: UUID
) -> StoreWithOwnerDetailResponse:
    store = await store_service.get_details(id)
    if store is None:
        raise NotFoundException("Toko tidak ada")
    return StoreWithOwnerDetailResponse.model_validate(store)


@store_admin_router.post(
    "/{id}/approve",
    summary="Menyetujui pendaftaran toko.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def approve_application(
    store_service: StoreServiceDep, store: StoreTargetDep, admin: CurrentAdminDep
) -> None:
    await store_service.approve(admin, store)


@store_admin_router.post(
    "/{id}/reject",
    summary="Menolak pendaftaran toko.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def reject_application(
    store_service: StoreServiceDep,
    store: StoreTargetDep,
    admin: CurrentAdminDep,
    payload: Annotated[RejectionNotesRequest | None, Body] = None,
) -> None:
    notes = payload.notes if payload else None
    await store_service.reject(admin, store, notes)
