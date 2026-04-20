import uuid

from fastapi import APIRouter, HTTPException, status

from curiosity.web.dependencies import CurrentUser, DbSession
from curiosity.web.managers.category_manager import category_manager
from curiosity.web.schemas.category import CategoryCreate, CategoryListResponse, CategoryResponse, CategoryUpdate

categories_router = APIRouter(prefix="/categories", tags=["categories"])


@categories_router.get("", response_model=CategoryListResponse)
async def handle_list_categories(
    session: DbSession,
    page: int = 1,
    page_size: int = 20,
) -> CategoryListResponse:
    return await category_manager.list_categories(session, page=page, page_size=page_size)


@categories_router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def handle_create_category(
    data: CategoryCreate,
    session: DbSession,
    current_user: CurrentUser,
) -> CategoryResponse:
    category = await category_manager.create_category(session, data)
    return CategoryResponse.model_validate(category)


@categories_router.get("/{category_id}", response_model=CategoryResponse)
async def handle_get_category(category_id: uuid.UUID, session: DbSession) -> CategoryResponse:
    category = await category_manager.get_category(session, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
    return CategoryResponse.model_validate(category)


@categories_router.put("/{category_id}", response_model=CategoryResponse)
async def handle_update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    session: DbSession,
    current_user: CurrentUser,
) -> CategoryResponse:
    category = await category_manager.update_category(session, category_id, data)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
    return CategoryResponse.model_validate(category)


@categories_router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def handle_delete_category(
    category_id: uuid.UUID,
    session: DbSession,
    current_user: CurrentUser,
) -> None:
    deleted = await category_manager.delete_category(session, category_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
