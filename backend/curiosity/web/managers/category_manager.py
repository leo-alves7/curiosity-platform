import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from curiosity.web.model.category import Category
from curiosity.web.schemas.category import CategoryCreate, CategoryListResponse, CategoryResponse, CategoryUpdate


class CategoryManager:
    async def list_categories(
        self,
        session: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
    ) -> CategoryListResponse:
        count_stmt = select(func.count()).select_from(Category)
        total_result = await session.execute(count_stmt)
        total = total_result.scalar_one()

        paginated_stmt = (
            select(Category).options(selectinload(Category.stores)).offset((page - 1) * page_size).limit(page_size)
        )
        rows_result = await session.execute(paginated_stmt)
        rows = rows_result.scalars().all()

        return CategoryListResponse(
            items=[CategoryResponse.model_validate(r) for r in rows],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_category(self, session: AsyncSession, category_id: uuid.UUID) -> Category | None:
        result = await session.execute(
            select(Category).where(Category.id == category_id).options(selectinload(Category.stores))
        )
        return result.scalar_one_or_none()

    async def create_category(self, session: AsyncSession, data: CategoryCreate) -> Category:
        category = Category(**data.model_dump())
        session.add(category)
        await session.flush()
        await session.refresh(category)
        return category

    async def update_category(
        self, session: AsyncSession, category_id: uuid.UUID, data: CategoryUpdate
    ) -> Category | None:
        result = await session.execute(select(Category).where(Category.id == category_id))
        category = result.scalar_one_or_none()
        if category is None:
            return None
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(category, key, value)
        await session.flush()
        result = await session.execute(
            select(Category).where(Category.id == category_id).options(selectinload(Category.stores))
        )
        return result.scalar_one()

    async def delete_category(self, session: AsyncSession, category_id: uuid.UUID) -> bool:
        result = await session.execute(select(Category).where(Category.id == category_id))
        category = result.scalar_one_or_none()
        if category is None:
            return False
        category.deleted_at = datetime.now(UTC)
        await session.flush()
        return True


category_manager = CategoryManager()
