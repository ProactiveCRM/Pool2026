-- Migration: 016_notifications.sql
-- Email notifications and user preferences
-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    -- Email notifications
    email_reservation_confirmed BOOLEAN DEFAULT true,
    email_reservation_reminder BOOLEAN DEFAULT true,
    email_reservation_cancelled BOOLEAN DEFAULT true,
    email_league_updates BOOLEAN DEFAULT true,
    email_match_reminders BOOLEAN DEFAULT true,
    email_review_responses BOOLEAN DEFAULT true,
    email_promotions BOOLEAN DEFAULT true,
    email_newsletter BOOLEAN DEFAULT false,
    -- Push notifications (future)
    push_enabled BOOLEAN DEFAULT false,
    push_reservation_updates BOOLEAN DEFAULT true,
    push_match_reminders BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Notification log
CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    -- Notification details
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'push', 'sms')),
    subject VARCHAR(255),
    content TEXT,
    -- Related entities
    reservation_id UUID REFERENCES reservations(id) ON DELETE
    SET NULL,
        league_id UUID REFERENCES leagues(id) ON DELETE
    SET NULL,
        match_id UUID REFERENCES matches(id) ON DELETE
    SET NULL,
        review_id UUID REFERENCES reviews(id) ON DELETE
    SET NULL,
        -- Status
        status VARCHAR(20) DEFAULT 'pending' CHECK (
            status IN ('pending', 'sent', 'failed', 'opened')
        ),
        sent_at TIMESTAMPTZ,
        opened_at TIMESTAMPTZ,
        error_message TEXT,
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_log_user ON notification_log(user_id);
CREATE INDEX idx_notification_log_status ON notification_log(status);
CREATE INDEX idx_notification_log_type ON notification_log(type);
-- Trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at BEFORE
UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
-- Users can manage their own preferences
CREATE POLICY "Users manage own preferences" ON notification_preferences FOR ALL USING (user_id = auth.uid());
-- Users can view their own notifications
CREATE POLICY "Users view own notifications" ON notification_log FOR
SELECT USING (user_id = auth.uid());
-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO notification_preferences (user_id)
VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to create preferences on user creation
-- Note: This would be attached to auth.users in production
COMMENT ON TABLE notification_preferences IS 'User notification preferences for emails and push';
COMMENT ON TABLE notification_log IS 'Log of all notifications sent to users';