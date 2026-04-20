import uuid

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from curiosity.web.managers.category_manager import category_manager
from curiosity.web.managers.store_manager import store_manager
from curiosity.web.model.category import Category  # noqa: F401
from curiosity.web.model.store import Store  # noqa: F401
from curiosity.web.schemas.category import CategoryCreate, CategoryUpdate
from curiosity.web.schemas.store import StoreCreate

pytestmark = pytest.mark.xdist_group("db")


@pytest.fixture
async def sample_categories(db_session: AsyncSession):
    categories = [
        await category_manager.create_category(
            db_session, CategoryCreate(name="Coffee", slug="coffee", color="#6F4E37")
        ),
        await category_manager.create_category(db_session, CategoryCreate(name="Food", slug="food", color="#FF5733")),
    ]
    return categories


class TestCategoryManagerList:
    async def test_list_returns_all_active(self, db_session: AsyncSession, sample_categories):
        result = await category_manager.list_categories(db_session)
        assert result.total == 2
        assert len(result.items) == 2

    async def test_list_excludes_soft_deleted(self, db_session: AsyncSession, sample_categories):
        await category_manager.delete_category(db_session, sample_categories[0].id)
        result = await category_manager.list_categories(db_session)
        assert result.total == 1

    async def test_list_pagination(self, db_session: AsyncSession):
        for i in range(5):
            await category_manager.create_category(db_session, CategoryCreate(name=f"Cat {i}", slug=f"cat-{i}"))
        result = await category_manager.list_categories(db_session, page=2, page_size=2)
        assert len(result.items) == 2
        assert result.total == 5

    async def test_list_includes_stores(self, db_session: AsyncSession):
        cat = await category_manager.create_category(db_session, CategoryCreate(name="With Stores", slug="with-stores"))
        await store_manager.create_store(db_session, StoreCreate(name="Store A", category_id=cat.id))
        result = await category_manager.list_categories(db_session)
        cat_item = next(item for item in result.items if item.id == cat.id)
        assert len(cat_item.stores) == 1


class TestCategoryManagerGet:
    async def test_get_existing_returns_category(self, db_session: AsyncSession, sample_categories):
        cat = sample_categories[0]
        fetched = await category_manager.get_category(db_session, cat.id)
        assert fetched is not None
        assert fetched.id == cat.id
        assert fetched.name == cat.name
        assert fetched.slug == cat.slug

    async def test_get_includes_stores(self, db_session: AsyncSession):
        cat = await category_manager.create_category(db_session, CategoryCreate(name="Stores Cat", slug="stores-cat"))
        await store_manager.create_store(db_session, StoreCreate(name="Store X", category_id=cat.id))
        await store_manager.create_store(db_session, StoreCreate(name="Store Y", category_id=cat.id))
        fetched = await category_manager.get_category(db_session, cat.id)
        assert fetched is not None
        assert len(fetched.stores) == 2

    async def test_get_nonexistent_returns_none(self, db_session: AsyncSession):
        result = await category_manager.get_category(db_session, uuid.uuid4())
        assert result is None

    async def test_get_soft_deleted_returns_none(self, db_session: AsyncSession, sample_categories):
        cat = sample_categories[0]
        await category_manager.delete_category(db_session, cat.id)
        result = await category_manager.get_category(db_session, cat.id)
        assert result is None


class TestCategoryManagerCreate:
    async def test_create_persists_all_fields(self, db_session: AsyncSession):
        cat = await category_manager.create_category(
            db_session,
            CategoryCreate(name="Electronics", slug="electronics", icon="store-outline", color="#0000FF"),
        )
        assert cat.name == "Electronics"
        assert cat.slug == "electronics"
        assert cat.icon == "store-outline"
        assert cat.color == "#0000FF"
        assert cat.id is not None
        assert cat.created_at is not None

    async def test_create_optional_fields_default_none(self, db_session: AsyncSession):
        cat = await category_manager.create_category(db_session, CategoryCreate(name="Minimal", slug="minimal"))
        assert cat.icon is None
        assert cat.color is None


class TestCategoryManagerUpdate:
    async def test_update_changes_name(self, db_session: AsyncSession, sample_categories):
        cat = sample_categories[0]
        updated = await category_manager.update_category(db_session, cat.id, CategoryUpdate(name="New Name"))
        assert updated is not None
        assert updated.name == "New Name"

    async def test_update_nonexistent_returns_none(self, db_session: AsyncSession):
        result = await category_manager.update_category(db_session, uuid.uuid4(), CategoryUpdate(name="Ghost"))
        assert result is None

    async def test_update_partial_leaves_other_fields_unchanged(self, db_session: AsyncSession):
        cat = await category_manager.create_category(
            db_session, CategoryCreate(name="Original", slug="original", icon="leaf-outline")
        )
        updated = await category_manager.update_category(db_session, cat.id, CategoryUpdate(icon="star-outline"))
        assert updated is not None
        assert updated.name == "Original"
        assert updated.slug == "original"
        assert updated.icon == "star-outline"


class TestCategoryManagerDelete:
    async def test_delete_sets_deleted_at(self, db_session: AsyncSession, sample_categories):
        cat = sample_categories[0]
        result = await category_manager.delete_category(db_session, cat.id)
        assert result is True
        raw = await db_session.execute(text("SELECT deleted_at FROM category WHERE id = :id"), {"id": str(cat.id)})
        deleted_at = raw.scalar_one_or_none()
        assert deleted_at is not None

    async def test_delete_nonexistent_returns_false(self, db_session: AsyncSession):
        result = await category_manager.delete_category(db_session, uuid.uuid4())
        assert result is False

    async def test_deleted_category_excluded_from_get(self, db_session: AsyncSession, sample_categories):
        cat = sample_categories[0]
        await category_manager.delete_category(db_session, cat.id)
        result = await category_manager.get_category(db_session, cat.id)
        assert result is None

    async def test_delete_does_not_hard_delete_associated_stores(self, db_session: AsyncSession):
        cat = await category_manager.create_category(db_session, CategoryCreate(name="Temp Cat", slug="temp-cat"))
        store = await store_manager.create_store(db_session, StoreCreate(name="Linked Store", category_id=cat.id))
        store_id = store.id

        await category_manager.delete_category(db_session, cat.id)

        # Soft delete only sets deleted_at on the category row; it does not remove it.
        # The FK ON DELETE SET NULL fires only on hard DELETE — stores are unaffected by soft delete.
        raw = await db_session.execute(text("SELECT deleted_at FROM store WHERE id = :id"), {"id": str(store_id)})
        store_deleted_at = raw.scalar_one_or_none()
        assert store_deleted_at is None
