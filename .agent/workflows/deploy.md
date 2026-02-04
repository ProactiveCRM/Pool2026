---
description: Deploy RackCity to production
---

# RackCity Production Deployment

## Prerequisites

- Supabase project created
- Vercel account connected
- Environment variables ready

## Step 1: Set Environment Variables

// turbo

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase API settings
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Optional, for venue maps
- `NEXT_PUBLIC_SENTRY_DSN` - Optional, for error tracking

## Step 2: Run Database Migrations

In Supabase SQL Editor, run these files in order:

1. `supabase/migrations/001_venues.sql`
2. `supabase/migrations/002_claims.sql`
3. `supabase/migrations/003_leads.sql`
4. `supabase/migrations/004_admin_users.sql`
5. `supabase/migrations/005_enrichment.sql`
6. `supabase/migrations/006_tables.sql`
7. `supabase/migrations/007_venue_hours.sql`
8. `supabase/migrations/008_reservations.sql`
9. `supabase/migrations/009_leagues.sql`
10. `supabase/migrations/010_teams.sql`
11. `supabase/migrations/011_team_members.sql`
12. `supabase/migrations/012_matches.sql`
13. `supabase/migrations/013_reviews.sql`
14. `supabase/migrations/014_player_profiles.sql`
15. `supabase/migrations/015_analytics.sql`
16. `supabase/migrations/016_notifications.sql`
17. `supabase/migrations/017_venue_claims.sql`
18. `supabase/migrations/018_admin_and_leads.sql`
19. `supabase/migrations/019_geolocation.sql`
20. `supabase/migrations/020_ghl_integration.sql`
21. `supabase/migrations/021_storage_buckets.sql`

## Step 3: Seed Test Data (Optional)

// turbo

```bash
# In Supabase SQL Editor, run:
# supabase/seed.sql
```

This adds 20 sample venues and 8 leagues.

## Step 4: Deploy Edge Functions (Optional)

// turbo

```bash
supabase functions deploy sync-contact-to-ghl
supabase functions deploy ghl-webhook-handler
supabase functions deploy trigger-ghl-workflow
```

## Step 5: Deploy to Vercel

// turbo

```bash
git push origin main
```

Vercel will auto-deploy from GitHub.

## Step 6: Verify Deployment

1. Check homepage loads
2. Test /venues page
3. Test /leagues page
4. Verify authentication flow
