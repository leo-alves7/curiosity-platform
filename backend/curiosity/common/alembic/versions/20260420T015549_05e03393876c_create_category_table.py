"""create_category_table

Revision ID: 05e03393876c
Revises: b64eb22e36a7
Create Date: 2026-04-20 01:55:49.547037

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "05e03393876c"
down_revision: str | None = "b64eb22e36a7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS category (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(100) NOT NULL,
            icon VARCHAR(100),
            color VARCHAR(7),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            deleted_at TIMESTAMPTZ
        );
        """
    )
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS idx_category_slug ON category (slug);
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_category_deleted_at ON category (deleted_at);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP INDEX IF EXISTS idx_category_deleted_at;
        """
    )
    op.execute(
        """
        DROP INDEX IF EXISTS idx_category_slug;
        """
    )
    op.execute(
        """
        DROP TABLE IF EXISTS category;
        """
    )
