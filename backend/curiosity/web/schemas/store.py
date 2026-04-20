import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StoreCreate(BaseModel):
    name: str
    description: str | None = None
    address: str | None = None
    lat: float | None = None
    lng: float | None = None
    category_id: uuid.UUID | None = None
    image_url: str | None = None
    is_active: bool = True


class StoreUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    address: str | None = None
    lat: float | None = None
    lng: float | None = None
    category_id: uuid.UUID | None = None
    image_url: str | None = None
    is_active: bool | None = None


class StoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None = None
    address: str | None = None
    lat: float | None = None
    lng: float | None = None
    category_id: uuid.UUID | None = None
    image_url: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class StoreListResponse(BaseModel):
    items: list[StoreResponse]
    total: int
    page: int
    page_size: int
