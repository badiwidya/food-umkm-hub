from dataclasses import dataclass

from app.stores.entity import Store
from app.users.entity import User


@dataclass(kw_only=True)
class StoreWithOwner:
    owner: User
    store: Store
