"""init_baseline

Revision ID: efb861f7ad59
Revises:
Create Date: 2026-04-20 00:03:43.133663

"""

from collections.abc import Sequence

from alembic import op

revision: str = "efb861f7ad59"
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
