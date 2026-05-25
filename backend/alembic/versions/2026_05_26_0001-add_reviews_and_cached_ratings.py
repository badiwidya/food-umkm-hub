"""add reviews and cached ratings

Revision ID: 75a5bb25f0df
Revises: cf9175eb19df
Create Date: 2026-05-26 00:01:00.000000+07:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "75a5bb25f0df"
down_revision: Union[str, Sequence[str], None] = "cf9175eb19df"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "products", sa.Column("rating", sa.Numeric(precision=2, scale=1), nullable=True)
    )
    op.add_column(
        "products",
        sa.Column(
            "total_reviews", sa.Integer(), server_default=sa.text("0"), nullable=False
        ),
    )
    op.add_column(
        "stores", sa.Column("rating", sa.Numeric(precision=2, scale=1), nullable=True)
    )
    op.add_column(
        "stores",
        sa.Column(
            "total_reviews", sa.Integer(), server_default=sa.text("0"), nullable=False
        ),
    )
    op.create_table(
        "reviews",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("order_id", sa.Uuid(), nullable=False),
        sa.Column("student_id", sa.Uuid(), nullable=False),
        sa.Column("store_id", sa.Uuid(), nullable=False),
        sa.Column("product_id", sa.Uuid(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.String(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "rating >= 1 AND rating <= 5",
            name=op.f("ck_reviews_rating_between_1_and_5"),
        ),
        sa.ForeignKeyConstraint(
            ["order_id"], ["orders.id"], name=op.f("fk_reviews_order_id_orders")
        ),
        sa.ForeignKeyConstraint(
            ["product_id"], ["products.id"], name=op.f("fk_reviews_product_id_products")
        ),
        sa.ForeignKeyConstraint(
            ["store_id"], ["stores.id"], name=op.f("fk_reviews_store_id_stores")
        ),
        sa.ForeignKeyConstraint(
            ["student_id"], ["users.id"], name=op.f("fk_reviews_student_id_users")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_reviews")),
        sa.UniqueConstraint(
            "order_id", "product_id", name=op.f("uq_reviews_order_id_product_id")
        ),
    )
    op.create_index("ix_reviews_order_id", "reviews", ["order_id"], unique=False)
    op.create_index("ix_reviews_product_id", "reviews", ["product_id"], unique=False)
    op.create_index("ix_reviews_store_id", "reviews", ["store_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_reviews_store_id", table_name="reviews")
    op.drop_index("ix_reviews_product_id", table_name="reviews")
    op.drop_index("ix_reviews_order_id", table_name="reviews")
    op.drop_table("reviews")
    op.drop_column("stores", "total_reviews")
    op.drop_column("stores", "rating")
    op.drop_column("products", "total_reviews")
    op.drop_column("products", "rating")
