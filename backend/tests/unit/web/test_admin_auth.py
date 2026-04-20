from unittest.mock import patch

import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient

from curiosity.web.dependencies.admin import require_admin
from curiosity.web.main import app
from curiosity.web.schemas.auth import UserContext


@pytest.fixture
async def http_client():
    with patch("curiosity.web.services.firebase.firebase_service.initialize"):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            yield client


class TestAdminRoleClaim:
    async def test_token_with_admin_role_sets_is_admin_true(self, http_client):
        decoded = {"uid": "admin-1", "email": "admin@example.com", "role": "admin"}
        with patch("curiosity.web.services.firebase.firebase_service.verify_token", return_value=decoded):
            response = await http_client.get("/me", headers={"Authorization": "Bearer token"})
        assert response.status_code == 200
        assert response.json()["is_admin"] is True

    async def test_token_without_role_claim_sets_is_admin_false(self, http_client):
        decoded = {"uid": "user-1", "email": "user@example.com"}
        with patch("curiosity.web.services.firebase.firebase_service.verify_token", return_value=decoded):
            response = await http_client.get("/me", headers={"Authorization": "Bearer token"})
        assert response.status_code == 200
        assert response.json()["is_admin"] is False

    async def test_token_with_non_admin_role_sets_is_admin_false(self, http_client):
        decoded = {"uid": "user-2", "email": "user@example.com", "role": "editor"}
        with patch("curiosity.web.services.firebase.firebase_service.verify_token", return_value=decoded):
            response = await http_client.get("/me", headers={"Authorization": "Bearer token"})
        assert response.status_code == 200
        assert response.json()["is_admin"] is False


class TestRequireAdmin:
    async def test_admin_user_passes(self):
        admin_user = UserContext(uid="admin-1", email="admin@example.com", is_admin=True)
        result = await require_admin(admin_user)
        assert result == admin_user

    async def test_non_admin_user_raises_403(self):
        regular_user = UserContext(uid="user-1", email="user@example.com", is_admin=False)
        with pytest.raises(HTTPException) as exc_info:
            await require_admin(regular_user)
        assert exc_info.value.status_code == 403

    async def test_require_admin_returns_user_context(self):
        admin_user = UserContext(uid="admin-2", email="admin2@example.com", is_admin=True)
        result = await require_admin(admin_user)
        assert result.uid == "admin-2"
        assert result.is_admin is True
