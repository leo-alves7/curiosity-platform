from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from curiosity.common.database import get_async_db_session

DbSession = Annotated[AsyncSession, Depends(get_async_db_session)]
