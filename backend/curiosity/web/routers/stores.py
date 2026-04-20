import uuid

from fastapi import APIRouter, HTTPException, status

from curiosity.web.dependencies import CurrentUser, DbSession
from curiosity.web.managers.store_manager import store_manager
from curiosity.web.schemas.store import StoreCreate, StoreListResponse, StoreResponse, StoreUpdate

stores_router = APIRouter(prefix="/stores", tags=["stores"])


@stores_router.get("", response_model=StoreListResponse)
async def handle_list_stores(
    session: DbSession,
    page: int = 1,
    page_size: int = 20,
    category_id: uuid.UUID | None = None,
    is_active: bool | None = None,
    search: str | None = None,
) -> StoreListResponse:
    return await store_manager.list_stores(
        session,
        page=page,
        page_size=page_size,
        category_id=category_id,
        is_active=is_active,
        search=search,
    )


@stores_router.post("", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
async def handle_create_store(
    data: StoreCreate,
    session: DbSession,
    current_user: CurrentUser,
) -> StoreResponse:
    store = await store_manager.create_store(session, data)
    return StoreResponse.model_validate(store)


@stores_router.get("/{store_id}", response_model=StoreResponse)
async def handle_get_store(store_id: uuid.UUID, session: DbSession) -> StoreResponse:
    store = await store_manager.get_store(session, store_id)
    if store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found.")
    return StoreResponse.model_validate(store)


@stores_router.put("/{store_id}", response_model=StoreResponse)
async def handle_update_store(
    store_id: uuid.UUID,
    data: StoreUpdate,
    session: DbSession,
    current_user: CurrentUser,
) -> StoreResponse:
    store = await store_manager.update_store(session, store_id, data)
    if store is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found.")
    return StoreResponse.model_validate(store)


@stores_router.delete("/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
async def handle_delete_store(
    store_id: uuid.UUID,
    session: DbSession,
    current_user: CurrentUser,
) -> None:
    deleted = await store_manager.delete_store(session, store_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found.")
