from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from curiosity.common.database import get_async_db_session
from curiosity.web.dependencies.auth import CurrentUser, get_current_user

DbSession = Annotated[AsyncSession, Depends(get_async_db_session)]

__all__ = ["CurrentUser", "DbSession", "get_current_user"]
