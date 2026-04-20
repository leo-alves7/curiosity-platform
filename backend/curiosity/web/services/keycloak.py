import asyncio
import logging

from jwcrypto import jwk  # type: ignore[import-untyped]
from keycloak import KeycloakOpenID  # type: ignore[import-untyped,attr-defined]

from curiosity.common.configuration import settings

logger = logging.getLogger(__name__)


class KeycloakPublicKeyService:
    """Fetches and caches the RS256 public key from Keycloak."""

    def __init__(self) -> None:
        self._cached_key: jwk.JWK | None = None
        self._keycloak = KeycloakOpenID(
            server_url=settings.keycloak_url,
            realm_name=settings.keycloak_realm,
            client_id=settings.keycloak_client_id,
        )

    async def initialize(self) -> None:
        logger.info("Fetching Keycloak public key for realm '%s'", settings.keycloak_realm)
        raw_key: str = await asyncio.to_thread(self._keycloak.public_key)
        pem = f"-----BEGIN PUBLIC KEY-----\n{raw_key}\n-----END PUBLIC KEY-----\n"
        self._cached_key = jwk.JWK.from_pem(pem.encode())
        logger.info("Keycloak public key cached successfully.")

    @property
    def cached_key(self) -> jwk.JWK:
        if self._cached_key is None:
            raise RuntimeError("KeycloakPublicKeyService has not been initialized.")
        return self._cached_key

    @property
    def keycloak_openid(self) -> KeycloakOpenID:
        return self._keycloak


keycloak_service = KeycloakPublicKeyService()
