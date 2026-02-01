-- Admin Users Migration
-- Run this after the previous migrations
-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id)
);
-- Leads table for venue inquiries
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE
    SET NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT,
        lead_type TEXT NOT NULL DEFAULT 'inquiry' CHECK (
            lead_type IN ('inquiry', 'booking', 'claim', 'partnership')
        ),
        status TEXT NOT NULL DEFAULT 'new' CHECK (
            status IN (
                'new',
                'contacted',
                'qualified',
                'converted',
                'closed'
            )
        ),
        assigned_to UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add is_admin field to profiles if not exists
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'is_admin'
) THEN
ALTER TABLE public.profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
END IF;
END $$;
-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_venue_id ON public.leads(venue_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
-- RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
-- Admin users policies
CREATE POLICY "Admin users can view admin_users" ON public.admin_users FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.admin_users au
            WHERE au.user_id = auth.uid()
        )
    );
-- Leads policies
CREATE POLICY "Admins can manage leads" ON public.leads FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.admin_users au
        WHERE au.user_id = auth.uid()
    )
);
-- Grant permissions
GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL ON public.leads TO authenticated;
-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE admin_users.user_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;