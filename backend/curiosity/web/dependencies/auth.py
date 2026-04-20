from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from curiosity.web.schemas.auth import UserContext
from curiosity.web.services.firebase import firebase_service

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> UserContext:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        decoded: dict[str, Any] = firebase_service.verify_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or malformed token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    is_admin = decoded.get("role") == "admin"
    return UserContext(uid=decoded["uid"], email=decoded.get("email"), is_admin=is_admin)


CurrentUser = Annotated[UserContext, Depends(get_current_user)]
