import uuid

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from curiosity.web.managers.category_manager import category_manager as _category_manager
from curiosity.web.managers.store_manager import store_manager
from curiosity.web.model.category import Category  # noqa: F401
from curiosity.web.model.store import Store  # noqa: F401 — registers Store in Base.metadata
from curiosity.web.schemas.category import CategoryCreate
from curiosity.web.schemas.store import StoreCreate, StoreUpdate

pytestmark = pytest.mark.xdist_group("db")


@pytest.fixture
async def sample_stores(db_session: AsyncSession):
    category_a = await _category_manager.create_category(db_session, CategoryCreate(name="Cat A", slug="cat-a"))
    category_b = await _category_manager.create_category(db_session, CategoryCreate(name="Cat B", slug="cat-b"))
    stores = [
        await store_manager.create_store(
            db_session,
            StoreCreate(name="Coffee House", is_active=True, category_id=category_a.id),
        ),
        await store_manager.create_store(
            db_session,
            StoreCreate(name="Tea Garden", is_active=True, category_id=category_b.id),
        ),
        await store_manager.create_store(
            db_session,
            StoreCreate(name="Old Bakery", is_active=False, category_id=category_a.id),
        ),
    ]
    return stores, category_a.id, category_b.id


class TestStoreManagerList:
    @pytest.mark.parametrize(
        "filters,expected_count",
        [
            ({}, 3),
            ({"is_active": True}, 2),
            ({"is_active": False}, 1),
            ({"search": "coffee"}, 1),
            ({"search": "tea"}, 1),
            ({"search": "COFFEE"}, 1),
            ({"search": "house"}, 1),
        ],
    )
    async def test_list_stores_with_filters(
        self,
        db_session: AsyncSession,
        sample_stores,
        filters: dict,
        expected_count: int,
    ):
        result = await store_manager.list_stores(db_session, **filters)
        assert result.total == expected_count
        assert len(result.items) == expected_count

    async def test_list_by_category_id(self, db_session: AsyncSession, sample_stores):
        _, category_a, _ = sample_stores
        result = await store_manager.list_stores(db_session, category_id=category_a)
        assert result.total == 2

    async def test_list_pagination(self, db_session: AsyncSession):
        for i in range(5):
            await store_manager.create_store(db_session, StoreCreate(name=f"Store {i}"))
        result = await store_manager.list_stores(db_session, page=2, page_size=2)
        assert len(result.items) == 2
        assert result.total == 5

    async def test_list_excludes_soft_deleted(self, db_session: AsyncSession):
        store = await store_manager.create_store(db_session, StoreCreate(name="To Delete"))
        await store_manager.delete_store(db_session, store.id)
        result = await store_manager.list_stores(db_session)
        names = [item.name for item in result.items]
        assert "To Delete" not in names


class TestStoreManagerGet:
    async def test_get_existing_store(self, db_session: AsyncSession):
        created = await store_manager.create_store(db_session, StoreCreate(name="Getable Store", address="123 Main St"))
        fetched = await store_manager.get_store(db_session, created.id)
        assert fetched is not None
        assert fetched.id == created.id
        assert fetched.name == "Getable Store"
        assert fetched.address == "123 Main St"

    async def test_get_nonexistent_store_returns_none(self, db_session: AsyncSession):
        result = await store_manager.get_store(db_session, uuid.uuid4())
        assert result is None

    async def test_get_soft_deleted_returns_none(self, db_session: AsyncSession):
        store = await store_manager.create_store(db_session, StoreCreate(name="Gone Store"))
        await store_manager.delete_store(db_session, store.id)
        result = await store_manager.get_store(db_session, store.id)
        assert result is None


class TestStoreManagerCreate:
    async def test_create_store_persists_fields(self, db_session: AsyncSession):
        category = await _category_manager.create_category(db_session, CategoryCreate(name="Test Cat", slug="test-cat"))
        store = await store_manager.create_store(
            db_session,
            StoreCreate(
                name="Full Store",
                description="A full store",
                address="456 Side St",
                lat=40.7128,
                lng=-74.0060,
                category_id=category.id,
                image_url="https://example.com/img.png",
                is_active=True,
            ),
        )
        assert store.name == "Full Store"
        assert store.description == "A full store"
        assert store.address == "456 Side St"
        assert float(store.lat) == pytest.approx(40.7128, rel=1e-5)
        assert float(store.lng) == pytest.approx(-74.0060, rel=1e-5)
        assert store.category_id == category.id
        assert store.image_url == "https://example.com/img.png"
        assert store.is_active is True

    async def test_create_store_defaults_is_active_true(self, db_session: AsyncSession):
        store = await store_manager.create_store(db_session, StoreCreate(name="Default Active"))
        assert store.is_active is True


class TestStoreManagerUpdate:
    async def test_update_store_changes_fields(self, db_session: AsyncSession):
        store = await store_manager.create_store(db_session, StoreCreate(name="Original"))
        updated = await store_manager.update_store(db_session, store.id, StoreUpdate(name="Updated"))
        assert updated is not None
        assert updated.name == "Updated"

    async def test_update_store_nonexistent_returns_none(self, db_session: AsyncSession):
        result = await store_manager.update_store(db_session, uuid.uuid4(), StoreUpdate(name="Ghost"))
        assert result is None

    async def test_update_store_partial(self, db_session: AsyncSession):
        store = await store_manager.create_store(db_session, StoreCreate(name="Partial", description="Original desc"))
        updated = await store_manager.update_store(db_session, store.id, StoreUpdate(description="New desc"))
        assert updated is not None
        assert updated.name == "Partial"
        assert updated.description == "New desc"


class TestStoreManagerDelete:
    async def test_delete_sets_deleted_at(self, db_session: AsyncSession):
        store = await store_manager.create_store(db_session, StoreCreate(name="Deletable"))
        store_id = store.id
        result = await store_manager.delete_store(db_session, store_id)
        assert result is True
        raw = await db_session.execute(text("SELECT deleted_at FROM store WHERE id = :id"), {"id": str(store_id)})
        deleted_at = raw.scalar_one_or_none()
        assert deleted_at is not None

    async def test_delete_nonexistent_returns_false(self, db_session: AsyncSession):
        result = await store_manager.delete_store(db_session, uuid.uuid4())
        assert result is False

    async def test_deleted_store_excluded_from_get(self, db_session: AsyncSession):
        store = await store_manager.create_store(db_session, StoreCreate(name="Hidden"))
        await store_manager.delete_store(db_session, store.id)
        result = await store_manager.get_store(db_session, store.id)
        assert result is None
