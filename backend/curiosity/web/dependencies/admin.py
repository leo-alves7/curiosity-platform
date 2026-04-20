from fastapi import HTTPException, status

from curiosity.web.dependencies.auth import CurrentUser
from curiosity.web.schemas.auth import UserContext


async def require_admin(current_user: CurrentUser) -> UserContext:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user
