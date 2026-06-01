from __future__ import annotations

import asyncio
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid5

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import factory
from app.favorites.favorite import ProductFavorite, StoreFavorite
from app.favorites.repository import FavoriteRepository
from app.orders.order import Order, OrderStatus, PaymentMethod
from app.orders.repository import OrderRepository
from app.products.model import ProductModel
from app.products.product import Product, ProductCategory, StoreSummary
from app.products.repository import ProductRepository
from app.promos.model import PromoModel
from app.promos.promo import Promo, PromoType
from app.promos.repository import PromoRepository
from app.reviews.repository import ReviewRepository
from app.reviews.review import Review
from app.security import hash_password
from app.stores.repository import StoreRepository
from app.stores.store import Store, StoreApprovalStatus
from app.students.model import StudentModel
from app.students.repository import StudentRepository
from app.students.student import Student
from app.users.admin import Admin
from app.users.repository import UserRepository
from app.users.seller import Seller
from app.users.user import User, UserRole, UserStatus

DEMO_NAMESPACE = UUID("f1b6b2e2-4640-4c93-8f01-4b5c65b74931")
DEMO_PASSWORD = "DemoPass123!"


@dataclass(frozen=True)
class DemoUser:
    key: str
    full_name: str
    email: str
    phone_number: str
    role: UserRole
    avatar_seed: str


@dataclass(frozen=True)
class DemoStudent:
    user: DemoUser
    nim: str
    faculty: str
    department: str


@dataclass(frozen=True)
class DemoStore:
    key: str
    seller: DemoUser
    name: str
    description: str
    address: str
    photo_seed: str
    maps_link: str
    is_open: bool


@dataclass(frozen=True)
class DemoProduct:
    key: str
    store_key: str
    name: str
    price: int
    category: ProductCategory
    description: str
    photo_seed: str
    is_available: bool = True


@dataclass(frozen=True)
class DemoOrderItem:
    product_key: str
    quantity: int


@dataclass(frozen=True)
class DemoOrder:
    key: str
    student_key: str
    store_key: str
    payment_method: PaymentMethod
    items: tuple[DemoOrderItem, ...]
    status: OrderStatus
    notes: str | None = None
    promo_key: str | None = None
    payment_proof_seed: str | None = None
    rejection_reason: str | None = None


def demo_id(kind: str, key: str) -> UUID:
    return uuid5(DEMO_NAMESPACE, f"{kind}:{key}")


def image_url(seed: str) -> str:
    return f"https://picsum.photos/seed/food-umkm-{seed}/800/600"


def qris_url(seed: str) -> str:
    return f"https://picsum.photos/seed/qris-{seed}/800/800"


ADMIN = DemoUser(
    key="admin",
    full_name="Admin Demo FoodHub",
    email="demo.admin@gmail.com",
    phone_number="081100000001",
    role=UserRole.ADMIN,
    avatar_seed="admin",
)

STUDENT = DemoStudent(
    user=DemoUser(
        key="student",
        full_name="Sinta Mahasiswa Demo",
        email="demo.student@gmail.com",
        phone_number="081100000002",
        role=UserRole.STUDENT,
        avatar_seed="student",
    ),
    nim="G6401239001",
    faculty="SSMI",
    department="Ilmu Komputer",
)

SELLERS = [
    DemoUser(
        key="seller-rasa",
        full_name="Raka Pemilik Rasa Kampus",
        email="demo.seller.rasa@gmail.com",
        phone_number="081100000011",
        role=UserRole.SELLER,
        avatar_seed="seller-rasa",
    ),
    DemoUser(
        key="seller-kopi",
        full_name="Maya Pemilik Kopi Teras",
        email="demo.seller.kopi@gmail.com",
        phone_number="081100000012",
        role=UserRole.SELLER,
        avatar_seed="seller-kopi",
    ),
]

STORES = [
    DemoStore(
        key="rasa-kampus",
        seller=SELLERS[0],
        name="Rasa Kampus UMKM",
        description="Masakan rumahan cepat saji untuk makan siang mahasiswa.",
        address="Kantin Bara, Dramaga, Bogor",
        photo_seed="warung-rasa-kampus",
        maps_link="https://maps.google.com/?q=-6.5584,106.7312",
        is_open=True,
    ),
    DemoStore(
        key="kopi-teras",
        seller=SELLERS[1],
        name="Kopi Teras Dramaga",
        description="Minuman kopi, teh, dan camilan ringan untuk jeda kelas.",
        address="Jl. Babakan Raya No. 21, Dramaga",
        photo_seed="kedai-kopi-teras",
        maps_link="https://maps.google.com/?q=-6.5609,106.7288",
        is_open=True,
    ),
]

PRODUCTS = [
    DemoProduct(
        "nasi-ayam-rempah",
        "rasa-kampus",
        "Nasi Ayam Rempah",
        18000,
        ProductCategory.FOOD,
        "Nasi hangat dengan ayam bumbu rempah dan sambal tomat.",
        "nasi-ayam-rempah",
    ),
    DemoProduct(
        "mie-goreng-kampus",
        "rasa-kampus",
        "Mie Goreng Kampus",
        15000,
        ProductCategory.FOOD,
        "Mie goreng telur dengan sayur segar dan acar.",
        "mie-goreng-kampus",
    ),
    DemoProduct(
        "nasi-bakar-tongkol",
        "rasa-kampus",
        "Nasi Bakar Tongkol",
        17000,
        ProductCategory.FOOD,
        "Nasi bakar daun pisang isi tongkol pedas kemangi.",
        "nasi-bakar-tongkol",
    ),
    DemoProduct(
        "risol-mayo",
        "rasa-kampus",
        "Risol Mayo",
        6000,
        ProductCategory.SNACK,
        "Risol isi telur, smoked beef, dan saus mayo.",
        "risol-mayo",
    ),
    DemoProduct(
        "keripik-tempe",
        "rasa-kampus",
        "Keripik Tempe",
        9000,
        ProductCategory.SNACK,
        "Keripik tempe renyah kemasan kecil.",
        "keripik-tempe",
    ),
    DemoProduct(
        "paket-nasi-uduk",
        "rasa-kampus",
        "Paket Nasi Uduk",
        16000,
        ProductCategory.FOOD,
        "Nasi uduk, bihun, orek, telur balado, dan sambal.",
        "paket-nasi-uduk",
    ),
    DemoProduct(
        "kopi-susu-gula-aren",
        "kopi-teras",
        "Kopi Susu Gula Aren",
        18000,
        ProductCategory.DRINK,
        "Espresso, susu segar, dan gula aren.",
        "kopi-susu-gula-aren",
    ),
    DemoProduct(
        "es-teh-leci",
        "kopi-teras",
        "Es Teh Leci",
        14000,
        ProductCategory.DRINK,
        "Teh hitam dingin dengan sirup dan buah leci.",
        "es-teh-leci",
    ),
    DemoProduct(
        "matcha-latte",
        "kopi-teras",
        "Matcha Latte",
        20000,
        ProductCategory.DRINK,
        "Matcha, susu segar, dan sedikit vanilla.",
        "matcha-latte",
    ),
    DemoProduct(
        "roti-bakar-cokelat",
        "kopi-teras",
        "Roti Bakar Cokelat",
        13000,
        ProductCategory.SNACK,
        "Roti bakar tebal dengan meses cokelat.",
        "roti-bakar-cokelat",
    ),
    DemoProduct(
        "kentang-goreng",
        "kopi-teras",
        "Kentang Goreng",
        15000,
        ProductCategory.SNACK,
        "Kentang goreng renyah dengan saus sambal.",
        "kentang-goreng",
    ),
    DemoProduct(
        "air-mineral",
        "kopi-teras",
        "Air Mineral",
        5000,
        ProductCategory.DRINK,
        "Air mineral botol dingin.",
        "air-mineral",
    ),
]

ORDERS = [
    DemoOrder(
        "pending-qris",
        "student",
        "rasa-kampus",
        PaymentMethod.QRIS,
        (DemoOrderItem("nasi-ayam-rempah", 1),),
        OrderStatus.PENDING,
        "Akan dibayar lewat QRIS.",
    ),
    DemoOrder(
        "waiting-confirmation",
        "student",
        "kopi-teras",
        PaymentMethod.QRIS,
        (
            DemoOrderItem("kopi-susu-gula-aren", 1),
            DemoOrderItem("roti-bakar-cokelat", 1),
        ),
        OrderStatus.WAITING_FOR_CONFIRMATION,
        "Bukti pembayaran sudah diunggah.",
        payment_proof_seed="proof-waiting",
    ),
    DemoOrder(
        "in-process",
        "student",
        "rasa-kampus",
        PaymentMethod.CASH,
        (DemoOrderItem("mie-goreng-kampus", 2),),
        OrderStatus.IN_PROCESS,
        "Tidak pedas.",
    ),
    DemoOrder(
        "ready-to-pickup",
        "student",
        "kopi-teras",
        PaymentMethod.CASH,
        (DemoOrderItem("es-teh-leci", 1), DemoOrderItem("kentang-goreng", 1)),
        OrderStatus.READY_TO_PICKUP,
        "Ambil jam istirahat.",
    ),
    DemoOrder(
        "completed-reviewed",
        "student",
        "rasa-kampus",
        PaymentMethod.CASH,
        (DemoOrderItem("nasi-bakar-tongkol", 1), DemoOrderItem("risol-mayo", 2)),
        OrderStatus.COMPLETED,
        "Pesanan selesai dan sudah diulas.",
        promo_key="hemat-rasa",
    ),
    DemoOrder(
        "completed-unreviewed",
        "student",
        "kopi-teras",
        PaymentMethod.QRIS,
        (DemoOrderItem("matcha-latte", 1), DemoOrderItem("air-mineral", 1)),
        OrderStatus.COMPLETED,
        "Pesanan selesai, belum diulas.",
        payment_proof_seed="proof-completed",
    ),
    DemoOrder(
        "rejected",
        "student",
        "rasa-kampus",
        PaymentMethod.QRIS,
        (DemoOrderItem("paket-nasi-uduk", 1),),
        OrderStatus.REJECTED,
        "Stok habis setelah checkout.",
        payment_proof_seed="proof-rejected",
        rejection_reason="Paket nasi uduk sudah habis untuk hari ini.",
    ),
    DemoOrder(
        "failed",
        "student",
        "kopi-teras",
        PaymentMethod.QRIS,
        (DemoOrderItem("kopi-susu-gula-aren", 1),),
        OrderStatus.FAILED,
        "Pembayaran melewati batas waktu.",
    ),
]


async def ensure_user(
    session: AsyncSession, user_repo: UserRepository, spec: DemoUser
) -> User:
    now = datetime.now(UTC)
    existing = await user_repo.get_by_email(spec.email)
    password_hash = hash_password(DEMO_PASSWORD)

    if existing is None:
        user = User(
            id=demo_id("user", spec.key),
            full_name=spec.full_name,
            avatar_url=image_url(spec.avatar_seed),
            email=spec.email,
            phone_number=spec.phone_number,
            password_hash=password_hash,
            role=spec.role,
            status=UserStatus.ACTIVE,
            email_verified_at=now,
            phone_verified_at=now,
        )
        await user_repo.save(user)
        await session.flush()
        return user

    existing.full_name = spec.full_name
    existing.avatar_url = image_url(spec.avatar_seed)
    existing.phone_number = spec.phone_number
    existing.password_hash = password_hash
    existing.role = spec.role
    existing.status = UserStatus.ACTIVE
    existing.email_verified_at = existing.email_verified_at or now
    existing.phone_verified_at = existing.phone_verified_at or now
    existing.updated_at = now
    await user_repo.update(existing)
    await session.flush()
    return existing


async def ensure_student(
    session: AsyncSession,
    user_repo: UserRepository,
    student_repo: StudentRepository,
    spec: DemoStudent,
) -> Student:
    now = datetime.now(UTC)
    existing_user = await user_repo.get_by_email(spec.user.email)
    if existing_user is None:
        student = Student.register(
            full_name=spec.user.full_name,
            email=spec.user.email,
            phone_number=spec.user.phone_number,
            password_hash=hash_password(DEMO_PASSWORD),
            nim=spec.nim,
            faculty=spec.faculty,
            department=spec.department,
        )
        student.id = demo_id("user", spec.user.key)
        student.avatar_url = image_url(spec.user.avatar_seed)
        student.mark_email_as_verified()
        student.mark_phone_as_verified()
        await student_repo.save(student)
        await session.flush()
        return student

    student = await student_repo.get_by_user_id(existing_user.id)
    if student is None:
        await ensure_user(session, user_repo, spec.user)
        session.add(
            StudentModel(
                user_id=existing_user.id,
                nim=spec.nim,
                faculty=spec.faculty,
                department=spec.department,
            )
        )
        await session.flush()
        student = await student_repo.get_by_user_id(existing_user.id)
        if student is None:
            raise RuntimeError("failed to create demo student profile")
        return student

    student.full_name = spec.user.full_name
    student.avatar_url = image_url(spec.user.avatar_seed)
    student.phone_number = spec.user.phone_number
    student.password_hash = hash_password(DEMO_PASSWORD)
    student.role = UserRole.STUDENT
    student.status = UserStatus.ACTIVE
    student.email_verified_at = student.email_verified_at or now
    student.phone_verified_at = student.phone_verified_at or now
    student.nim = spec.nim
    student.faculty = spec.faculty
    student.department = spec.department
    student.updated_at = now
    await student_repo.update(student)
    await session.flush()
    return student


async def ensure_seller(
    session: AsyncSession, user_repo: UserRepository, spec: DemoUser
) -> Seller:
    user = await ensure_user(session, user_repo, spec)
    return Seller(
        id=user.id,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        email=user.email,
        pending_email=user.pending_email,
        phone_number=user.phone_number,
        password_hash=user.password_hash,
        role=UserRole.SELLER,
        status=user.status,
        email_verified_at=user.email_verified_at,
        phone_verified_at=user.phone_verified_at,
        deleted_at=user.deleted_at,
        created_at=user.created_at,
        updated_at=user.updated_at,
        store=None,
    )


async def ensure_store(
    session: AsyncSession,
    store_repo: StoreRepository,
    admin: Admin,
    seller: Seller,
    spec: DemoStore,
) -> Store:
    store = await store_repo.get_by_owner_id(seller.id)
    if store is None:
        store = seller.create_store(
            name=spec.name,
            description=spec.description,
            address=spec.address,
            photo_url=image_url(spec.photo_seed),
            qris_image_url=qris_url(spec.key),
            maps_link=spec.maps_link,
        )
        store.id = demo_id("store", spec.key)
        admin.approve_store_application(store)
        if spec.is_open:
            store.open()
        await store_repo.save(store)
        await session.flush()
        return store

    store.name = spec.name
    store.description = spec.description
    store.address = spec.address
    store.photo_url = image_url(spec.photo_seed)
    store.qris_image_url = qris_url(spec.key)
    store.maps_link = spec.maps_link
    store.approval_status = StoreApprovalStatus.APPROVED
    store.approval_notes = None
    store.is_open = spec.is_open
    store.updated_at = datetime.now(UTC)
    await store_repo.update(store)
    await session.flush()
    return store


async def get_seed_product_by_id(
    session: AsyncSession, store: Store, product_id: UUID
) -> Product | None:
    model = await session.get(ProductModel, product_id)
    if model is None:
        return None
    return Product(
        id=model.id,
        store=StoreSummary(
            id=store.id,
            name=store.name,
            photo_url=store.photo_url,
            rating=store.rating,
            total_reviews=store.total_reviews,
        ),
        name=model.name,
        description=model.description,
        price=model.price,
        photo_url=model.photo_url,
        category=model.category,
        is_available=model.is_available,
        rating=float(model.rating) if model.rating else None,
        total_reviews=model.total_reviews,
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
    )


async def ensure_product(
    session: AsyncSession,
    product_repo: ProductRepository,
    stores_by_key: dict[str, Store],
    spec: DemoProduct,
) -> Product:
    product_id = demo_id("product", spec.key)
    store = stores_by_key[spec.store_key]
    product = await get_seed_product_by_id(session, store, product_id)

    if product is None:
        product = store.create_product(
            name=spec.name,
            price=spec.price,
            category=spec.category,
            description=spec.description,
            photo_url=image_url(spec.photo_seed),
        )
        product.id = product_id
        if spec.is_available:
            product.mark_as_available()
        await product_repo.save(product)
        await session.flush()
        return product

    product.change_information(
        name=spec.name,
        price=spec.price,
        category=spec.category,
        description=spec.description,
        photo_url=image_url(spec.photo_seed),
    )
    if spec.is_available:
        product.mark_as_available()
    else:
        product.mark_as_unavailable()
    product.deleted_at = None
    await product_repo.update(product)
    await session.flush()
    return product


async def ensure_promos(
    session: AsyncSession,
    promo_repo: PromoRepository,
    stores_by_key: dict[str, Store],
) -> dict[str, Promo]:
    now = datetime.now(UTC)
    specs = {
        "hemat-rasa": (
            stores_by_key["rasa-kampus"],
            "HEMATRASA",
            PromoType.FIXED,
            5000,
            50000,
            None,
        ),
        "kopi20": (
            stores_by_key["kopi-teras"],
            "KOPI20",
            PromoType.PERCENTAGE,
            20,
            30000,
            10000,
        ),
    }
    promos: dict[str, Promo] = {}
    for key, (store, code, promo_type, value, min_order, max_discount) in specs.items():
        promo_id = demo_id("promo", key)
        promo = await promo_repo.get_by_code_and_store(code, store.id)
        if promo is None:
            promo_model = await session.get(PromoModel, promo_id)
            promo = (
                PromoRepository._to_entity(promo_model)
                if promo_model is not None
                else None
            )
        if promo is None:
            promo = Promo.create(
                store_id=store.id,
                type=promo_type,
                code=code,
                value=value,
                start_date=now - timedelta(days=7),
                end_date=now + timedelta(days=30),
                max_usage=100,
                max_discount_amount=max_discount,
                min_order_amount=min_order,
            )
            promo.id = promo_id
            await promo_repo.save(promo)
        else:
            promo_updates = {
                "start_date": now - timedelta(days=7),
                "end_date": now + timedelta(days=30),
                "max_usage": 100,
            }
            if promo.usage_count == 0:
                promo_updates.update(
                    {
                        "code": code,
                        "type": promo_type,
                        "value": value,
                        "max_discount_amount": max_discount,
                        "min_order_amount": min_order,
                    }
                )
            promo.change_information(**promo_updates)
            promo.deleted_at = None
            await promo_repo.update(promo)
        promos[key] = promo
    await session.flush()
    return promos


def build_order(
    spec: DemoOrder,
    student: Student,
    stores_by_key: dict[str, Store],
    products_by_key: dict[str, Product],
    promos_by_key: dict[str, Promo],
) -> Order:
    now = datetime.now(UTC)
    order = Order.create(
        student_id=student.id,
        store_id=stores_by_key[spec.store_key].id,
        payment_method=spec.payment_method,
        expires_at=now + timedelta(hours=2),
        notes=spec.notes,
    )
    order.id = demo_id("order", spec.key)
    for item in spec.items:
        product = products_by_key[item.product_key]
        order.create_order_item(
            product_id=product.id,
            product_name=product.name,
            product_price=product.price,
            quantity=item.quantity,
        )
    order.calculate_total()

    if spec.promo_key is not None:
        promo = promos_by_key[spec.promo_key]
        order.promo_id = promo.id
        order.promo_code = promo.code
        order.discount_amount = promo.calculate_discount(order.total_price)
        order.total_price -= order.discount_amount

    if spec.payment_proof_seed is not None:
        order.payment_proof_url = image_url(spec.payment_proof_seed)

    order.status = spec.status
    if spec.status == OrderStatus.REJECTED:
        order.rejection_reason = spec.rejection_reason
        order.rejected_at = now - timedelta(minutes=20)
    if spec.status == OrderStatus.FAILED:
        order.expires_at = now - timedelta(hours=1)
    return order


async def ensure_orders(
    order_repo: OrderRepository,
    student: Student,
    stores_by_key: dict[str, Store],
    products_by_key: dict[str, Product],
    promos_by_key: dict[str, Promo],
) -> dict[str, Order]:
    orders: dict[str, Order] = {}
    for spec in ORDERS:
        order = build_order(
            spec, student, stores_by_key, products_by_key, promos_by_key
        )
        existing = await order_repo.get_by_id(order.id)
        if existing is None:
            await order_repo.save(order)
            orders[spec.key] = order
        else:
            orders[spec.key] = existing
    return orders


async def ensure_reviews(
    review_repo: ReviewRepository,
    student: Student,
    orders_by_key: dict[str, Order],
    products_by_key: dict[str, Product],
) -> None:
    reviewed_order = orders_by_key["completed-reviewed"]
    existing_reviewed = await review_repo.get_reviewed_product_ids(reviewed_order.id)
    reviews = []
    payloads = [
        (
            "nasi-bakar-tongkol",
            5,
            "Nasi bakarnya harum, tongkol pedasnya pas untuk makan siang.",
        ),
        ("risol-mayo", 4, "Risol mayo masih hangat dan porsinya cocok untuk camilan."),
    ]
    for product_key, rating, comment in payloads:
        product = products_by_key[product_key]
        if product.id in existing_reviewed:
            continue
        reviews.append(
            Review.create(
                order_id=reviewed_order.id,
                student_id=student.id,
                store_id=reviewed_order.store_id,
                product_id=product.id,
                rating=rating,
                comment=comment,
            )
        )
    if reviews:
        await review_repo.save_many(reviews)

    affected_product_ids = {
        products_by_key["nasi-bakar-tongkol"].id,
        products_by_key["risol-mayo"].id,
    }
    for product_id in affected_product_ids:
        await review_repo.recalculate_product_rating(product_id)
    await review_repo.recalculate_store_rating(reviewed_order.store_id)


async def ensure_favorites(
    favorite_repo: FavoriteRepository,
    student: Student,
    stores_by_key: dict[str, Store],
    products_by_key: dict[str, Product],
) -> None:
    await favorite_repo.add_store(
        StoreFavorite(student_id=student.id, store_id=stores_by_key["rasa-kampus"].id)
    )
    await favorite_repo.add_store(
        StoreFavorite(student_id=student.id, store_id=stores_by_key["kopi-teras"].id)
    )
    await favorite_repo.add_product(
        ProductFavorite(
            student_id=student.id, product_id=products_by_key["nasi-ayam-rempah"].id
        )
    )
    await favorite_repo.add_product(
        ProductFavorite(
            student_id=student.id, product_id=products_by_key["kopi-susu-gula-aren"].id
        )
    )


async def seed() -> None:
    async with factory() as session:
        user_repo = UserRepository(session)
        student_repo = StudentRepository(session)
        store_repo = StoreRepository(session)
        product_repo = ProductRepository(session)
        promo_repo = PromoRepository(session)
        order_repo = OrderRepository(session)
        review_repo = ReviewRepository(session)
        favorite_repo = FavoriteRepository(session)

        admin_user = await ensure_user(session, user_repo, ADMIN)
        admin = Admin(
            id=admin_user.id,
            full_name=admin_user.full_name,
            avatar_url=admin_user.avatar_url,
            email=admin_user.email,
            pending_email=admin_user.pending_email,
            phone_number=admin_user.phone_number,
            password_hash=admin_user.password_hash,
            role=UserRole.ADMIN,
            status=admin_user.status,
            email_verified_at=admin_user.email_verified_at,
            phone_verified_at=admin_user.phone_verified_at,
            deleted_at=admin_user.deleted_at,
            created_at=admin_user.created_at,
            updated_at=admin_user.updated_at,
        )
        student = await ensure_student(session, user_repo, student_repo, STUDENT)

        sellers_by_key = {
            seller.key: await ensure_seller(session, user_repo, seller)
            for seller in SELLERS
        }
        stores_by_key = {
            store.key: await ensure_store(
                session, store_repo, admin, sellers_by_key[store.seller.key], store
            )
            for store in STORES
        }
        products_by_key = {
            product.key: await ensure_product(
                session, product_repo, stores_by_key, product
            )
            for product in PRODUCTS
        }
        promos_by_key = await ensure_promos(session, promo_repo, stores_by_key)
        orders_by_key = await ensure_orders(
            order_repo, student, stores_by_key, products_by_key, promos_by_key
        )
        await session.flush()
        await ensure_reviews(review_repo, student, orders_by_key, products_by_key)
        await ensure_favorites(favorite_repo, student, stores_by_key, products_by_key)

        await session.commit()

    print("Demo seed complete.")
    print(f"Password for all demo accounts: {DEMO_PASSWORD}")
    print(f"Admin:   {ADMIN.email}")
    print(f"Student: {STUDENT.user.email}")
    for seller in SELLERS:
        print(f"Seller:  {seller.email}")


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
