# 🎱 RackCity

The ultimate platform for pool players. Find venues, join leagues, and improve your game with AI.

## Features

### 🏠 Core Platform

- **Venue Directory** - Find pool halls near you with maps and filters
- **Table Reservations** - Book tables OpenTable-style
- **League Management** - Create and join competitive leagues
- **Player Profiles** - Track stats, achievements, and match history

### 🤖 AI Features

- **AI Coach** - Get expert pool advice powered by Gemini
- **Shot Analyzer** - Analyze table photos for shot suggestions

### 📊 Analytics

- **League Standings** - Visual charts with recharts
- **Performance Stats** - Win rate, streaks, and more
- **Speed Insights** - Real user performance monitoring

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Maps**: Google Maps API
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Auth**: Supabase Auth

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

## Deployment

Deploy on [Vercel](https://vercel.com) for the best experience with Next.js.

```bash
pnpm build
```

## License

MIT
