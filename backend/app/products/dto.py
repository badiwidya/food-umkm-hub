from dataclasses import dataclass
from decimal import Decimal

from app.products.enum import ProductCategory
from app.stores.entity import Store


@dataclass(kw_only=True)
class CreateProductDTO:
    store: Store
    name: str
    price: Decimal
    category: ProductCategory
    description: str | None
    photo_url: str | None
