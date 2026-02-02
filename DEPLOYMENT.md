# PoolFinder Deployment Checklist

## Prerequisites

- [ ] Supabase project created
- [ ] Vercel account connected to GitHub repo
- [ ] GoHighLevel account with API access

---

## 1. Supabase Setup

### 1.1 Get Credentials

1. Go to [supabase.com](https://supabase.com) → Your Project
2. Settings → API → Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (for Edge Functions)

### 1.2 Run Migrations

1. Go to SQL Editor in Supabase Dashboard
2. Paste contents of `supabase/migrations/ALL_MIGRATIONS.sql`
3. Click **Run**
4. Paste contents of `supabase/migrations/020_ghl_integration.sql`
5. Click **Run**

### 1.3 Seed Test Data (Optional)

1. SQL Editor → Paste `supabase/seed.sql` → Run
2. This adds 20 venues + 8 leagues for testing

### 1.4 Deploy Edge Functions

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set GHL_API_KEY=your_ghl_api_key
supabase secrets set GHL_LOCATION_ID=your_location_id
supabase secrets set GHL_PIPELINE_CLAIMS=your_pipeline_id
supabase secrets set GHL_STAGE_PENDING=your_stage_id

# Deploy functions
supabase functions deploy sync-contact-to-ghl
supabase functions deploy ghl-webhook-handler
supabase functions deploy trigger-ghl-workflow
```

---

## 2. GoHighLevel Setup

### 2.1 Get API Credentials

1. GHL → Settings → Business Info → Copy **Location ID**
2. Settings → API & Webhooks → Create API Key → Copy

### 2.2 Create Workflows

Create these workflows in GHL:

| Workflow Name | Trigger | Actions |
|---------------|---------|---------|
| Reservation Confirmation | API Trigger | Send email with booking details |
| Reservation Reminder | API Trigger | Send email 24h before |
| Claim Submitted | API Trigger | Send admin notification |
| Claim Approved | API Trigger | Send welcome email to venue owner |
| Claim Rejected | API Trigger | Send rejection email |
| League Welcome | API Trigger | Send league info email |
| Venue Welcome | API Trigger | Onboarding sequence for new venues |

### 2.3 Create Payment Links

1. **Venue Pro Subscription** - $49/month recurring
   - Payments → Payment Links → Create
   - Name: "PoolFinder Venue Pro"
   - Copy link → Set as `GHL_PAYMENT_LINK_VENUE_PRO`

2. **League Entry Fee** - Variable amount
   - Create generic link or per-league links
   - Copy → Set as `GHL_PAYMENT_LINK_LEAGUE_ENTRY`

### 2.4 Create Claims Pipeline

1. Pipelines → Create Pipeline: "Venue Claims"
2. Add stages:
   - **Pending** (copy stage ID → `GHL_STAGE_PENDING`)
   - **Under Review**
   - **Approved** (Won)
   - **Rejected** (Lost)
3. Copy pipeline ID → `GHL_PIPELINE_CLAIMS`

### 2.5 Configure Webhook

1. Settings → API & Webhooks → Webhooks
2. Add webhook URL: `https://YOUR_PROJECT.supabase.co/functions/v1/ghl-webhook-handler`
3. Select events:
   - Payment Received
   - Contact Tag Added
   - Opportunity Stage Changed

---

## 3. Vercel Setup

### 3.1 Connect Repository

1. [vercel.com](https://vercel.com) → New Project
2. Import `Pool2026` repo from GitHub
3. Framework: Next.js (auto-detected)

### 3.2 Environment Variables

Add these in Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

GHL_API_KEY=your_ghl_api_key
GHL_LOCATION_ID=your_location_id
GHL_PIPELINE_CLAIMS=your_pipeline_id
GHL_STAGE_PENDING=your_stage_id
GHL_PAYMENT_LINK_VENUE_PRO=https://...
GHL_PAYMENT_LINK_LEAGUE_ENTRY=https://...
```

### 3.3 Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Visit your-app.vercel.app

---

## 4. Post-Deployment

### 4.1 Configure Auth

1. Supabase → Authentication → URL Configuration
2. Set Site URL: `https://your-app.vercel.app`
3. Add Redirect URLs:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

### 4.2 Google OAuth (Optional)

1. Supabase → Authentication → Providers → Google
2. Add Client ID and Secret from Google Cloud Console
3. Set authorized redirect: `https://xxx.supabase.co/auth/v1/callback`

### 4.3 Test Flows

- [ ] Sign up with email
- [ ] Browse venues (should show seeded data)
- [ ] Create a venue claim
- [ ] Check GHL for new contact + opportunity
- [ ] Test payment link redirect
- [ ] Verify email workflows trigger

---

## Quick Reference: All Environment Variables

| Variable | Where to Get | Used In |
|----------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Frontend + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | Edge Functions |
| `GHL_API_KEY` | GHL → Settings → API | Server + Edge |
| `GHL_LOCATION_ID` | GHL → Settings → Business Info | Server + Edge |
| `GHL_PIPELINE_CLAIMS` | GHL → Pipelines | Server |
| `GHL_STAGE_PENDING` | GHL → Pipeline stages | Server |
| `GHL_PAYMENT_LINK_VENUE_PRO` | GHL → Payments | Server |
| `GHL_PAYMENT_LINK_LEAGUE_ENTRY` | GHL → Payments | Server |

---

## Troubleshooting

### "Failed to fetch venues"

- Check Supabase URL and anon key are set
- Verify migrations ran successfully
- Check RLS policies allow public read

### Claims not syncing to GHL

- Verify GHL_API_KEY is valid
- Check Edge Function logs: `supabase functions logs sync-contact-to-ghl`
- Ensure Location ID is correct

### Payments not updating database

- Verify webhook URL is correct
- Check webhook events are selected in GHL
- View Edge Function logs: `supabase functions logs ghl-webhook-handler`

---

**🎉 You're live!**
