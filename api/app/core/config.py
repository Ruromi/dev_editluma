from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Supabase
    supabase_url: str
    supabase_service_role_key: str  # server-only
    supabase_schema: str = "dev"

    # S3-compatible storage
    storage_endpoint_url: str = ""
    storage_bucket: str = "editluma-uploads"
    storage_access_key: str = ""
    storage_secret_key: str = ""
    storage_region: str = "ap-northeast-2"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # Ideogram
    ideogram_api_key: str = ""
    ideogram_model: str = "V_2"

    # App
    environment: str = "dev"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]
    presign_upload_expiry_seconds: int = 300
    presign_download_expiry_seconds: int = 3600


settings = Settings()
