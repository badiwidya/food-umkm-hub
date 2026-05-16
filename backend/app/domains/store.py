from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from typing import TYPE_CHECKING
from uuid import UUID, uuid7

from app.domains.product import Product, ProductCategory
from app.exception import DomainException
from app.sentinel import UNSET, TUnset

if TYPE_CHECKING:
    from app.domains.seller import Seller


class StoreApprovalStatus(StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


@dataclass(kw_only=True)
class Store:
    id: UUID = field(default_factory=uuid7)
    name: str
    owner: Seller
    description: str
    address: str
    photo_url: str | None = None
    qris_image_url: str | None = None
    maps_link: str | None = None
    approval_status: StoreApprovalStatus = StoreApprovalStatus.PENDING
    approval_notes: str | None = None
    is_open: bool = False
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @classmethod
    def create(
        cls,
        name: str,
        owner: Seller,
        description: str,
        address: str,
        photo_url: str | None = None,
        qris_image_url: str | None = None,
        maps_link: str | None = None,
    ) -> Store:
        normalized_name = name.strip()
        if not normalized_name:
            raise DomainException("Nama toko tidak boleh kosong")

        normalized_desc = description.strip()
        if not normalized_desc:
            raise DomainException("Deskripsi toko tidak boleh kosong")

        normalized_address = address.strip()
        if not normalized_address:
            raise DomainException("Alamat toko tidak boleh kosong")

        normalized_photo = photo_url.strip() if photo_url is not None else None
        normalized_maps = maps_link.strip() if maps_link is not None else None
        normalized_qris = qris_image_url.strip() if qris_image_url is not None else None
        return cls(
            name=normalized_name,
            owner=owner,
            description=normalized_desc,
            address=normalized_address,
            photo_url=normalized_photo,
            qris_image_url=normalized_qris,
            maps_link=normalized_maps,
        )

    def change_information(
        self,
        name: str | TUnset = UNSET,
        description: str | TUnset = UNSET,
        address: str | TUnset = UNSET,
        photo_url: str | None | TUnset = UNSET,
        qris_image_url: str | None | TUnset = UNSET,
        maps_link: str | None | TUnset = UNSET,
    ) -> None:
        has_changed = False

        if not isinstance(name, TUnset):
            normalized_name = name.strip()
            if not normalized_name:
                raise DomainException("Nama tidak boleh kosong")
            if normalized_name != self.name:
                self.name = normalized_name
                has_changed = True

        if not isinstance(description, TUnset):
            normalized_desc = description.strip()
            if not normalized_desc:
                raise DomainException("Deskripsi tidak boleh kosong")
            if normalized_desc != self.description:
                self.description = normalized_desc
                has_changed = True

        if not isinstance(address, TUnset):
            normalized_address = address.strip()
            if not normalized_address:
                raise DomainException("Alamat tidak boleh kosong")
            if normalized_address != self.address:
                self.address = normalized_address
                has_changed = True

        if not isinstance(photo_url, TUnset):
            normalized_photo = photo_url.strip() if photo_url is not None else None
            if normalized_photo != self.photo_url:
                self.photo_url = normalized_photo
                has_changed = True

        if not isinstance(qris_image_url, TUnset):
            normalized_qris = (
                qris_image_url.strip() if qris_image_url is not None else None
            )
            if normalized_qris != self.qris_image_url:
                self.qris_image_url = normalized_qris
                has_changed = True

        if not isinstance(maps_link, TUnset):
            normalized_maps = maps_link.strip() if maps_link is not None else None
            if normalized_maps != self.maps_link:
                self.maps_link = normalized_maps
                has_changed = True

        if has_changed:
            self._touch()

    def open(self) -> None:
        if self.approval_status != StoreApprovalStatus.APPROVED:
            raise DomainException(
                "Toko harus disetujui terlebih dahulu sebelum dapat mengubah status operasional"
            )
        self.is_open = True
        self._touch()

    def close(self) -> None:
        if self.approval_status != StoreApprovalStatus.APPROVED:
            raise DomainException(
                "Toko harus disetujui terlebih dahulu sebelum dapat mengubah status operasional"
            )
        self.is_open = False
        self._touch()

    def create_product(
        self,
        name: str,
        price: int,
        category: ProductCategory,
        description: str | None = None,
        photo_url: str | None = None,
    ) -> Product:
        return Product.create(self, name, price, category, description, photo_url)

    def _approve(self) -> None:
        if self.approval_status not in (
            StoreApprovalStatus.PENDING,
            StoreApprovalStatus.REJECTED,
        ):
            raise DomainException(
                "Hanya toko dengan status pending atau ditolak yang bisa disetujui"
            )
        self.approval_status = StoreApprovalStatus.APPROVED
        self._touch()

    def _reject(self, notes: str | None) -> None:
        if self.approval_status != StoreApprovalStatus.PENDING:
            raise DomainException("Hanya toko dengan status pending yang bisa ditolak")
        self.approval_status = StoreApprovalStatus.REJECTED
        self.approval_notes = notes
        self._touch()

    def resubmit(self) -> None:
        if self.approval_status != StoreApprovalStatus.REJECTED:
            raise DomainException("Hanya toko yang ditolak yang bisa mengajukan ulang")
        self.approval_status = StoreApprovalStatus.PENDING
        self.approval_notes = None
        self._touch()

    def _touch(self) -> None:
        self.updated_at = datetime.now(UTC)
