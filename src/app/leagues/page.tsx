import { Metadata } from 'next';
import Link from 'next/link';
import { getPublicLeagues } from '@/lib/actions/leagues';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, Plus } from 'lucide-react';
import { GAME_TYPE_LABELS, FORMAT_LABELS, STATUS_LABELS } from '@/types/leagues';

export const metadata: Metadata = {
    title: 'Pool Leagues',
    description: 'Find and join pool leagues near you. 8-ball, 9-ball, and more.',
};

export default async function LeaguesPage() {
    const leagues = await getPublicLeagues();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="py-12 sm:py-16 bg-gradient-to-br from-primary/15 via-background to-accent/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <Badge variant="secondary" className="mb-4">🏆 Pool Leagues</Badge>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Find Your League
                        </h1>
                        <p className="text-lg text-muted-foreground mb-6">
                            Join a league, compete with other players, and take your game to the next level.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button size="lg" asChild>
                                <Link href="/leagues/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create a League
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/leagues/manage">
                                    Manage My Leagues
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leagues List */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {leagues.length === 0 ? (
                        <Card className="text-center py-16">
                            <CardContent>
                                <div className="text-6xl mb-4">🏆</div>
                                <h2 className="text-2xl font-semibold mb-2">No Leagues Yet</h2>
                                <p className="text-muted-foreground mb-6">
                                    Be the first to create a league in your area!
                                </p>
                                <Button asChild>
                                    <Link href="/leagues/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create a League
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold">
                                    Active Leagues ({leagues.length})
                                </h2>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {leagues.map((league) => (
                                    <Card key={league.id} className="flex flex-col hover:border-primary/50 transition-colors">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <CardTitle className="text-xl mb-1">
                                                        {league.name}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {GAME_TYPE_LABELS[league.game_type]} • {FORMAT_LABELS[league.format]}
                                                    </CardDescription>
                                                </div>
                                                <Badge className={STATUS_LABELS[league.status].color}>
                                                    {STATUS_LABELS[league.status].label}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-3">
                                            {league.home_venue && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{league.home_venue.city}, {league.home_venue.state}</span>
                                                </div>
                                            )}
                                            {league.season_start && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        Starts {new Date(league.season_start).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>Max {league.max_teams} teams</span>
                                            </div>
                                            {league.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {league.description}
                                                </p>
                                            )}
                                        </CardContent>
                                        <CardFooter className="pt-4 border-t">
                                            <Button className="w-full" asChild>
                                                <Link href={`/leagues/${league.slug}`}>
                                                    View League
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
