"""create_store_table

Revision ID: b64eb22e36a7
Revises: efb861f7ad59
Create Date: 2026-04-20 01:35:27.636197

"""

from collections.abc import Sequence

from alembic import op

revision: str = "b64eb22e36a7"
down_revision: str | None = "efb861f7ad59"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS store (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            address VARCHAR(500),
            lat NUMERIC(10, 7),
            lng NUMERIC(10, 7),
            category_id UUID,
            image_url VARCHAR(2048),
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            deleted_at TIMESTAMPTZ
        );
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_store_lat_lng ON store (lat, lng);
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_store_category_id ON store (category_id);
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS idx_store_is_active ON store (is_active);
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DROP INDEX IF EXISTS idx_store_is_active;
        """
    )
    op.execute(
        """
        DROP INDEX IF EXISTS idx_store_category_id;
        """
    )
    op.execute(
        """
        DROP INDEX IF EXISTS idx_store_lat_lng;
        """
    )
    op.execute(
        """
        DROP TABLE IF EXISTS store;
        """
    )
