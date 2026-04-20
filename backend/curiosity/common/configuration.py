from pydantic_settings import BaseSettings, SettingsConfigDict


class CuriositySettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://curiosity:curiosity@localhost:5432/curiosity"
    redis_url: str = "redis://localhost:6379/0"
    firebase_project_id: str = "curiosity-platform"
    debug: bool = False
    app_title: str = "Curiosity Platform"
    app_version: str = "0.1.0"
    cors_origins: list[str] = ["*"]


settings = CuriositySettings()
