from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

from curiosity.common.configuration import settings
from curiosity.web.routers.categories import categories_router
from curiosity.web.routers.health import health_router
from curiosity.web.routers.me import me_router
from curiosity.web.routers.stores import admin_stores_router, stores_router
from curiosity.web.services.firebase import firebase_service


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    firebase_service.initialize()
    yield


def create_app() -> FastAPI:
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            integrations=[StarletteIntegration(), FastApiIntegration()],
            traces_sample_rate=0.1,
            send_default_pii=False,
        )
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
    app.include_router(admin_stores_router, prefix="/api/v1")
    app.include_router(categories_router, prefix="/api/v1")
    return app


app = create_app()
