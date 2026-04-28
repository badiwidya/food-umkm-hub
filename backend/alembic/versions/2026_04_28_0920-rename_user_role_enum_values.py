"""rename_user_role_enum_values

Revision ID: bc3247d77ccc
Revises: 0685cb11db93
Create Date: 2026-04-28 09:20:36.765816+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bc3247d77ccc'
down_revision: Union[str, Sequence[str], None] = '0685cb11db93'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE userrole RENAME VALUE 'MAHASISWA' TO 'STUDENT'")
    op.execute("ALTER TYPE userrole RENAME VALUE 'UMKM' TO 'SELLER'")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TYPE userrole RENAME VALUE 'STUDENT' TO 'MAHASISWA'")
    op.execute("ALTER TYPE userrole RENAME VALUE 'SELLER' TO 'UMKM'")
