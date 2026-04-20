from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakError

from curiosity.web.schemas.auth import UserContext
from curiosity.web.services.keycloak import keycloak_service

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
        payload: dict[str, Any] = keycloak_service.keycloak_openid.decode_token(
            token,
            key=keycloak_service.cached_key,
        )
    except (KeycloakAuthenticationError, KeycloakError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or malformed token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    realm_roles: list[str] = (payload.get("realm_access") or {}).get("roles", [])
    return UserContext(
        sub=payload["sub"],
        email=payload.get("email"),
        preferred_username=payload.get("preferred_username"),
        roles=realm_roles,
    )


CurrentUser = Annotated[UserContext, Depends(get_current_user)]
