from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid7

import pytest

from app.exception import DomainException, NotAllowedException, NotFoundException
from app.orders.order import Order, PaymentMethod
from app.reviews.review import Review
from app.reviews.service import ReviewService
from app.students.student import Student


class FakeReviewRepository:
    def __init__(self, reviewed_product_ids: set[UUID] | None = None) -> None:
        self.reviewed_product_ids = reviewed_product_ids or set()
        self.saved: list[Review] = []
        self.recalculated_products: list[UUID] = []
        self.recalculated_stores: list[UUID] = []

    async def get_reviewed_product_ids(self, order_id: UUID) -> set[UUID]:
        return self.reviewed_product_ids

    async def save_many(self, reviews: list[Review]) -> None:
        self.saved.extend(reviews)

    async def recalculate_product_rating(self, product_id: UUID) -> None:
        self.recalculated_products.append(product_id)

    async def recalculate_store_rating(self, store_id: UUID) -> None:
        self.recalculated_stores.append(store_id)


class FakeOrderRepository:
    def __init__(self, order: Order | None) -> None:
        self.order = order

    async def get_by_id(self, id: UUID) -> Order | None:
        if self.order and self.order.id == id:
            return self.order
        return None


class FakeProductRepository:
    pass


class FakeStoreRepository:
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


def make_order(student_id: UUID, completed: bool = True) -> tuple[Order, UUID, UUID]:
    product_1_id = uuid7()
    product_2_id = uuid7()
    order = Order.create(
        student_id=student_id,
        store_id=uuid7(),
        payment_method=PaymentMethod.CASH,
        expires_at=datetime.now(UTC) + timedelta(minutes=30),
    )
    order.create_order_item(product_1_id, "Nasi Goreng", 15000, 1)
    order.create_order_item(product_2_id, "Es Teh", 5000, 1)
    order.calculate_total()
    order.confirm_cash_payment()
    if completed:
        order.seller_accept()
        order.seller_mark_as_ready_to_pickup()
        order.complete()
    return order, product_1_id, product_2_id


def make_service(
    order: Order | None, review_repo: FakeReviewRepository
) -> ReviewService:
    return ReviewService(
        review_repo=review_repo,
        order_repo=FakeOrderRepository(order),
        product_repo=FakeProductRepository(),
        store_repo=FakeStoreRepository(),
    )


@pytest.mark.anyio
async def test_create_reviews_for_completed_order() -> None:
    student = make_student()
    order, product_1_id, product_2_id = make_order(student.id)
    review_repo = FakeReviewRepository()
    service = make_service(order, review_repo)

    reviews = await service.create_for_order(
        student,
        order.id,
        [
            (product_1_id, 5, "Enak"),
            (product_2_id, 4, "Segar"),
        ],
    )

    assert reviews == review_repo.saved
    assert {review.product_id for review in reviews} == {product_1_id, product_2_id}
    assert set(review_repo.recalculated_products) == {product_1_id, product_2_id}
    assert review_repo.recalculated_stores == [order.store_id]


@pytest.mark.anyio
async def test_create_reviews_rejects_missing_order() -> None:
    service = make_service(None, FakeReviewRepository())

    with pytest.raises(NotFoundException):
        await service.create_for_order(make_student(), uuid7(), [])


@pytest.mark.anyio
async def test_create_reviews_rejects_other_student_order() -> None:
    student = make_student()
    other_student = make_student()
    order, product_1_id, product_2_id = make_order(other_student.id)
    service = make_service(order, FakeReviewRepository())

    with pytest.raises(NotAllowedException):
        await service.create_for_order(
            student,
            order.id,
            [(product_1_id, 5, None), (product_2_id, 4, None)],
        )


@pytest.mark.anyio
async def test_create_reviews_rejects_non_completed_order() -> None:
    student = make_student()
    order, product_1_id, product_2_id = make_order(student.id, completed=False)
    service = make_service(order, FakeReviewRepository())

    with pytest.raises(DomainException):
        await service.create_for_order(
            student,
            order.id,
            [(product_1_id, 5, None), (product_2_id, 4, None)],
        )


@pytest.mark.anyio
async def test_create_reviews_requires_all_order_products() -> None:
    student = make_student()
    order, product_1_id, _ = make_order(student.id)
    service = make_service(order, FakeReviewRepository())

    with pytest.raises(DomainException):
        await service.create_for_order(student, order.id, [(product_1_id, 5, None)])


@pytest.mark.anyio
async def test_create_reviews_rejects_duplicate_product_payload() -> None:
    student = make_student()
    order, product_1_id, _ = make_order(student.id)
    service = make_service(order, FakeReviewRepository())

    with pytest.raises(DomainException):
        await service.create_for_order(
            student,
            order.id,
            [(product_1_id, 5, None), (product_1_id, 4, None)],
        )


@pytest.mark.anyio
async def test_create_reviews_rejects_already_reviewed_order() -> None:
    student = make_student()
    order, product_1_id, product_2_id = make_order(student.id)
    service = make_service(order, FakeReviewRepository({product_1_id}))

    with pytest.raises(DomainException):
        await service.create_for_order(
            student,
            order.id,
            [(product_1_id, 5, None), (product_2_id, 4, None)],
        )
