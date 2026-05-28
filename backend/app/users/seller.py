from dataclasses import dataclass

from app.stores.store import Store
from app.users.user import User, UserRole


@dataclass(kw_only=True)
class Seller(User):
    store: Store | None

    @classmethod
    def register(
        cls, full_name: str, email: str, phone_number: str, password_hash: str
    ) -> Seller:
        normalized_user_fields = cls._register_validate(full_name, email, phone_number)

        return cls(
            full_name=normalized_user_fields.get("full_name", full_name),
            email=normalized_user_fields.get("email", email),
            phone_number=normalized_user_fields.get("phone_number", phone_number),
            password_hash=password_hash,
            role=UserRole.SELLER,
            store=None,
        )

    def create_store(
        self,
        name: str,
        description: str,
        address: str,
        photo_url: str | None,
        qris_image_url: str | None,
        maps_link: str | None,
    ) -> Store:
        store = Store.create(
            name=name,
            owner=self,
            description=description,
            address=address,
            photo_url=photo_url,
            qris_image_url=qris_image_url,
            maps_link=maps_link,
        )
        self.store = store
        return store
