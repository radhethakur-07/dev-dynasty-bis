-- ============================================================
-- DEV DYNASTY — SIH267107: APP USERS TABLE SETUP
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
