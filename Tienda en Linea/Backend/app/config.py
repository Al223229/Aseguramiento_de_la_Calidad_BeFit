from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "BeFit API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False

    DATABASE_URL: str = "sqlite:///./befit.db"

    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = ""

    TAX_RATE: float = 0.16

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    APP_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, value):
        if isinstance(value, str):
            raw = value.strip()
            if raw.startswith("["):
                import json

                return json.loads(raw)
            return [item.strip() for item in raw.split(",") if item.strip()]
        return value


settings = Settings()
