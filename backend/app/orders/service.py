from datetime import UTC, datetime, timedelta
from uuid import UUID

from app.config import settings
from app.domains.order import Order, OrderStatus, PaymentMethod
from app.domains.store import Store
from app.domains.student import Student
from app.domains.user import User, UserRole
from app.exception import DomainException, NotAllowedException, NotFoundException
from app.orders.dto import CreateOrderDTO
from app.orders.repository import OrderRepository
from app.products.repository import ProductRepository
from app.promos.repository import PromoRepository
from app.stores.repository import StoreRepository


class OrderService:
    def __init__(
        self,
        order_repo: OrderRepository,
        product_repo: ProductRepository,
        promo_repo: PromoRepository,
        store_repo: StoreRepository,
    ) -> None:
        self._order_repo = order_repo
        self._product_repo = product_repo
        self._promo_repo = promo_repo
        self._store_repo = store_repo

    async def get_details(self, user: User, id: UUID) -> Order:
        order = await self._order_repo.get_by_id(id)
        if order is None:
            raise NotFoundException("Pesanan tidak ada")
        if user.role == UserRole.STUDENT:
            if user.id != order.student_id:
                raise NotAllowedException("Aksi dilarang")
        if user.role == UserRole.SELLER:
            store = await self._store_repo.get_by_owner_id(user.id)
            if store is None:
                raise NotAllowedException("Aksi dilarang")
            if store.id != order.store_id:
                raise NotAllowedException("Aksi dilarang")

        return order

    async def list_by_student(
        self, student: Student, status: OrderStatus | None, page: int, page_size: int
    ) -> tuple[list[Order], int]:
        limit = page_size
        offset = (page - 1) * page_size

        orders, total_count = await self._order_repo.get_all_by_student(
            student_id=student.id, status=status, offset=offset, limit=limit
        )
        return orders, total_count

    async def list_active_for_seller(
        self, store: Store
    ) -> tuple[list[Order], list[Order], list[Order]]:
        orders, _ = await self._order_repo.get_all_by_store(
            store_id=store.id,
            statuses=[
                OrderStatus.WAITING_FOR_CONFIRMATION,
                OrderStatus.IN_PROCESS,
                OrderStatus.READY_TO_PICKUP,
            ],
            limit=None,
            offset=None,
        )

        waiting_for_confirmation = [
            order
            for order in orders
            if order.status == OrderStatus.WAITING_FOR_CONFIRMATION
        ]
        in_process = [
            order for order in orders if order.status == OrderStatus.IN_PROCESS
        ]
        ready_to_pickup = [
            order for order in orders if order.status == OrderStatus.READY_TO_PICKUP
        ]

        return waiting_for_confirmation, in_process, ready_to_pickup

    async def list_for_seller(
        self, store: Store, status: OrderStatus | None, page: int, page_size: int
    ) -> tuple[list[Order], int]:
        limit = page_size
        offset = (page - 1) * page_size

        status_filter = [status] if status is not None else None

        orders, count = await self._order_repo.get_all_by_store(
            store_id=store.id, statuses=status_filter, limit=limit, offset=offset
        )
        return orders, count

    async def create(self, student: Student, dto: CreateOrderDTO) -> Order:
        now = datetime.now(UTC)
        order = Order.create(
            student_id=student.id,
            store_id=dto.store_id,
            payment_method=dto.payment_method,
            expires_at=now + timedelta(minutes=settings.ORDER_EXPIRY_MINUTES),
            notes=dto.notes,
        )

        for item in dto.order_items:
            product = await self._product_repo.get_by_id(item.product_id)
            if product is None:
                raise NotFoundException(f"Produk dengan id {item.product_id} tidak ada")
            order.create_order_item(
                product_id=product.id,
                product_name=product.name,
                product_price=product.price,
                quantity=item.quantity,
            )

        order_amount = order.calculate_total()

        promo_code = (
            dto.promo_code.strip().upper() if dto.promo_code is not None else None
        )
        if promo_code is not None:
            promo = await self._promo_repo.get_by_code_and_store(
                promo_code, dto.store_id
            )
            if promo is None:
                raise NotFoundException(f"Kode promo {promo_code} tidak ada")
            if not promo.is_valid_at(now):
                raise DomainException("Promo tidak aktif atau sudah kadaluwarsa")
            if not promo.has_quota():
                raise DomainException("Kuota promo sudah habis")
            if not promo.meets_minimum_order(order_amount):
                raise DomainException(
                    f"Minimum pembelian untuk promo ini adalah Rp{promo.min_order_amount}"
                )

            old_usage_count = promo.usage_count
            order.apply_promo(promo)

            is_promo_valid = await self._promo_repo.update_usage(promo, old_usage_count)
            if not is_promo_valid:
                raise DomainException("Kuota promo sudah habis")

        if dto.payment_method == PaymentMethod.CASH:
            order.confirm_cash_payment()

        await self._order_repo.save(order)
        return order

    async def update_payment_proof(self, order: Order, payment_proof_url: str) -> Order:
        order.submit_payment_proof(payment_proof_url)
        await self._order_repo.update(order)
        return order

    async def cancel(self, order: Order) -> Order:
        order.cancel()
        await self._order_repo.update(order)
        return order

    async def accept(self, order: Order) -> Order:
        order.seller_accept()
        await self._order_repo.update(order)
        return order

    async def mark_ready_to_pickup(self, order: Order) -> Order:
        order.seller_mark_as_ready_to_pickup()
        await self._order_repo.update(order)
        return order

    async def complete(self, order: Order) -> Order:
        order.complete()
        await self._order_repo.update(order)
        return order

    async def reject(self, order: Order, reason: str) -> Order:
        order.seller_reject(reason)
        await self._order_repo.update(order)
        return order

    async def reconsider_rejection(self, order: Order) -> Order:
        order.seller_reconsider()
        await self._order_repo.update(order)
        return order
