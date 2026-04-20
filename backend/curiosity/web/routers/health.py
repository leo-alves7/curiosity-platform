from fastapi import APIRouter

health_router = APIRouter()


@health_router.get("/health")
async def handle_health_check() -> dict[str, str]:
    return {"status": "ok"}
