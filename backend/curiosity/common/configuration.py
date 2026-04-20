from pydantic_settings import BaseSettings, SettingsConfigDict


class CuriositySettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql+asyncpg://curiosity:curiosity@localhost:5432/curiosity"
    redis_url: str = "redis://localhost:6379/0"
    keycloak_server_url: str = "http://localhost:8180"
    keycloak_realm: str = "curiosity"
    keycloak_client_id: str = "curiosity-backend"
    debug: bool = False
    app_title: str = "Curiosity Platform"
    app_version: str = "0.1.0"


settings = CuriositySettings()
