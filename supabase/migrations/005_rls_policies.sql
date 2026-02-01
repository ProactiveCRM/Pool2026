-- Migration: 005_rls_policies
-- Row Level Security policies for all tables
-- Enable RLS on all tables
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- Helper function: Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM admin_users
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Helper function: Check if current user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM admin_users
        WHERE user_id = auth.uid()
            AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================
-- VENUES POLICIES
-- ============================================
-- Anyone can view active venues (public directory)
DROP POLICY IF EXISTS "Venues are viewable by everyone" ON venues;
CREATE POLICY "Venues are viewable by everyone" ON venues FOR
SELECT USING (is_active = true);
-- Admins can view all venues (including inactive)
DROP POLICY IF EXISTS "Admins can view all venues" ON venues;
CREATE POLICY "Admins can view all venues" ON venues FOR
SELECT USING (is_admin());
-- Admins can insert venues
DROP POLICY IF EXISTS "Admins can insert venues" ON venues;
CREATE POLICY "Admins can insert venues" ON venues FOR
INSERT WITH CHECK (is_admin());
-- Admins can update any venue
DROP POLICY IF EXISTS "Admins can update venues" ON venues;
CREATE POLICY "Admins can update venues" ON venues FOR
UPDATE USING (is_admin());
-- Venue owners can update their claimed venues
DROP POLICY IF EXISTS "Owners can update their venues" ON venues;
CREATE POLICY "Owners can update their venues" ON venues FOR
UPDATE USING (claimed_by = auth.uid());
-- Admins can delete venues
DROP POLICY IF EXISTS "Admins can delete venues" ON venues;
CREATE POLICY "Admins can delete venues" ON venues FOR DELETE USING (is_admin());
-- ============================================
-- CLAIMS POLICIES
-- ============================================
-- Users can view their own claims
DROP POLICY IF EXISTS "Users can view own claims" ON claims;
CREATE POLICY "Users can view own claims" ON claims FOR
SELECT USING (user_id = auth.uid());
-- Admins can view all claims
DROP POLICY IF EXISTS "Admins can view all claims" ON claims;
CREATE POLICY "Admins can view all claims" ON claims FOR
SELECT USING (is_admin());
-- Authenticated users can create claims
DROP POLICY IF EXISTS "Users can create claims" ON claims;
CREATE POLICY "Users can create claims" ON claims FOR
INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
    );
-- Admins can update claims (approve/reject)
DROP POLICY IF EXISTS "Admins can update claims" ON claims;
CREATE POLICY "Admins can update claims" ON claims FOR
UPDATE USING (is_admin());
-- ============================================
-- LEADS POLICIES
-- ============================================
-- Anyone can create leads (public inquiry form)
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
CREATE POLICY "Anyone can create leads" ON leads FOR
INSERT WITH CHECK (true);
-- Venue owners can view leads for their venues
DROP POLICY IF EXISTS "Venue owners can view their leads" ON leads;
CREATE POLICY "Venue owners can view their leads" ON leads FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM venues
            WHERE venues.id = leads.venue_id
                AND venues.claimed_by = auth.uid()
        )
    );
-- Admins can view all leads
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;
CREATE POLICY "Admins can view all leads" ON leads FOR
SELECT USING (is_admin());
-- Admins can update leads (mark as read)
DROP POLICY IF EXISTS "Admins can update leads" ON leads;
CREATE POLICY "Admins can update leads" ON leads FOR
UPDATE USING (is_admin());
-- Venue owners can update leads for their venues
DROP POLICY IF EXISTS "Venue owners can update their leads" ON leads;
CREATE POLICY "Venue owners can update their leads" ON leads FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM venues
            WHERE venues.id = leads.venue_id
                AND venues.claimed_by = auth.uid()
        )
    );
-- ============================================
-- ADMIN_USERS POLICIES
-- ============================================
-- Admins can view the admin list
DROP POLICY IF EXISTS "Admins can view admin list" ON admin_users;
CREATE POLICY "Admins can view admin list" ON admin_users FOR
SELECT USING (is_admin());
-- Only super admins can manage admin users
DROP POLICY IF EXISTS "Super admins can insert admins" ON admin_users;
CREATE POLICY "Super admins can insert admins" ON admin_users FOR
INSERT WITH CHECK (is_super_admin());
DROP POLICY IF EXISTS "Super admins can update admins" ON admin_users;
CREATE POLICY "Super admins can update admins" ON admin_users FOR
UPDATE USING (is_super_admin());
DROP POLICY IF EXISTS "Super admins can delete admins" ON admin_users;
CREATE POLICY "Super admins can delete admins" ON admin_users FOR DELETE USING (is_super_admin());