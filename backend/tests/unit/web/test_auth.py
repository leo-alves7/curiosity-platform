from unittest.mock import patch

import pytest
from httpx import ASGITransport, AsyncClient

from curiosity.web.dependencies.auth import get_current_user
from curiosity.web.main import app
from curiosity.web.schemas.auth import UserContext


@pytest.fixture
async def auth_client():
    with patch("curiosity.web.services.firebase.firebase_service.initialize"):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            yield client


class TestGetCurrentUser:
    async def test_missing_authorization_header_returns_401(self, auth_client):
        response = await auth_client.get("/me")
        assert response.status_code == 401

    async def test_invalid_bearer_token_returns_401(self, auth_client):
        with patch(
            "curiosity.web.services.firebase.firebase_service.verify_token",
            side_effect=Exception("bad token"),
        ):
            response = await auth_client.get("/me", headers={"Authorization": "Bearer invalidtoken"})
        assert response.status_code == 401

    async def test_expired_token_returns_401(self, auth_client):
        with patch(
            "curiosity.web.services.firebase.firebase_service.verify_token",
            side_effect=Exception("Token expired"),
        ):
            response = await auth_client.get("/me", headers={"Authorization": "Bearer expiredtoken"})
        assert response.status_code == 401

    async def test_valid_token_returns_200_and_user_context(self, auth_client):
        async def _fake_user() -> UserContext:
            return UserContext(uid="user-123", email="test@example.com")

        app.dependency_overrides[get_current_user] = _fake_user
        try:
            response = await auth_client.get("/me", headers={"Authorization": "Bearer validtoken"})
        finally:
            app.dependency_overrides.pop(get_current_user, None)

        assert response.status_code == 200
        data = response.json()
        assert data["uid"] == "user-123"
        assert data["email"] == "test@example.com"

    async def test_token_without_email_returns_null_email(self, auth_client):
        with patch(
            "curiosity.web.services.firebase.firebase_service.verify_token",
            return_value={"uid": "user-456"},
        ):
            response = await auth_client.get("/me", headers={"Authorization": "Bearer sometoken"})
        assert response.status_code == 200
        assert response.json()["email"] is None

    async def test_health_endpoint_does_not_require_token(self, auth_client):
        response = await auth_client.get("/health")
        assert response.status_code == 200


class TestUserContext:
    def test_user_context_email_optional(self):
        ctx = UserContext(uid="abc")
        assert ctx.email is None
