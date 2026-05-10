from uuid import UUID

from app.exception import NotFoundException
from app.products.dto import CreateProductDTO
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

    async def get_details(self, id: UUID) -> Product:
        product = await self._product_repo.get_by_id(id)
        if product is None:
            raise NotFoundException("Produk tidak ada")
        return product

    async def create(self, dto: CreateProductDTO) -> Product:
        product = Product.create(
            store_id=dto.store.id,
            store_name=dto.store.name,
            name=dto.name,
            price=dto.price,
            category=dto.category,
            photo_url=dto.photo_url,
            description=dto.description,
        )
        await self._product_repo.save(product)
        return product
