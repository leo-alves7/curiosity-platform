import pytest
from httpx import ASGITransport, AsyncClient

from curiosity.web.main import app


@pytest.fixture
async def api_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
