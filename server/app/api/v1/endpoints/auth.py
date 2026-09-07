"""
Auth endpoints: register, verify, login, me
"""
import re
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from app.db.supabase import get_supabase_client
from app.auth.service import (
    hash_password, verify_password, create_jwt_token,
    generate_otp, send_verification_email
)
from app.auth.middleware import get_current_user
from app.core.config import settings
from app.core.logging import logger

router = APIRouter()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v.lower().strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class VerifyRequest(BaseModel):
    email: str
    code: str


class AuthResponse(BaseModel):
    token: str
    user: dict
    message: str


@router.post("/auth/register")
async def register(req: RegisterRequest):
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        existing = supabase.table("app_users").select("id").eq("email", req.email).execute()
        if existing.data:
            raise HTTPException(status_code=409, detail="Email already registered")

        otp = generate_otp()
        password_hash = hash_password(req.password)

        # If Brevo is not configured, auto-verify the user (demo mode)
        demo_mode = not settings.BREVO_API_KEY
        is_verified = demo_mode  # Auto-verify in demo mode

        supabase.table("app_users").insert({
            "email": req.email,
            "password_hash": password_hash,
            "name": req.name,
            "is_verified": is_verified,
            "verification_code": None if demo_mode else otp
        }).execute()

        if not demo_mode:
            send_verification_email(req.email, otp)

        return {
            "message": "Registration successful! You can now login." if demo_mode else "Registration successful. Please verify your email.",
            "email": req.email,
            "verified": demo_mode,
            "demo_mode": demo_mode
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AUTH] Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/auth/verify")
async def verify_email(req: VerifyRequest):
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        result = supabase.table("app_users").select("*").eq("email", req.email).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")

        user = result.data[0]

        if user.get("is_verified"):
            return {"message": "Email already verified", "verified": True}

        if user.get("verification_code") != req.code:
            raise HTTPException(status_code=400, detail="Invalid verification code")

        supabase.table("app_users").update({
            "is_verified": True,
            "verification_code": None
        }).eq("email", req.email).execute()

        return {"message": "Email verified successfully", "verified": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AUTH] Verification error: {e}")
        raise HTTPException(status_code=500, detail="Verification failed")


@router.post("/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    supabase = get_supabase_client()
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        email = req.email.lower().strip()
        result = supabase.table("app_users").select("*").eq("email", email).execute()
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user = result.data[0]

        if not verify_password(req.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not user.get("is_verified"):
            raise HTTPException(status_code=403, detail="Email not verified. Please check your email for the verification code.")

        token = create_jwt_token(user["id"], user["email"])

        return AuthResponse(
            token=token,
            user={
                "id": user["id"],
                "email": user["email"],
                "name": user.get("name", "")
            },
            message="Login successful"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AUTH] Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    if supabase:
        try:
            result = supabase.table("app_users").select("id, email, name, created_at").eq("id", current_user["id"]).execute()
            if result.data:
                return {"user": result.data[0]}
        except Exception:
            pass
    return {"user": current_user}
