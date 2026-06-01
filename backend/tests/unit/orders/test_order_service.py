from datetime import UTC, datetime, timedelta
from uuid import UUID

import pytest

from app.exception import DomainException, NotFoundException
from app.orders.dto import CreateOrderDTO, OrderItemDTO
from app.orders.order import Order, PaymentMethod
from app.orders.service import OrderService
from app.products.product import Product, ProductCategory
from app.promos.promo import Promo, PromoType
from app.stores.store import Store
from app.students.student import Student
from app.users.seller import Seller
from app.users.user import UserRole


class FakeOrderRepository:
    def __init__(self) -> None:
        self.saved: list[Order] = []
        self.updated: list[Order] = []

    async def save(self, order: Order) -> None:
        self.saved.append(order)

    async def update(self, order: Order) -> None:
        self.updated.append(order)


class FakeProductRepository:
    def __init__(self, products: list[Product]) -> None:
        self.products = {product.id: product for product in products}

    async def get_by_id(self, id: UUID) -> Product | None:
        return self.products.get(id)


class FakePromoRepository:
    def __init__(self, promo: Promo | None = None) -> None:
        self.promo = promo
        self.usage_updates: list[tuple[Promo, int]] = []

    async def get_by_code_and_store(self, code: str, store_id: UUID) -> Promo | None:
        if self.promo and self.promo.code == code and self.promo.store_id == store_id:
            return self.promo
        return None

    async def update_usage(self, promo: Promo, old_usage_count: int) -> bool:
        self.usage_updates.append((promo, old_usage_count))
        return True


class FakeStoreRepository:
    def __init__(self, store: Store | None) -> None:
        self.store = store

    async def get_by_id(self, store_id: UUID) -> Store | None:
        if self.store and self.store.id == store_id:
            return self.store
        return None


class FakeReviewRepository:
    pass


class FakeUserRepository:
    pass


def make_student() -> Student:
    return Student.register(
        full_name="Student",
        email="student@example.com",
        phone_number="081234567890",
        password_hash="hash",
        nim="G64000001",
        faculty="FMIPA",
        department="Ilmu Komputer",
    )


def make_store(is_open: bool = True) -> Store:
    seller = Seller(
        full_name="Seller",
        email="seller@example.com",
        phone_number="081234567891",
        password_hash="hash",
        role=UserRole.SELLER,
        store=None,
    )
    store = Store.create(
        name="Demo Store",
        owner=seller,
        description="Demo description",
        address="Demo address",
    )
    store._approve()
    if is_open:
        store.open()
    return store


def make_product(store: Store, available: bool = True) -> Product:
    product = store.create_product("Nasi Goreng", 15000, ProductCategory.FOOD)
    if available:
        product.mark_as_available()
    return product


def make_service(
    store: Store | None,
    products: list[Product],
    promo: Promo | None = None,
) -> tuple[OrderService, FakeOrderRepository, FakePromoRepository]:
    order_repo = FakeOrderRepository()
    promo_repo = FakePromoRepository(promo)
    service = OrderService(
        order_repo=order_repo,
        product_repo=FakeProductRepository(products),
        promo_repo=promo_repo,
        store_repo=FakeStoreRepository(store),
        review_repo=FakeReviewRepository(),
        user_repo=FakeUserRepository(),
    )
    return service, order_repo, promo_repo


def make_dto(
    store: Store, product: Product, payment_method: PaymentMethod = PaymentMethod.QRIS
) -> CreateOrderDTO:
    return CreateOrderDTO(
        store_id=store.id,
        payment_method=payment_method,
        order_items=[OrderItemDTO(product_id=product.id, quantity=2)],
        promo_code=None,
        notes="Order note",
    )


@pytest.mark.anyio
async def test_create_qris_order_saves_pending_order() -> None:
    store = make_store()
    product = make_product(store)
    service, order_repo, _ = make_service(store, [product])

    order = await service.create(make_student(), make_dto(store, product))

    assert order_repo.saved == [order]
    assert order.total_price == 30000
    assert order.payment_method == PaymentMethod.QRIS


@pytest.mark.anyio
async def test_create_cash_order_confirms_payment() -> None:
    store = make_store()
    product = make_product(store)
    service, _, _ = make_service(store, [product])

    order = await service.create(
        make_student(), make_dto(store, product, PaymentMethod.CASH)
    )

    assert order.payment_method == PaymentMethod.CASH
    assert order.status == "waiting_for_confirmation"


@pytest.mark.anyio
async def test_create_order_rejects_closed_store() -> None:
    store = make_store(is_open=False)
    product = make_product(store)
    service, _, _ = make_service(store, [product])

    with pytest.raises(DomainException):
        await service.create(make_student(), make_dto(store, product))


@pytest.mark.anyio
async def test_create_order_rejects_unavailable_product() -> None:
    store = make_store()
    product = make_product(store, available=False)
    service, _, _ = make_service(store, [product])

    with pytest.raises(DomainException):
        await service.create(make_student(), make_dto(store, product))


@pytest.mark.anyio
async def test_create_order_rejects_product_from_another_store() -> None:
    requested_store = make_store()
    other_store = make_store()
    product = make_product(other_store)
    service, _, _ = make_service(requested_store, [product])

    with pytest.raises(DomainException):
        await service.create(make_student(), make_dto(requested_store, product))


@pytest.mark.anyio
async def test_create_order_rejects_missing_product() -> None:
    store = make_store()
    product = make_product(store)
    service, _, _ = make_service(store, [])

    with pytest.raises(NotFoundException):
        await service.create(make_student(), make_dto(store, product))


@pytest.mark.anyio
async def test_create_order_applies_valid_promo() -> None:
    store = make_store()
    product = make_product(store)
    now = datetime.now(UTC)
    promo = Promo.create(
        store_id=store.id,
        type=PromoType.PERCENTAGE,
        code="DEMO10",
        value=10,
        start_date=now - timedelta(days=1),
        end_date=now + timedelta(days=1),
        max_usage=5,
        max_discount_amount=5000,
        min_order_amount=10000,
    )
    service, _, promo_repo = make_service(store, [product], promo)
    dto = make_dto(store, product)
    dto.promo_code = " demo10 "

    order = await service.create(make_student(), dto)

    assert order.promo_code == "DEMO10"
    assert order.discount_amount == 3000
    assert order.total_price == 27000
    assert promo.usage_count == 1
    assert promo_repo.usage_updates == [(promo, 0)]
