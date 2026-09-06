"""
FastAPI dependency for JWT authentication.
"""
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from app.auth.service import decode_jwt_token

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    """Extract and validate JWT token. Returns user payload or raises 401."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    payload = decode_jwt_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return {"id": payload["sub"], "email": payload["email"]}


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[Dict[str, Any]]:
    """Extract JWT token if present, but don't require it."""
    if not credentials:
        return None

    payload = decode_jwt_token(credentials.credentials)
    if not payload:
        return None

    return {"id": payload["sub"], "email": payload["email"]}
