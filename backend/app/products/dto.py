from dataclasses import dataclass

from app.domains.product import ProductCategory


@dataclass(kw_only=True)
class CreateProductDTO:
    name: str
    price: int
    category: ProductCategory
    description: str | None
    photo_url: str | None
