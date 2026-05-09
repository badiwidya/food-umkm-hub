from app.products.entity import Product
from app.products.enum import ProductCategory
from app.products.repository import ProductRepository


class ProductService:
    def __init__(self, product_repo: ProductRepository) -> None:
        self._product_repo = product_repo

    async def list(
        self,
        is_store_open: bool | None,
        is_product_available: bool | None,
        category: ProductCategory | None,
        keyword: str | None,
        page: int,
        page_size: int,
    ) -> tuple[list[Product], int]:
        limit = page_size
        offset = (page - 1) * page_size

        products, total_count = await self._product_repo.get_all(
            is_store_open=is_store_open,
            is_product_available=is_product_available,
            category=category,
            keyword=keyword,
            offset=offset,
            limit=limit,
        )

        return products, total_count
