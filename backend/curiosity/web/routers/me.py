from fastapi import APIRouter

from curiosity.web.dependencies import CurrentUser

me_router = APIRouter(prefix="/me", tags=["me"])


@me_router.get("")
async def handle_get_me(current_user: CurrentUser) -> dict:
    return {
        "sub": current_user.sub,
        "email": current_user.email,
        "preferred_username": current_user.preferred_username,
        "roles": current_user.roles,
    }
