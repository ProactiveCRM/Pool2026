import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Trophy, Calendar, Star, BarChart3, MapPin, Zap } from 'lucide-react';
import { HeroButtons } from '@/components/home/HeroButtons';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Premium 2026 Design */}
      <section className="relative py-20 sm:py-28 md:py-36 overflow-hidden gradient-hero">
        {/* Gradient glow effect */}
        <div className="absolute inset-0 gradient-glow" />

        {/* Mesh gradient background */}
        <div className="absolute inset-0 gradient-mesh opacity-60" />

        {/* Animated pool balls */}
        <div className="absolute top-20 left-[10%] w-16 h-16 pool-ball opacity-20 float" />
        <div className="absolute bottom-20 right-[15%] w-12 h-12 pool-ball opacity-15 float-delayed" />
        <div className="absolute top-1/3 right-[8%] w-8 h-8 pool-ball opacity-10 float-slow hidden md:block" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge
              variant="secondary"
              className="mb-6 sm:mb-8 text-sm sm:text-base px-4 py-1.5 glass-card border-primary/20 glow-hover"
            >
              <Zap className="h-4 w-4 mr-2 text-yellow-400" />
              The #1 Pool Hall Directory for Players
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 sm:mb-8 fade-in-up">
              Find Your Perfect{' '}
              <span className="text-gradient">Pool Hall</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto px-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
              Discover top-rated billiards venues near you. Search, book tables, and join leagues—all in one place.
            </p>

            <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
              <HeroButtons />
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>500+ Venues</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>10K+ Players</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>4.8 Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 noise" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30">
              🏆 Platform Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Everything You Need to <span className="text-gradient">Play Pool</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg px-4">
              From finding venues to joining leagues, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            <Card className="glass-card card-hover border-0">
              <CardContent className="pt-8 pb-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5 glow">
                  <Search className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">🔍 Smart Search</h3>
                <p className="text-muted-foreground">
                  Find venues by location, table type, amenities, and real-time availability.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card card-hover border-0">
              <CardContent className="pt-8 pb-6">
                <div className="h-14 w-14 rounded-2xl bg-green-500/15 flex items-center justify-center mb-5">
                  <Calendar className="h-7 w-7 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">📅 Instant Booking</h3>
                <p className="text-muted-foreground">
                  Reserve tables in advance. Guaranteed game time when you arrive.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card card-hover border-0">
              <CardContent className="pt-8 pb-6">
                <div className="h-14 w-14 rounded-2xl bg-yellow-500/15 flex items-center justify-center mb-5">
                  <Trophy className="h-7 w-7 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">🏆 League Play</h3>
                <p className="text-muted-foreground">
                  Join local leagues, form teams, and track standings all season.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card card-hover border-0">
              <CardContent className="pt-8 pb-6">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/15 flex items-center justify-center mb-5">
                  <Star className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">⭐ Reviews & Ratings</h3>
                <p className="text-muted-foreground">
                  Share experiences and find venues backed by real player reviews.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card card-hover border-0">
              <CardContent className="pt-8 pb-6">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/15 flex items-center justify-center mb-5">
                  <Users className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">👤 Player Profiles</h3>
                <p className="text-muted-foreground">
                  Build your profile, earn badges, and connect with other players.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card card-hover border-0">
              <CardContent className="pt-8 pb-6">
                <div className="h-14 w-14 rounded-2xl bg-orange-500/15 flex items-center justify-center mb-5">
                  <BarChart3 className="h-7 w-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">📊 Venue Dashboard</h3>
                <p className="text-muted-foreground">
                  Owners get analytics, promotion tools, and reservation management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section - Glassmorphic */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />

        <div className="container mx-auto px-4 relative">
          <div className="glass-strong rounded-3xl p-8 sm:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-gradient">500+</div>
                <div className="text-sm sm:text-base text-muted-foreground">Pool Halls</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-gradient">50</div>
                <div className="text-sm sm:text-base text-muted-foreground">States Covered</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-gradient">10K+</div>
                <div className="text-sm sm:text-base text-muted-foreground">Active Players</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-gradient-gold">4.8★</div>
                <div className="text-sm sm:text-base text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Card */}
      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Card className="glass-card border-primary/20 shine overflow-hidden">
            <CardContent className="py-12 sm:py-16 text-center px-6 sm:px-8 relative">
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 glow">
                <span className="text-4xl">🎱</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Own a Pool Hall?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-base sm:text-lg">
                Claim your listing to update info, respond to reviews, manage reservations, and connect with thousands of local players.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="btn-glow text-base px-8" asChild>
                  <Link href="/venues">🏆 Claim Your Listing</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10" asChild>
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
