import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from curiosity.web.schemas.store import StoreResponse


class CategoryCreate(BaseModel):
    name: str
    slug: str
    icon: str | None = None
    color: str | None = None


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    icon: str | None = None
    color: str | None = None


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    icon: str | None = None
    color: str | None = None
    created_at: datetime
    updated_at: datetime
    stores: list[StoreResponse] = []


class CategoryListResponse(BaseModel):
    items: list[CategoryResponse]
    total: int
    page: int
    page_size: int
