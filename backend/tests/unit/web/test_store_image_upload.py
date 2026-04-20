import uuid
from datetime import UTC, datetime
from io import BytesIO
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from curiosity.web.dependencies.auth import get_current_user
from curiosity.web.main import app
from curiosity.web.schemas.auth import UserContext


@pytest.fixture
def admin_user():
    return UserContext(uid="admin-1", email="admin@example.com", is_admin=True)


@pytest.fixture
def regular_user():
    return UserContext(uid="user-1", email="user@example.com", is_admin=False)


@pytest.fixture
async def http_client():
    with patch("curiosity.web.services.firebase.firebase_service.initialize"):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            yield client


def _make_store(store_id: uuid.UUID | None = None, image_url: str | None = None) -> SimpleNamespace:
    return SimpleNamespace(
        id=store_id or uuid.uuid4(),
        name="Test Store",
        description=None,
        address=None,
        lat=None,
        lng=None,
        category_id=None,
        image_url=image_url,
        is_active=True,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )


class TestStoreImageUpload:
    async def test_upload_requires_admin(self, http_client, regular_user):
        async def _regular() -> UserContext:
            return regular_user

        app.dependency_overrides[get_current_user] = _regular
        try:
            response = await http_client.post(
                f"/api/v1/stores/{uuid.uuid4()}/image",
                files={"file": ("test.png", BytesIO(b"fake-image-data"), "image/png")},
            )
        finally:
            app.dependency_overrides.pop(get_current_user, None)

        assert response.status_code == 403

    async def test_upload_succeeds_for_admin(self, http_client, admin_user):
        store_id = uuid.uuid4()
        fake_url = f"http://localhost:9000/curiosity/stores/{store_id}/123_test.png"
        store = _make_store(store_id)
        updated_store = _make_store(store_id, image_url=fake_url)

        async def _admin() -> UserContext:
            return admin_user

        with (
            patch(
                "curiosity.web.managers.store_manager.store_manager.get_store",
                new_callable=AsyncMock,
                return_value=store,
            ),
            patch(
                "curiosity.web.managers.store_manager.minio_service.upload_file",
                new_callable=AsyncMock,
                return_value=fake_url,
            ),
            patch(
                "curiosity.web.managers.store_manager.store_manager.update_store",
                new_callable=AsyncMock,
                return_value=updated_store,
            ),
        ):
            app.dependency_overrides[get_current_user] = _admin
            try:
                response = await http_client.post(
                    f"/api/v1/stores/{store_id}/image",
                    files={"file": ("test.png", BytesIO(b"fake-image-data"), "image/png")},
                )
            finally:
                app.dependency_overrides.pop(get_current_user, None)

        assert response.status_code == 200
        assert response.json()["image_url"] == fake_url

    async def test_upload_returns_404_for_missing_store(self, http_client, admin_user):
        async def _admin() -> UserContext:
            return admin_user

        with patch(
            "curiosity.web.managers.store_manager.store_manager.get_store",
            new_callable=AsyncMock,
            return_value=None,
        ):
            app.dependency_overrides[get_current_user] = _admin
            try:
                response = await http_client.post(
                    f"/api/v1/stores/{uuid.uuid4()}/image",
                    files={"file": ("test.png", BytesIO(b"data"), "image/png")},
                )
            finally:
                app.dependency_overrides.pop(get_current_user, None)

        assert response.status_code == 404

    async def test_upload_returns_400_for_empty_file(self, http_client, admin_user):
        store = _make_store()

        async def _admin() -> UserContext:
            return admin_user

        with patch(
            "curiosity.web.managers.store_manager.store_manager.get_store",
            new_callable=AsyncMock,
            return_value=store,
        ):
            app.dependency_overrides[get_current_user] = _admin
            try:
                response = await http_client.post(
                    f"/api/v1/stores/{store.id}/image",
                    files={"file": ("empty.png", BytesIO(b""), "image/png")},
                )
            finally:
                app.dependency_overrides.pop(get_current_user, None)

        assert response.status_code == 400
