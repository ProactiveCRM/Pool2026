-- Migration: 004_admin_users
-- Creates the admin_users table for role-based access control
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index
CREATE INDEX IF NOT EXISTS idx_admin_users_user ON admin_users(user_id);