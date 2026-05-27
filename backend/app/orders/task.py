from celery import shared_task
from sqlalchemy import create_engine, func, select, update
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.domains.order import OrderStatus
from app.orders.model import OrderModel

engine = create_engine(
    settings.SYNC_DB_URI,
    pool_pre_ping=True,
)

factory_local = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


@shared_task(name="orders.expire_unpaid_orders")
def expire_unpaid_orders() -> None:

    print("task running")
    with factory_local() as session:
        expired_order_ids = (
            select(OrderModel.id)
            .where(
                OrderModel.status == OrderStatus.PENDING,
                OrderModel.expires_at <= func.now(),
            )
            .order_by(OrderModel.expires_at.asc())
            .limit(100)
            .with_for_update(skip_locked=True)
            .cte("expired_order_ids")
        )

        stmt = (
            update(OrderModel)
            .where(OrderModel.id.in_(select(expired_order_ids.c.id)))
            .values(status=OrderStatus.FAILED)
        )

        session.execute(stmt)
        session.commit()
