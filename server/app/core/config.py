from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CLIENT_URL: str = "http://localhost:3000"

    # AI Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Embedding model and dimension (using models/gemini-embedding-001 with 768 dim)
    EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    EMBEDDING_DIMENSION: int = 768

    # Supabase Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None

    # App Metadata
    APP_NAME: str = "Dev Dynasty - BIS Intelligence Assistant"
    APP_VERSION: str = "1.0.0"
    SIH_PROBLEM_ID: str = "SIH267107"

    # Strict Demo Flag
    DEMO_DATA_NOTICE: str = "Demo / Sample / Not official"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def is_supabase_configured(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_SERVICE_ROLE_KEY)

    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY)


settings = Settings()
