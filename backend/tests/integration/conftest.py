import os
from collections.abc import AsyncGenerator, Generator
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import pytest
from alembic.config import Config
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from alembic import command

os.environ.setdefault("ENV_FILE", ".env.test")
os.environ.setdefault("ORDER_EXPIRY_MINUTES", "30")
os.environ.setdefault("REJECTION_GRACE_PERIOD_MINUTES", "10")

from app.database import Base, factory  # noqa: E402
from app.main import app  # noqa: E402
from app.orders.order import Order, PaymentMethod  # noqa: E402
from app.orders.repository import OrderRepository  # noqa: E402
from app.products.product import Product, ProductCategory  # noqa: E402
from app.products.repository import ProductRepository  # noqa: E402
from app.promos.promo import Promo, PromoType  # noqa: E402
from app.promos.repository import PromoRepository  # noqa: E402
from app.security import create_access_token, hash_password  # noqa: E402
from app.stores.repository import StoreRepository  # noqa: E402
from app.stores.store import Store  # noqa: E402
from app.students.repository import StudentRepository  # noqa: E402
from app.students.student import Student  # noqa: E402
from app.users.repository import UserRepository  # noqa: E402
from app.users.seller import Seller  # noqa: E402
from app.users.user import User, UserRole, UserStatus  # noqa: E402

_MIGRATED = False


def _import_models() -> None:
    import app.favorites.model  # noqa: F401
    import app.orders.model  # noqa: F401
    import app.products.model  # noqa: F401
    import app.promos.model  # noqa: F401
    import app.reviews.model  # noqa: F401
    import app.stores.model  # noqa: F401
    import app.students.model  # noqa: F401
    import app.users.model  # noqa: F401


@pytest.fixture(scope="session", autouse=True)
def migrated_db() -> Generator[None]:
    global _MIGRATED
    if not _MIGRATED:
        alembic_cfg = Config(str(Path(__file__).parents[2] / "alembic.ini"))
        command.upgrade(alembic_cfg, "head")
        _MIGRATED = True
    yield


@pytest.fixture(autouse=True)
async def clean_db(migrated_db: None) -> AsyncGenerator[None]:
    _import_models()
    table_names = ", ".join(
        f'"{table.name}"' for table in reversed(Base.metadata.sorted_tables)
    )
    async with factory() as session:
        async with session.begin():
            if table_names:
                await session.execute(
                    text(f"TRUNCATE TABLE {table_names} RESTART IDENTITY CASCADE")
                )
    yield


@pytest.fixture
async def db_session(clean_db: None) -> AsyncGenerator[AsyncSession]:
    async with factory() as session:
        async with session.begin():
            yield session


@pytest.fixture
async def client(clean_db: None) -> AsyncGenerator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
def celery_delay_calls(
    monkeypatch: pytest.MonkeyPatch,
) -> dict[str, list[dict[str, Any]]]:
    from app.notifications.task import (
        send_notification_task,
        send_password_reset_link_task,
        send_verification_email_task,
    )

    calls: dict[str, list[dict[str, Any]]] = {
        "send_notification": [],
        "send_password_reset_link": [],
        "send_verification_email": [],
    }

    def record(name: str):
        def fake_delay(*args: Any, **kwargs: Any) -> None:
            calls[name].append({"args": args, "kwargs": kwargs})

        return fake_delay

    monkeypatch.setattr(send_notification_task, "delay", record("send_notification"))
    monkeypatch.setattr(
        send_password_reset_link_task,
        "delay",
        record("send_password_reset_link"),
    )
    monkeypatch.setattr(
        send_verification_email_task,
        "delay",
        record("send_verification_email"),
    )

    return calls


@pytest.fixture
async def verified_student_user(password: str) -> Student:
    student = Student.register(
        full_name="Test Student",
        email="student@example.com",
        phone_number="081234567890",
        password_hash=hash_password(password),
        nim="G64000001",
        faculty="FMIPA",
        department="Ilmu Komputer",
    )
    student.mark_email_as_verified()

    async with factory() as session:
        async with session.begin():
            await StudentRepository(session).save(student)

    return student


@pytest.fixture
async def student_token(verified_student_user: Student) -> str:
    return create_access_token(
        {"sub": str(verified_student_user.id), "role": verified_student_user.role.value}
    )


@pytest.fixture
async def verified_seller_user(password: str) -> Seller:
    seller = Seller.register(
        full_name="Test Seller",
        email="seller@example.com",
        phone_number="081234567891",
        password_hash=hash_password(password),
    )
    seller.mark_email_as_verified()

    async with factory() as session:
        async with session.begin():
            await UserRepository(session).save(seller)

    return seller


@pytest.fixture
async def approved_store(verified_seller_user: Seller) -> Store:
    store = verified_seller_user.create_store(
        name="Kantin Demo",
        description="Kantin untuk kebutuhan tes",
        address="Jl. Demo No. 1",
        photo_url="https://example.com/store.jpg",
        qris_image_url="https://example.com/qris.jpg",
        maps_link="https://maps.example.com/store",
    )
    store._approve()
    store.open()

    async with factory() as session:
        async with session.begin():
            await StoreRepository(session).save(store)

    return store


@pytest.fixture
async def seller_token(verified_seller_user: Seller) -> str:
    return create_access_token(
        {"sub": str(verified_seller_user.id), "role": verified_seller_user.role.value}
    )


@pytest.fixture
async def admin_user(password: str) -> User:
    admin = User(
        full_name="Test Admin",
        email="admin@example.com",
        phone_number="081234567892",
        password_hash=hash_password(password),
        role=UserRole.ADMIN,
        status=UserStatus.ACTIVE,
    )
    admin.mark_email_as_verified()

    async with factory() as session:
        async with session.begin():
            await UserRepository(session).save(admin)

    return admin


@pytest.fixture
async def admin_token(admin_user: User) -> str:
    return create_access_token(
        {"sub": str(admin_user.id), "role": admin_user.role.value}
    )


@pytest.fixture
async def pending_store(password: str) -> Store:
    seller = Seller.register(
        full_name="Pending Seller",
        email="pending-seller@example.com",
        phone_number="081234567893",
        password_hash=hash_password(password),
    )
    seller.mark_email_as_verified()
    store = seller.create_store(
        name="Pending Store",
        description="Store waiting for admin approval",
        address="Jl. Pending No. 1",
        photo_url=None,
        qris_image_url="https://example.com/pending-qris.jpg",
        maps_link=None,
    )

    async with factory() as session:
        async with session.begin():
            await UserRepository(session).save(seller)
            await StoreRepository(session).save(store)

    return store


@pytest.fixture
async def available_product(approved_store: Store) -> Product:
    product = approved_store.create_product(
        name="Nasi Goreng",
        price=15000,
        category=ProductCategory.FOOD,
        description="Nasi goreng demo",
        photo_url="https://example.com/product.jpg",
    )
    product.mark_as_available()

    async with factory() as session:
        async with session.begin():
            await ProductRepository(session).save(product)

    return product


@pytest.fixture
async def completed_order(
    verified_student_user: Student,
    approved_store: Store,
    available_product: Product,
) -> Order:
    order = Order.create(
        student_id=verified_student_user.id,
        store_id=approved_store.id,
        payment_method=PaymentMethod.CASH,
        expires_at=datetime.now(UTC) + timedelta(minutes=30),
        notes="Completed order fixture",
    )
    order.create_order_item(
        product_id=available_product.id,
        product_name=available_product.name,
        product_price=available_product.price,
        quantity=2,
    )
    order.calculate_total()
    order.confirm_cash_payment()
    order.seller_accept()
    order.seller_mark_as_ready_to_pickup()
    order.complete()

    async with factory() as session:
        async with session.begin():
            await OrderRepository(session).save(order)

    return order


@pytest.fixture
async def active_promo(approved_store: Store) -> Promo:
    now = datetime.now(UTC)
    promo = approved_store.create_promo(
        code="demo10",
        type=PromoType.PERCENTAGE,
        value=10,
        start_date=now - timedelta(days=1),
        end_date=now + timedelta(days=1),
        max_usage=10,
        max_discount_amount=5000,
        min_order_amount=10000,
    )

    async with factory() as session:
        async with session.begin():
            await PromoRepository(session).save(promo)

    return promo
