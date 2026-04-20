"""add_category_fk_to_store

Revision ID: 51c261f5034c
Revises: 05e03393876c
Create Date: 2026-04-20 01:55:52.288335

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "51c261f5034c"
down_revision: str | None = "05e03393876c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_store_category_id'
            ) THEN
                ALTER TABLE store
                    ADD CONSTRAINT fk_store_category_id
                    FOREIGN KEY (category_id)
                    REFERENCES category(id)
                    ON DELETE SET NULL;
            END IF;
        END
        $$;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        ALTER TABLE store
            DROP CONSTRAINT IF EXISTS fk_store_category_id;
        """
    )
