import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Users, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              🎱 The #1 Pool Hall Directory
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find Your Perfect{' '}
              <span className="text-primary">Pool Hall</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover top-rated billiards venues, pool halls, and snooker rooms near you.
              Search by location, table types, and amenities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base">
                <Link href="/venues">
                  <Search className="mr-2 h-5 w-5" />
                  Browse All Venues
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
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
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Use PoolFinder?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make it easy to discover and connect with the best pool venues in your area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
                <p className="text-muted-foreground">
                  Find venues by city, state, table types, and amenities. Our powerful search helps you find exactly what you&apos;re looking for.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect Directly</h3>
                <p className="text-muted-foreground">
                  Send inquiries directly to venues. Whether you&apos;re planning an event or just looking to play, we connect you instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Venues</h3>
                <p className="text-muted-foreground">
                  Claimed listings are verified by venue owners, ensuring you get accurate information about hours, tables, and amenities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-primary/10 via-card to-secondary/10 border-primary/20">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Own a Pool Hall?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Claim your listing to update your information, respond to inquiries, and connect with customers looking for venues like yours.
              </p>
              <Button size="lg" asChild>
                <Link href="/venues">Claim Your Listing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
