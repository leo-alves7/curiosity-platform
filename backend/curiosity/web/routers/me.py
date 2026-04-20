from fastapi import APIRouter

from curiosity.web.dependencies import CurrentUser
from curiosity.web.schemas.auth import UserContext

me_router = APIRouter(prefix="/me", tags=["me"])


@me_router.get("")
async def handle_get_me(current_user: CurrentUser) -> UserContext:
    return current_user
