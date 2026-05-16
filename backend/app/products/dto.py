from dataclasses import dataclass

from app.domains.store import Store
from app.products.enum import ProductCategory


@dataclass(kw_only=True)
class CreateProductDTO:
    store: Store
    name: str
    price: int
    category: ProductCategory
    description: str | None
    photo_url: str | None
