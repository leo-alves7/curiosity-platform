import uuid
from datetime import datetime

from sqlalchemy import DateTime, event, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, with_loader_criteria


class Base(DeclarativeBase):
    pass


class BaseModel(Base):
    __abstract__ = True

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


@event.listens_for(Session, "do_orm_execute")
def _auto_filter_deleted(execute_state):
    if execute_state.is_select and not execute_state.is_column_load and not execute_state.is_relationship_load:
        execute_state.statement = execute_state.statement.options(
            with_loader_criteria(
                BaseModel,
                lambda cls: cls.deleted_at.is_(None),
                include_aliases=True,
            )
        )
