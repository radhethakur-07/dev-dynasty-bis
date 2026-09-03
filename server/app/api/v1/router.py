from fastapi import APIRouter
from app.api.v1.endpoints import chat, standards, certification, hallmarking, laboratories

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(chat.router, tags=["Conversational Assistant"])
api_v1_router.include_router(standards.router, prefix="/standards", tags=["Standards Discovery"])
api_v1_router.include_router(certification.router, prefix="/certification", tags=["Certification Guidance"])
api_v1_router.include_router(hallmarking.router, prefix="/hallmarking", tags=["Hallmarking"])
api_v1_router.include_router(laboratories.router, prefix="/laboratories", tags=["Testing Laboratories"])
