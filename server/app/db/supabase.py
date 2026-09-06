from typing import Optional
from supabase import create_client, Client, ClientOptions
from app.core.config import settings
from app.core.logging import logger

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Returns the Supabase Client if configured.
    If credentials are missing, returns None, allowing repositories
    to seamlessly fall back to the safe local demo provider.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if settings.is_supabase_configured:
        try:
            options = ClientOptions(postgrest_client_timeout=6.0)
            _supabase_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY,
                options=options
            )
            logger.info("Supabase client initialized successfully.")
            return _supabase_client
        except Exception as exc:
            logger.warning(f"Failed to initialize Supabase client: {exc}. Operating in local demo mode.")
            return None
    else:
        logger.info("Supabase credentials not configured in environment. Operating in local demo mode.")
        return None
