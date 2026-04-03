from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://paiploy:changeme@postgres:5432/paiploy"

    SECRET_KEY: str = "changeme-generate-strong-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_CONNECT_CLIENT_ID: str = ""
    STRIPE_PRICE_ID_PRO: str = ""
    STRIPE_PRICE_ID_BUSINESS: str = ""
    FRONTEND_URL: str = "https://paiploy.com"
    BACKEND_URL: str = "https://paiploy.com"

    # Resend for transactional email
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@paiploy.com"
    FROM_NAME: str = "Paiploy"

    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"

    ENVIRONMENT: str = "production"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
