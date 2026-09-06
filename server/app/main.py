import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import logger, RequestLoggingMiddleware
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create demo user. Shutdown: cleanup."""
    try:
        from app.auth.service import ensure_demo_user
        ensure_demo_user()
    except Exception as e:
        logger.warning(f"[STARTUP] Demo user creation skipped: {e}")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Dev Dynasty — SIH267107: AI-Powered Intelligent Assistant for Indian Standards and BIS Services.",
    lifespan=lifespan
)

# Request Logging and Latency Tracker
app.add_middleware(RequestLoggingMiddleware)

# CORS Configuration — supports local dev + Vercel + custom domains
allowed_origins = [
    settings.CLIENT_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Allow any Vercel preview/production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/api/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint verifying system vitality, environment status,
    and provider readiness without exposing any sensitive credentials.
    """
    return {
        "status": "ok",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "problem_statement": settings.SIH_PROBLEM_ID,
        "environment": settings.ENVIRONMENT,
        "demo_data_notice": settings.DEMO_DATA_NOTICE,
        "providers": {
            "gemini_configured": settings.is_gemini_configured,
            "supabase_configured": settings.is_supabase_configured,
            "embedding_dimension": settings.EMBEDDING_DIMENSION
        }
    }


# Centralized Global Exception Handler (Never exposes stack traces)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your BIS request."
        }
    )


# Mount API v1 Router
app.include_router(api_v1_router)
