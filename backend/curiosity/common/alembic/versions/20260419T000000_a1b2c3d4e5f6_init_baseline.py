"""init_baseline

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-04-19 00:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP EXTENSION IF EXISTS pgcrypto;
        """
    )
