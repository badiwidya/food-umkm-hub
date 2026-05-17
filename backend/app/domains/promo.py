from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from uuid import UUID, uuid7

from app.exception import DomainException
from app.sentinel import UNSET, TUnset


class PromoType(StrEnum):
    FIXED = "fixed"
    PERCENTAGE = "percentage"


@dataclass(kw_only=True)
class Promo:
    id: UUID = field(default_factory=uuid7)
    store_id: UUID
    code: str
    type: PromoType
    value: int
    max_discount_amount: int | None = None  # Untuk percentage
    min_order_amount: int | None = None
    max_usage: int | None = None
    usage_count: int = 0
    start_date: datetime
    end_date: datetime
    deleted_at: datetime | None = None
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @classmethod
    def create(
        cls,
        store_id: UUID,
        type: PromoType,
        code: str,
        value: int,
        start_date: datetime,
        end_date: datetime,
        max_usage: int | None = None,
        max_discount_amount: int | None = None,
        min_order_amount: int | None = None,
    ) -> Promo:
        if type != PromoType.PERCENTAGE and max_discount_amount is not None:
            raise DomainException(
                "Total maksimal untuk diskon hanya bisa diset apabila tipe promo adalah persen"
            )
        return cls(
            store_id=store_id,
            type=type,
            code=code.strip().upper(),
            value=value,
            start_date=start_date,
            end_date=end_date,
            max_usage=max_usage,
            min_order_amount=min_order_amount,
            max_discount_amount=max_discount_amount,
        )

    def change_information(
        self,
        code: str | TUnset = UNSET,
        type: PromoType | TUnset = UNSET,
        value: int | TUnset = UNSET,
        max_discount_amount: int | None | TUnset = UNSET,
        min_order_amount: int | None | TUnset = UNSET,
        start_date: datetime | TUnset = UNSET,
        end_date: datetime | TUnset = UNSET,
        max_usage: int | None | TUnset = UNSET,
    ) -> None:
        identity_fields_changed = any(
            not isinstance(f, TUnset)
            for f in [code, type, value, max_discount_amount, min_order_amount]
        )
        if identity_fields_changed and self.usage_count > 0:
            raise DomainException(
                "Promo yang sudah pernah digunakan tidak dapat mengubah kode, tipe, nilai, atau syarat minimum"
            )

        new_type = self.type if isinstance(type, TUnset) else type
        new_max_discount_amount = (
            self.max_discount_amount
            if isinstance(max_discount_amount, TUnset)
            else max_discount_amount
        )

        if new_type != PromoType.PERCENTAGE and new_max_discount_amount is not None:
            raise DomainException(
                "Total maksimal untuk diskon hanya bisa diset apabila tipe promo adalah persen"
            )

        has_changed = False

        if not isinstance(code, TUnset):
            normalized_code = code.strip().upper()
            if normalized_code != self.code:
                self.code = normalized_code
                has_changed = True
        if not isinstance(type, TUnset):
            if type != self.type:
                self.type = type
                has_changed = True
        if not isinstance(value, TUnset):
            if value != self.value:
                self.value = value
                has_changed = True
        if not isinstance(max_discount_amount, TUnset):
            if max_discount_amount != self.max_discount_amount:
                self.max_discount_amount = max_discount_amount
                has_changed = True
        if not isinstance(min_order_amount, TUnset):
            if min_order_amount != self.min_order_amount:
                self.min_order_amount = min_order_amount
                has_changed = True
        if not isinstance(start_date, TUnset):
            if start_date != self.start_date:
                self.start_date = start_date
                has_changed = True
        if not isinstance(end_date, TUnset):
            if end_date != self.end_date:
                self.end_date = end_date
                has_changed = True
        if not isinstance(max_usage, TUnset):
            if max_usage != self.max_usage:
                self.max_usage = max_usage
                has_changed = True

        if has_changed:
            self.updated_at = datetime.now(UTC)

    def calculate_discount(self, order_amount: int) -> int:
        if self.type == PromoType.PERCENTAGE:
            discount = order_amount * self.value // 100
            if self.max_discount_amount is not None:
                discount = min(discount, self.max_discount_amount)
        else:
            discount = min(self.value, order_amount)
        return discount

    def is_valid_at(self, dt: datetime) -> bool:
        return self.start_date <= dt <= self.end_date

    def has_quota(self) -> bool:
        return self.max_usage is None or self.usage_count < self.max_usage

    def meets_minimum_order(self, order_amount: int) -> bool:
        return self.min_order_amount is None or order_amount >= self.min_order_amount

    def delete(self) -> None:
        self.deleted_at = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)
