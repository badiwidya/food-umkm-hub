from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import UUID, uuid7

from app.exception import DomainException
from app.sentinel import UNSET, TUnset
from app.stores.enum import ApprovalStatus


@dataclass(kw_only=True)
class Store:
    id: UUID = field(default_factory=uuid7)
    name: str
    owner_id: UUID
    description: str
    address: str
    photo_url: str | None = None
    qris_image_url: str | None = None
    maps_link: str | None = None
    approval_status: ApprovalStatus = ApprovalStatus.PENDING
    approval_notes: str | None = None
    is_open: bool = False
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @classmethod
    def create(
        cls,
        name: str,
        owner_id: UUID,
        description: str,
        address: str,
        photo_url: str | None = None,
        qris_image_url: str | None = None,
        maps_link: str | None = None,
    ) -> Store:
        return cls(
            name=name.strip(),
            owner_id=owner_id,
            description=description,
            address=address,
            photo_url=photo_url,
            qris_image_url=qris_image_url,
            maps_link=maps_link,
        )

    def change_informations(
        self,
        name: str | TUnset = UNSET,
        description: str | TUnset = UNSET,
        address: str | TUnset = UNSET,
        photo_url: str | None | TUnset = UNSET,
        qris_image_url: str | None | TUnset = UNSET,
        maps_link: str | None | TUnset = UNSET,
    ) -> None:
        has_changed = True

        if not isinstance(name, TUnset):
            if not name:
                raise DomainException("Nama tidak boleh kosong.")
            if name.strip() != self.name:
                self.name = name.strip()
                has_changed = True

        if not isinstance(description, TUnset):
            if not description:
                raise DomainException("Deskripsi tidak boleh kosong.")
            if description != self.description:
                self.description = description
                has_changed = True

        if not isinstance(address, TUnset):
            if not address:
                raise DomainException("Alamat tidak boleh kosong.")
            if address != self.address:
                self.address = address
                has_changed = True

        if not isinstance(photo_url, TUnset):
            if photo_url != self.photo_url:
                self.photo_url = photo_url
                has_changed = True

        if not isinstance(qris_image_url, TUnset):
            if qris_image_url != self.qris_image_url:
                self.qris_image_url = qris_image_url
                has_changed = True

        if not isinstance(maps_link, TUnset):
            if maps_link != self.maps_link:
                self.maps_link = maps_link
                has_changed = True

        if has_changed:
            self._touch()

    def open(self) -> None:
        if self.approval_status != ApprovalStatus.APPROVED:
            raise DomainException(
                "Toko harus disetujui terlebih dahulu sebelum dapat mengubah status operasional."
            )
        self.is_open = True
        self._touch()

    def close(self) -> None:
        if self.approval_status != ApprovalStatus.APPROVED:
            raise DomainException(
                "Toko harus disetujui terlebih dahulu sebelum dapat mengubah status operasional."
            )
        self.is_open = False
        self._touch()

    def approve(self) -> None:
        if self.approval_status not in (
            ApprovalStatus.PENDING,
            ApprovalStatus.REJECTED,
        ):
            raise DomainException(
                "Hanya toko dengan status pending atau ditolak yang bisa disetujui."
            )
        self.approval_status = ApprovalStatus.APPROVED
        self._touch()

    def reject(self, notes: str | None) -> None:
        if self.approval_status != ApprovalStatus.PENDING:
            raise DomainException("Hanya toko dengan status pending yang bisa ditolak.")
        self.approval_status = ApprovalStatus.REJECTED
        self.approval_notes = notes
        self._touch()

    def resubmit(self) -> None:
        if self.approval_status != ApprovalStatus.REJECTED:
            raise DomainException("Hanya toko yang ditolak yang bisa mengajukan ulang.")
        self.approval_status = ApprovalStatus.PENDING
        self.approval_notes = None
        self._touch()

    def _touch(self) -> None:
        self.updated_at = datetime.now(UTC)
