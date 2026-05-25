from uuid import UUID

from app.domains.favorite import ProductFavorite, StoreFavorite
from app.domains.product import Product
from app.domains.store import Store
from app.domains.student import Student
from app.exception import NotFoundException
from app.favorites.repository import FavoriteRepository


class FavoriteService:
    def __init__(self, favorite_repo: FavoriteRepository) -> None:
        self._favorite_repo = favorite_repo

    async def list_stores(
        self, student: Student, page: int, page_size: int
    ) -> tuple[list[Store], int]:
        limit = page_size
        offset = (page - 1) * page_size
        return await self._favorite_repo.list_stores(student.id, offset, limit)

    async def add_store(self, student: Student, store_id: UUID) -> None:
        if not await self._favorite_repo.public_store_exists(store_id):
            raise NotFoundException("Toko tidak ada")
        await self._favorite_repo.add_store(
            StoreFavorite(student_id=student.id, store_id=store_id)
        )

    async def remove_store(self, student: Student, store_id: UUID) -> None:
        await self._favorite_repo.remove_store(student.id, store_id)

    async def is_store_favorited(self, student: Student, store_id: UUID) -> bool:
        return await self._favorite_repo.is_store_favorited(student.id, store_id)

    async def list_products(
        self, student: Student, page: int, page_size: int
    ) -> tuple[list[Product], int]:
        limit = page_size
        offset = (page - 1) * page_size
        return await self._favorite_repo.list_products(student.id, offset, limit)

    async def add_product(self, student: Student, product_id: UUID) -> None:
        if not await self._favorite_repo.public_product_exists(product_id):
            raise NotFoundException("Produk tidak ada")
        await self._favorite_repo.add_product(
            ProductFavorite(student_id=student.id, product_id=product_id)
        )

    async def remove_product(self, student: Student, product_id: UUID) -> None:
        await self._favorite_repo.remove_product(student.id, product_id)

    async def is_product_favorited(self, student: Student, product_id: UUID) -> bool:
        return await self._favorite_repo.is_product_favorited(student.id, product_id)
