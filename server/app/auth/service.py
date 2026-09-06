"""
Auth service: JWT token management, password hashing, Brevo email verification.
"""
import random
import string
import jwt
import httpx
import bcrypt as _bcrypt
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import logger
from app.db.supabase import get_supabase_client


def hash_password(password: str) -> str:
    hashed = _bcrypt.hashpw(password.encode("utf-8"), _bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return _bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def send_verification_email(email: str, otp: str) -> bool:
    """Send OTP via Brevo transactional email API."""
    if not settings.BREVO_API_KEY:
        logger.info(f"[AUTH] Brevo not configured. OTP for {email}: {otp}")
        return True  # Demo mode — skip email

    try:
        response = httpx.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={
                "api-key": settings.BREVO_API_KEY,
                "Content-Type": "application/json"
            },
            json={
                "sender": {"name": "Dev Dynasty BIS Assistant", "email": "noreply@devdynasty.bis"},
                "to": [{"email": email}],
                "subject": "BIS Intelligence Assistant — Email Verification Code",
                "htmlContent": f"""
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1e40af;">Dev Dynasty — BIS Intelligence Assistant</h2>
                    <p>Your email verification code is:</p>
                    <div style="background: #1e293b; color: #60a5fa; font-size: 32px; padding: 16px 24px; border-radius: 8px; text-align: center; letter-spacing: 8px; font-weight: bold;">
                        {otp}
                    </div>
                    <p style="margin-top: 16px; color: #64748b; font-size: 14px;">
                        This code expires in 10 minutes. If you didn't request this, please ignore this email.
                    </p>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">SIH267107 • Smart India Hackathon</p>
                </div>
                """
            },
            timeout=10.0
        )
        if response.status_code in (200, 201):
            logger.info(f"[AUTH] Verification email sent to {email}")
            return True
        else:
            logger.warning(f"[AUTH] Brevo API error {response.status_code}: {response.text}")
            return False
    except Exception as e:
        logger.warning(f"[AUTH] Failed to send email: {e}")
        return False


def ensure_demo_user():
    """Create the demo user if it doesn't exist."""
    supabase = get_supabase_client()
    if not supabase:
        return

    try:
        existing = supabase.table("app_users").select("id").eq("email", settings.DEMO_USER_EMAIL).execute()
        if not existing.data:
            supabase.table("app_users").insert({
                "email": settings.DEMO_USER_EMAIL,
                "password_hash": hash_password(settings.DEMO_USER_PASSWORD),
                "name": "Demo User",
                "is_verified": True,
                "verification_code": None
            }).execute()
            logger.info(f"[AUTH] Demo user created: {settings.DEMO_USER_EMAIL}")
        else:
            logger.info(f"[AUTH] Demo user already exists: {settings.DEMO_USER_EMAIL}")
    except Exception as e:
        logger.warning(f"[AUTH] Error ensuring demo user: {e}")
