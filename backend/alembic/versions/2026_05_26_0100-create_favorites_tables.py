"""create favorites tables

Revision ID: a9d41f84376b
Revises: 75a5bb25f0df
Create Date: 2026-05-26 01:00:00.000000+07:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a9d41f84376b"
down_revision: Union[str, Sequence[str], None] = "75a5bb25f0df"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "store_favorites",
        sa.Column("student_id", sa.Uuid(), nullable=False),
        sa.Column("store_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["store_id"],
            ["stores.id"],
            name=op.f("fk_store_favorites_store_id_stores"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["student_id"],
            ["users.id"],
            name=op.f("fk_store_favorites_student_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "student_id", "store_id", name=op.f("pk_store_favorites")
        ),
    )
    op.create_table(
        "product_favorites",
        sa.Column("student_id", sa.Uuid(), nullable=False),
        sa.Column("product_id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["products.id"],
            name=op.f("fk_product_favorites_product_id_products"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["student_id"],
            ["users.id"],
            name=op.f("fk_product_favorites_student_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "student_id", "product_id", name=op.f("pk_product_favorites")
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("product_favorites")
    op.drop_table("store_favorites")
