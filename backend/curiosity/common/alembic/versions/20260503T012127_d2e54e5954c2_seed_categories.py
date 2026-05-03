"""seed_categories

Revision ID: d2e54e5954c2
Revises: 51c261f5034c
Create Date: 2026-05-03 01:21:27.345757

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d2e54e5954c2"
down_revision: str | None = "51c261f5034c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        INSERT INTO category (id, name, slug, icon, color, created_at, updated_at)
        VALUES
            ('11111111-1111-1111-1111-111111111111',
             'Restaurant', 'restaurant', 'utensils', '#E74C3C', now(), now()),
            ('22222222-2222-2222-2222-222222222222',
             'Pharmacy', 'pharmacy', 'pill', '#27AE60', now(), now()),
            ('33333333-3333-3333-3333-333333333333',
             'Gas Station', 'gas_station', 'fuel', '#F39C12', now(), now()),
            ('44444444-4444-4444-4444-444444444444',
             'Market', 'market', 'shopping-cart', '#2980B9', now(), now()),
            ('55555555-5555-5555-5555-555555555555',
             'Hotel', 'hotel', 'bed', '#8E44AD', now(), now())
        ON CONFLICT (slug) DO NOTHING;
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM category
        WHERE id IN (
            '11111111-1111-1111-1111-111111111111',
            '22222222-2222-2222-2222-222222222222',
            '33333333-3333-3333-3333-333333333333',
            '44444444-4444-4444-4444-444444444444',
            '55555555-5555-5555-5555-555555555555'
        );
        """
    )
