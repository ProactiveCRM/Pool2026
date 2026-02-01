import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMyTeams, getMyLeagues } from '@/lib/actions/leagues';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Plus, MapPin, ArrowRight } from 'lucide-react';
import { STATUS_LABELS, GAME_TYPE_LABELS } from '@/types/leagues';

export const metadata: Metadata = {
    title: 'My Teams & Leagues',
    description: 'Manage your pool league teams and leagues you manage.',
};

export default async function MyTeamsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?next=/my-teams');
    }

    const [myTeams, myLeagues] = await Promise.all([
        getMyTeams(),
        getMyLeagues(),
    ]);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Teams & Leagues</h1>
                        <p className="text-muted-foreground">
                            Manage your league participation
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/leagues">
                                Find Leagues
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/leagues/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create League
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Leagues I Manage */}
                {myLeagues.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            Leagues I Manage
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {myLeagues.map((league) => (
                                <Card key={league.id} className="hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-lg">{league.name}</CardTitle>
                                            <Badge className={STATUS_LABELS[league.status].color}>
                                                {STATUS_LABELS[league.status].label}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            {GAME_TYPE_LABELS[league.game_type]}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {league.home_venue && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                {league.home_venue.city}, {league.home_venue.state}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button size="sm" asChild className="flex-1">
                                                <Link href={`/leagues/${league.slug}`}>
                                                    View
                                                    <ArrowRight className="ml-2 h-3 w-3" />
                                                </Link>
                                            </Button>
                                            <Button size="sm" variant="outline" asChild className="flex-1">
                                                <Link href={`/leagues/${league.slug}/manage`}>
                                                    Manage
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* My Teams */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        My Teams
                    </h2>

                    {myTeams.length === 0 ? (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Join a league to create or join a team.
                                </p>
                                <Button asChild>
                                    <Link href="/leagues">
                                        Browse Leagues
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {myTeams.map((team) => (
                                <Card key={team.id} className="hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{team.name}</CardTitle>
                                        {team.league && (
                                            <CardDescription>
                                                {team.league.name}
                                                {team.league.status && (
                                                    <Badge variant="outline" className="ml-2">
                                                        {STATUS_LABELS[team.league.status].label}
                                                    </Badge>
                                                )}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-green-500/10 rounded p-2">
                                                <div className="text-lg font-bold text-green-500">{team.wins}</div>
                                                <div className="text-xs text-muted-foreground">Wins</div>
                                            </div>
                                            <div className="bg-red-500/10 rounded p-2">
                                                <div className="text-lg font-bold text-red-500">{team.losses}</div>
                                                <div className="text-xs text-muted-foreground">Losses</div>
                                            </div>
                                            <div className="bg-muted rounded p-2">
                                                <div className="text-lg font-bold">{team.points}</div>
                                                <div className="text-xs text-muted-foreground">Points</div>
                                            </div>
                                        </div>

                                        {team.league && (
                                            <Button size="sm" asChild className="w-full">
                                                <Link href={`/leagues/${team.league.slug}`}>
                                                    View League
                                                    <ArrowRight className="ml-2 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
