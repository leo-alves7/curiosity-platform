from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from jwcrypto import jwk as jwk_module
from keycloak.exceptions import KeycloakAuthenticationError

from curiosity.web.dependencies.auth import get_current_user
from curiosity.web.main import app
from curiosity.web.schemas.auth import UserContext
from curiosity.web.services.keycloak import KeycloakPublicKeyService, keycloak_service


@pytest.fixture
async def auth_client():
    fake_key = MagicMock()
    with patch("curiosity.web.services.keycloak.keycloak_service.initialize", new_callable=AsyncMock):
        keycloak_service._cached_key = fake_key
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            yield client
        keycloak_service._cached_key = None


class TestGetCurrentUser:
    async def test_missing_authorization_header_returns_401(self, auth_client):
        response = await auth_client.get("/me")
        assert response.status_code == 401

    async def test_invalid_bearer_token_returns_401(self, auth_client):
        with patch.object(
            keycloak_service.keycloak_openid,
            "decode_token",
            side_effect=KeycloakAuthenticationError("bad token"),
        ):
            response = await auth_client.get("/me", headers={"Authorization": "Bearer invalidtoken"})
        assert response.status_code == 401

    async def test_expired_token_returns_401(self, auth_client):
        with patch.object(
            keycloak_service.keycloak_openid,
            "decode_token",
            side_effect=Exception("Token expired"),
        ):
            response = await auth_client.get("/me", headers={"Authorization": "Bearer expiredtoken"})
        assert response.status_code == 401

    async def test_valid_token_returns_200_and_user_context(self, auth_client):
        async def _fake_user() -> UserContext:
            return UserContext(
                sub="user-123",
                email="test@example.com",
                preferred_username="testuser",
                roles=["user"],
            )

        app.dependency_overrides[get_current_user] = _fake_user
        try:
            response = await auth_client.get("/me", headers={"Authorization": "Bearer validtoken"})
        finally:
            app.dependency_overrides.pop(get_current_user, None)

        assert response.status_code == 200
        data = response.json()
        assert data["sub"] == "user-123"
        assert data["email"] == "test@example.com"
        assert data["roles"] == ["user"]

    async def test_token_without_realm_access_returns_empty_roles(self, auth_client):
        with patch.object(
            keycloak_service.keycloak_openid,
            "decode_token",
            return_value={"sub": "user-456", "email": "other@example.com"},
        ):
            response = await auth_client.get("/me", headers={"Authorization": "Bearer sometoken"})
        assert response.status_code == 200
        assert response.json()["roles"] == []

    async def test_health_endpoint_does_not_require_token(self, auth_client):
        response = await auth_client.get("/health")
        assert response.status_code == 200


class TestKeycloakPublicKeyService:
    async def test_initialize_caches_jwk(self):
        test_jwk = jwk_module.JWK.generate(kty="RSA", size=2048)
        pem_bytes = test_jwk.export_to_pem(private_key=False, password=None)
        pem_str = pem_bytes.decode()
        raw_b64 = pem_str.replace("-----BEGIN PUBLIC KEY-----\n", "").replace("-----END PUBLIC KEY-----\n", "").strip()

        service = KeycloakPublicKeyService()
        with patch("asyncio.to_thread", new_callable=AsyncMock, return_value=raw_b64):
            await service.initialize()

        assert isinstance(service.cached_key, jwk_module.JWK)

    def test_cached_key_raises_before_initialize(self):
        service = KeycloakPublicKeyService()
        with pytest.raises(RuntimeError):
            _ = service.cached_key


class TestUserContext:
    def test_user_context_email_optional(self):
        ctx = UserContext(sub="abc")
        assert ctx.email is None
        assert ctx.roles == []
