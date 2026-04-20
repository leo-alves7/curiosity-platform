from fastapi import FastAPI

from curiosity.common.configuration import settings
from curiosity.web.routers.health import health_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_title,
        version=settings.app_version,
        debug=settings.debug,
    )
    app.include_router(health_router)
    return app


app = create_app()
