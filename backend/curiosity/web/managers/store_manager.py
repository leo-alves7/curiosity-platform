import uuid
from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from curiosity.common.configuration import settings
from curiosity.web.model.store import Store
from curiosity.web.schemas.store import StoreCreate, StoreListResponse, StoreResponse, StoreUpdate
from curiosity.web.services.minio_service import minio_service


class StoreManager:
    async def list_stores(
        self,
        session: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
        category_id: uuid.UUID | None = None,
        is_active: bool | None = None,
        search: str | None = None,
    ) -> StoreListResponse:
        base_stmt = select(Store)
        count_stmt = select(func.count()).select_from(Store)

        if category_id is not None:
            base_stmt = base_stmt.where(Store.category_id == category_id)
            count_stmt = count_stmt.where(Store.category_id == category_id)
        if is_active is not None:
            base_stmt = base_stmt.where(Store.is_active == is_active)
            count_stmt = count_stmt.where(Store.is_active == is_active)
        if search is not None:
            base_stmt = base_stmt.where(Store.name.ilike(f"%{search}%"))
            count_stmt = count_stmt.where(Store.name.ilike(f"%{search}%"))

        total_result = await session.execute(count_stmt)
        total = total_result.scalar_one()

        paginated_stmt = base_stmt.offset((page - 1) * page_size).limit(page_size)
        rows_result = await session.execute(paginated_stmt)
        rows = rows_result.scalars().all()

        return StoreListResponse(
            items=[StoreResponse.model_validate(r) for r in rows],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_store(self, session: AsyncSession, store_id: uuid.UUID) -> Store | None:
        result = await session.execute(select(Store).where(Store.id == store_id))
        return result.scalar_one_or_none()

    async def create_store(self, session: AsyncSession, data: StoreCreate) -> Store:
        store = Store(**data.model_dump())
        session.add(store)
        try:
            await session.flush()
        except IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid category_id: referenced category does not exist.",
            ) from exc
        await session.refresh(store)
        return store

    async def update_store(self, session: AsyncSession, store_id: uuid.UUID, data: StoreUpdate) -> Store | None:
        store = await self.get_store(session, store_id)
        if store is None:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(store, key, value)
        try:
            await session.flush()
        except IntegrityError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid category_id: referenced category does not exist.",
            ) from exc
        await session.refresh(store)
        return store

    async def delete_store(self, session: AsyncSession, store_id: uuid.UUID) -> bool:
        store = await self.get_store(session, store_id)
        if store is None:
            return False
        store.deleted_at = datetime.now(UTC)
        await session.flush()
        return True

    async def toggle_active(self, session: AsyncSession, store_id: uuid.UUID) -> Store | None:
        store = await self.get_store(session, store_id)
        if store is None:
            return None
        store.is_active = not store.is_active
        await session.flush()
        await session.refresh(store)
        return store

    async def upload_store_image(self, file_content: bytes, store_id: uuid.UUID, filename: str) -> str:
        timestamp = int(datetime.now(UTC).timestamp())
        object_name = f"stores/{store_id}/{timestamp}_{filename}"
        return await minio_service.upload_file(file_content, settings.minio_bucket, object_name)


store_manager = StoreManager()
