from uuid import UUID

from sqlalchemy.exc import IntegrityError

from app.domains.order import Order, OrderStatus
from app.domains.review import Review
from app.domains.student import Student
from app.exception import DomainException, NotAllowedException, NotFoundException
from app.orders.repository import OrderRepository
from app.products.repository import ProductRepository
from app.reviews.repository import ReviewRepository
from app.stores.repository import StoreRepository


class ReviewService:
    def __init__(
        self,
        review_repo: ReviewRepository,
        order_repo: OrderRepository,
        product_repo: ProductRepository,
        store_repo: StoreRepository,
    ) -> None:
        self._review_repo = review_repo
        self._order_repo = order_repo
        self._product_repo = product_repo
        self._store_repo = store_repo

    async def create_for_order(
        self,
        student: Student,
        order_id: UUID,
        payloads: list[tuple[UUID, int, str | None]],
    ) -> list[Review]:
        order = await self._order_repo.get_by_id(order_id)
        if order is None:
            raise NotFoundException("Pesanan tidak ada")
        if order.student_id != student.id:
            raise NotAllowedException("Aksi dilarang")
        if order.status != OrderStatus.COMPLETED:
            raise DomainException("Ulasan hanya dapat diberikan untuk pesanan selesai")

        requested_product_ids = [product_id for product_id, _, _ in payloads]
        if len(requested_product_ids) != len(set(requested_product_ids)):
            raise DomainException("Produk tidak boleh diulas lebih dari sekali")

        order_product_ids = {item.product_id for item in order.order_items}
        requested_product_id_set = set(requested_product_ids)
        if requested_product_id_set != order_product_ids:
            raise DomainException("Semua produk dalam pesanan harus diulas")

        reviewed_product_ids = await self._review_repo.get_reviewed_product_ids(
            order.id
        )
        if reviewed_product_ids:
            raise DomainException("Pesanan ini sudah pernah diulas")

        reviews = [
            Review.create(
                order_id=order.id,
                student_id=student.id,
                store_id=order.store_id,
                product_id=product_id,
                rating=rating,
                comment=comment,
            )
            for product_id, rating, comment in payloads
        ]

        try:
            await self._review_repo.save_many(reviews)
        except IntegrityError as exc:
            raise DomainException("Pesanan ini sudah pernah diulas") from exc

        for product_id in order_product_ids:
            await self._review_repo.recalculate_product_rating(product_id)
        await self._review_repo.recalculate_store_rating(order.store_id)

        return reviews

    async def list_by_order(self, order: Order) -> list[Review]:
        return await self._review_repo.get_all_by_order(order.id)

    async def list_by_product(
        self, product_id: UUID, page: int, page_size: int
    ) -> tuple[list[Review], int]:
        product = await self._product_repo.get_by_id(product_id)
        if product is None:
            raise NotFoundException("Produk tidak ada")

        limit = page_size
        offset = (page - 1) * page_size
        return await self._review_repo.get_all_by_product(product_id, offset, limit)

    async def list_by_store(
        self, store_id: UUID, page: int, page_size: int
    ) -> tuple[list[Review], int]:
        store = await self._store_repo.get_by_id(store_id)
        if store is None:
            raise NotFoundException("Toko tidak ada")

        limit = page_size
        offset = (page - 1) * page_size
        return await self._review_repo.get_all_by_store(store_id, offset, limit)
