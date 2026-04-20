from pydantic_settings import BaseSettings, SettingsConfigDict


class CuriositySettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://curiosity:curiosity@localhost:5432/curiosity"
    redis_url: str = "redis://localhost:6379/0"
    firebase_project_id: str = "curiosity-platform"
    firebase_credentials_path: str | None = None
    debug: bool = False
    app_title: str = "Curiosity Platform"
    app_version: str = "0.1.0"
    cors_origins: list[str] = ["*"]
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "curiosity"
    minio_url_base: str = "http://localhost:9000/curiosity"


settings = CuriositySettings()
