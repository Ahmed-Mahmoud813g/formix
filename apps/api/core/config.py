from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    APP_NAME: str = "Formix API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    SECRET_KEY: str = "dev-secret-key-change-this-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    DATABASE_URL: str = "postgresql+asyncpg://formix:formix@localhost:5432/formix"
    REDIS_URL: str = "redis://localhost:6379"
    
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASS: Optional[str] = None
    
    FRONTEND_URL: str = "http://localhost:3000"
    
    @property
    def cors_origins(self) -> List[str]:
        return [self.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
