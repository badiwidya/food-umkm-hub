"""
Prefix: /admin/stores
"""

from dataclasses import asdict
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Body, Query, status
from pydantic import BeforeValidator

from app.dependency import PaginationQueryDep
from app.exception import NotFoundException
from app.stores.dependency import StoreServiceDep, StoreTargetDep
from app.stores.enum import ApprovalStatus
from app.stores.schema import (
    RejectionNotesRequest,
    StoreWithOwnerListResponse,
    StoreWithOwnerResponse,
)

store_admin_router = APIRouter()


@store_admin_router.get(
    "/",
    summary="Mendapatkan daftar semua toko beserta data pemiliknya.",
    status_code=status.HTTP_200_OK,
    response_model=StoreWithOwnerListResponse,
)
async def list_all(
    store_service: StoreServiceDep,
    pagination: PaginationQueryDep,
    keyword: Annotated[str | None, Query(alias="q")] = None,
    # Default pending karena fokus utama admin adalah kurasi registrasi toko
    status: Annotated[
        Annotated[
            ApprovalStatus | None, BeforeValidator(lambda v: None if v == "" else v)
        ],
        Query(),
    ] = ApprovalStatus.PENDING,
) -> dict:
    stores_with_owner, count = await store_service.list_all(
        keyword=keyword,
        page=pagination.page,
        page_size=pagination.page_size,
        status=status,
    )

    return {
        "metadata": {
            "total": count,
            "page": pagination.page,
            "page_size": pagination.page_size,
        },
        "data": [
            {
                **asdict(store_with_owner.store),
                "owner": {**asdict(store_with_owner.owner)},
            }
            for store_with_owner in stores_with_owner
        ],
    }


@store_admin_router.get(
    "/{id}",
    summary="Mendapatkan detail toko beserta data pemiliknya berdasarkan ID.",
    status_code=status.HTTP_200_OK,
    response_model=StoreWithOwnerResponse,
)
async def get_store_with_owner_details(
    id: UUID, store_service: StoreServiceDep
) -> dict:
    store_with_owner = await store_service.get_by_id_with_owner(id)
    if store_with_owner is None:
        raise NotFoundException("Toko tidak ada.")
    return {
        **asdict(store_with_owner.store),
        "owner": {**asdict(store_with_owner.owner)},
    }


@store_admin_router.post(
    "/{id}/approve",
    summary="Menyetujui pendaftaran toko.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def approve_application(
    store: StoreTargetDep, store_service: StoreServiceDep
) -> None:
    await store_service.approve(store)


@store_admin_router.post(
    "/{id}/reject",
    summary="Menolak pendaftaran toko.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def reject_application(
    store: StoreTargetDep,
    store_service: StoreServiceDep,
    payload: Annotated[RejectionNotesRequest | None, Body] = None,
) -> None:
    notes = payload.notes if payload else None
    await store_service.reject(store, notes)
