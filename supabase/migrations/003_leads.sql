-- Migration: 003_leads
-- Creates the leads table for venue inquiries
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    -- Contact info
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    -- Classification
    lead_type TEXT NOT NULL DEFAULT 'inquiry' CHECK (
        lead_type IN (
            'inquiry',
            'booking_interest',
            'event_inquiry',
            'other'
        )
    ),
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    -- External IDs (for GHL integration)
    ghl_contact_id TEXT,
    ghl_opportunity_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_venue ON leads(venue_id);
CREATE INDEX IF NOT EXISTS idx_leads_is_read ON leads(is_read);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);