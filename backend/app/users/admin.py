from dataclasses import dataclass
from datetime import UTC, datetime

from app.stores.store import Store
from app.users.user import User, UserRole


@dataclass(kw_only=True)
class Admin(User):
    role = UserRole.ADMIN
    email_verified_at = datetime.now(UTC)
    phone_verified_at = datetime.now(UTC)

    def suspend_user(self, user: User) -> None:
        user._suspend()

    def unsuspend_user(self, user: User) -> None:
        user._unsuspend()

    def delete_user(self, user: User) -> None:
        user.delete()

    def reject_store_application(
        self, store: Store, rejection_notes: str | None
    ) -> None:
        store._reject(rejection_notes)

    def approve_store_application(self, store: Store) -> None:
        store._approve()

    def delete(self) -> None:
        pass

    def _suspend(self) -> None:
        pass

    def _unsuspend(self) -> None:
        pass
