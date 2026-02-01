import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Users, Trophy, Calendar, Star, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-32 overflow-hidden">
        {/* Background gradient with green pool table feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/25 via-transparent to-transparent" />

        {/* Pool ball decorations - subtle background elements */}
        <div className="absolute top-10 left-10 text-4xl md:text-6xl opacity-10 select-none">🎱</div>
        <div className="absolute bottom-10 right-10 text-4xl md:text-6xl opacity-10 select-none">🎱</div>
        <div className="absolute top-1/2 right-20 text-3xl md:text-5xl opacity-5 select-none hidden md:block">🎯</div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 sm:mb-6 text-sm sm:text-base px-3 py-1">
              🎱 The #1 Pool Hall Directory for Players
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              Find Your Perfect{' '}
              <span className="text-primary">Pool Hall</span> 🎯
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
              Discover top-rated billiards venues, pool halls, and snooker rooms near you.
              Search by location, table types, and amenities. Made for players, by players.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button size="lg" asChild className="text-base w-full sm:w-auto">
                <Link href="/venues">
                  <Search className="mr-2 h-5 w-5" />
                  Browse All Venues
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base w-full sm:w-auto">
                <Link href="/venues">
                  <MapPin className="mr-2 h-5 w-5" />
                  Find Near Me
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              The Complete Pool Platform 🏆
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-2">
              Everything you need to find venues, book tables, join leagues, and connect with players.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-all hover:scale-[1.02]">
              <CardContent className="pt-5 sm:pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">🔍 Find Venues</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Search by location, table types, and amenities. Discover the perfect spot for your next game.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-all hover:scale-[1.02]">
              <CardContent className="pt-5 sm:pt-6">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">📅 Reserve Tables</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Book your table in advance. No more waiting—guaranteed table time when you arrive.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-all hover:scale-[1.02]">
              <CardContent className="pt-5 sm:pt-6">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">🏆 Join Leagues</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Compete in local leagues, form teams, and track your standings throughout the season.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-all hover:scale-[1.02]">
              <CardContent className="pt-5 sm:pt-6">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Star className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">⭐ Rate & Review</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Share your experiences and help others find great venues with detailed reviews.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-all hover:scale-[1.02]">
              <CardContent className="pt-5 sm:pt-6">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 sm:mb-4">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">👤 Player Profiles</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Build your profile, earn badges, and connect with players looking for games or teams.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-all hover:scale-[1.02]">
              <CardContent className="pt-5 sm:pt-6">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3 sm:mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">📊 Venue Dashboard</h3>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Venue owners get analytics, promotion tools, and reservation management in one place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section - New */}
      <section className="py-10 sm:py-12 md:py-16 border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">🎱 500+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Pool Halls Listed</div>
            </div>
            <div className="p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">📍 50</div>
              <div className="text-xs sm:text-sm text-muted-foreground">States Covered</div>
            </div>
            <div className="p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">🎯 10K+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active Players</div>
            </div>
            <div className="p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">⭐ 4.8</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/15 via-card to-accent/10 border-primary/30">
            <CardContent className="py-8 sm:py-10 md:py-12 text-center px-4 sm:px-6">
              <div className="text-4xl mb-4">🎱</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                Own a Pool Hall?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-5 sm:mb-6 text-sm sm:text-base">
                Claim your listing to update your information, respond to inquiries, and connect with players looking for venues like yours.
              </p>
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/venues">🏆 Claim Your Listing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
