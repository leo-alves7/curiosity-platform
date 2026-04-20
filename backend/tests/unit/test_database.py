import uuid
from datetime import UTC, datetime

import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from curiosity.common.database import get_async_db_session
from curiosity.common.model.base import BaseModel

pytestmark = pytest.mark.xdist_group("db")


class _TestItem(BaseModel):
    __tablename__ = "test_item"


class TestSoftDeleteFilter:
    async def test_active_record_is_returned(self, db_session: AsyncSession):
        item = _TestItem(id=uuid.uuid4())
        db_session.add(item)
        await db_session.flush()
        result = await db_session.execute(select(_TestItem).where(_TestItem.id == item.id))
        assert result.scalar_one_or_none() is not None

    async def test_soft_deleted_record_is_excluded(self, db_session: AsyncSession):
        item = _TestItem(id=uuid.uuid4())
        db_session.add(item)
        await db_session.flush()
        item.deleted_at = datetime.now(UTC)
        await db_session.flush()
        result = await db_session.execute(select(_TestItem).where(_TestItem.id == item.id))
        assert result.scalar_one_or_none() is None

    async def test_raw_sql_bypasses_filter(self, db_session: AsyncSession):
        item = _TestItem(id=uuid.uuid4())
        db_session.add(item)
        await db_session.flush()
        item.deleted_at = datetime.now(UTC)
        await db_session.flush()
        result = await db_session.execute(text("SELECT id FROM test_item WHERE id = :id"), {"id": str(item.id)})
        assert result.fetchone() is not None


class TestGetAsyncDbSession:
    async def test_dependency_yields_async_session(self):
        gen = get_async_db_session()
        session = await gen.__anext__()
        assert isinstance(session, AsyncSession)
        try:
            await gen.aclose()
        except StopAsyncIteration:
            pass
