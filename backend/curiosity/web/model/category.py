from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from curiosity.common.model.base import BaseModel

if TYPE_CHECKING:
    from curiosity.web.model.store import Store


class Category(BaseModel):
    __tablename__ = "category"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)

    stores: Mapped[list[Store]] = relationship("Store", back_populates="category", lazy="raise")
