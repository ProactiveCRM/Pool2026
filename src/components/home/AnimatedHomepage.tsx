'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Users, Trophy, Calendar, Star, BarChart3, MapPin, Zap, ArrowRight } from 'lucide-react';
import { HeroButtons } from '@/components/home/HeroButtons';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/ui/animations';
import { Button } from '@/components/ui/button';

export function AnimatedHomepage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section - Premium 2026 Design */}
            <section className="relative py-24 sm:py-32 md:py-40 overflow-hidden">
                {/* Dark gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />

                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />

                {/* Accent glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />

                <div className="container mx-auto px-4 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <FadeUp delay={0}>
                            <Badge
                                variant="outline"
                                className="mb-8 text-sm px-4 py-2 border-primary/30 bg-primary/5"
                            >
                                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                                The #1 Platform for Pool Players
                            </Badge>
                        </FadeUp>

                        {/* Main headline - HIGH CONTRAST white text */}
                        <FadeUp delay={0.1}>
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
                                Find Your Game.{' '}
                                <span className="text-primary">Own the Table.</span>
                            </h1>
                        </FadeUp>

                        {/* Subheadline - readable gray */}
                        <FadeUp delay={0.2}>
                            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                                Discover top-rated pool halls, book tables instantly, and compete in local leagues.
                                <span className="text-foreground font-medium"> Welcome to RackCity.</span>
                            </p>
                        </FadeUp>

                        <FadeUp delay={0.3}>
                            <HeroButtons />
                        </FadeUp>

                        {/* Trust indicators */}
                        <FadeUp delay={0.4}>
                            <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm">
                                <div className="flex items-center gap-2 text-foreground/80">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span className="font-medium">500+ Venues</span>
                                </div>
                                <div className="flex items-center gap-2 text-foreground/80">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span className="font-medium">10K+ Players</span>
                                </div>
                                <div className="flex items-center gap-2 text-foreground/80">
                                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium">4.8 Rating</span>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 sm:py-28 bg-muted/30">
                <div className="container mx-auto px-4">
                    <FadeUp className="text-center mb-16">
                        <Badge variant="outline" className="mb-4 border-primary/30">
                            Platform Features
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground">
                            Everything You Need
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                            From finding venues to joining leagues, RackCity has you covered.
                        </p>
                    </FadeUp>

                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <StaggerItem key={i}>
                                <Card className="bg-card border-border hover:border-primary/50 transition-all hover:-translate-y-1 h-full">
                                    <CardContent className="pt-8 pb-6">
                                        <div className={`h-14 w-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-5`}>
                                            <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 sm:py-24 border-y border-border">
                <div className="container mx-auto px-4">
                    <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, i) => (
                            <StaggerItem key={i} className="space-y-2">
                                <div className={`text-4xl sm:text-5xl font-bold ${stat.color}`}>{stat.value}</div>
                                <div className="text-sm sm:text-base text-muted-foreground">{stat.label}</div>
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 sm:py-28">
                <div className="container mx-auto px-4">
                    <FadeUp>
                        <Card className="bg-card border-border overflow-hidden relative">
                            {/* Gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />

                            <CardContent className="py-16 text-center px-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-8">
                                    <span className="text-4xl">🎱</span>
                                </div>

                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-foreground">
                                    Own a Pool Hall?
                                </h2>
                                <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-lg">
                                    Claim your listing to update info, manage reservations, and connect with thousands of local players.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button size="lg" className="font-semibold text-base px-8" asChild>
                                        <Link href="/venues">
                                            Claim Your Listing
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="border-border hover:bg-muted" asChild>
                                        <Link href="/pricing">View Pricing</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </FadeUp>
                </div>
            </section>
        </div>
    );
}

const features = [
    {
        icon: Search,
        title: 'Smart Search',
        description: 'Find venues by location, table type, amenities, and real-time availability.',
        bgColor: 'bg-primary/15',
        iconColor: 'text-primary',
    },
    {
        icon: Calendar,
        title: 'Instant Booking',
        description: 'Reserve tables in advance. Guaranteed game time when you arrive.',
        bgColor: 'bg-green-500/15',
        iconColor: 'text-green-500',
    },
    {
        icon: Trophy,
        title: 'League Play',
        description: 'Join local leagues, form teams, and track standings all season.',
        bgColor: 'bg-yellow-500/15',
        iconColor: 'text-yellow-500',
    },
    {
        icon: Star,
        title: 'Reviews & Ratings',
        description: 'Read real player reviews and find venues backed by the community.',
        bgColor: 'bg-blue-500/15',
        iconColor: 'text-blue-500',
    },
    {
        icon: Users,
        title: 'Player Profiles',
        description: 'Build your profile, earn badges, and connect with other players.',
        bgColor: 'bg-purple-500/15',
        iconColor: 'text-purple-500',
    },
    {
        icon: BarChart3,
        title: 'Venue Dashboard',
        description: 'Owners get analytics, promotion tools, and reservation management.',
        bgColor: 'bg-orange-500/15',
        iconColor: 'text-orange-500',
    },
];

const stats = [
    { value: '500+', label: 'Pool Halls', color: 'text-primary' },
    { value: '50', label: 'States Covered', color: 'text-primary' },
    { value: '10K+', label: 'Active Players', color: 'text-primary' },
    { value: '4.8★', label: 'Average Rating', color: 'text-yellow-500' },
];
