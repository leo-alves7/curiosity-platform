from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from curiosity.common.configuration import settings
from curiosity.web.routers.categories import categories_router
from curiosity.web.routers.health import health_router
from curiosity.web.routers.me import me_router
from curiosity.web.routers.stores import stores_router
from curiosity.web.services.firebase import firebase_service


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    firebase_service.initialize()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_title,
        version=settings.app_version,
        debug=settings.debug,
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router)
    app.include_router(me_router)
    app.include_router(stores_router, prefix="/api/v1")
    app.include_router(categories_router, prefix="/api/v1")
    return app


app = create_app()
