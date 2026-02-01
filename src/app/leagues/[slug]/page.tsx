import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLeagueBySlug, getLeagueTeams, getLeagueMatches, getLeagueStandings } from '@/lib/actions/leagues';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Trophy, MapPin, Calendar, Users, ArrowLeft,
    ClipboardList, UserPlus
} from 'lucide-react';
import { GAME_TYPE_LABELS, FORMAT_LABELS, STATUS_LABELS } from '@/types/leagues';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const league = await getLeagueBySlug(slug);

    if (!league) {
        return { title: 'League Not Found' };
    }

    return {
        title: `${league.name} | Pool League`,
        description: league.description || `Join ${league.name} - a ${GAME_TYPE_LABELS[league.game_type]} league.`,
    };
}

export default async function LeagueDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const league = await getLeagueBySlug(slug);

    if (!league) {
        notFound();
    }

    const [teams, matches, standings] = await Promise.all([
        getLeagueTeams(league.id),
        getLeagueMatches(league.id),
        getLeagueStandings(league.id),
    ]);

    const upcomingMatches = matches.filter(m => m.status === 'scheduled').slice(0, 5);
    const recentResults = matches.filter(m => m.status === 'completed').slice(-5).reverse();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="py-8 sm:py-12 bg-gradient-to-br from-primary/15 via-background to-accent/10">
                <div className="container mx-auto px-4">
                    <Link
                        href="/leagues"
                        className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        All Leagues
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl sm:text-4xl font-bold">{league.name}</h1>
                                <Badge className={STATUS_LABELS[league.status].color}>
                                    {STATUS_LABELS[league.status].label}
                                </Badge>
                            </div>
                            <p className="text-lg text-muted-foreground">
                                {GAME_TYPE_LABELS[league.game_type]} • {FORMAT_LABELS[league.format]}
                                {league.skill_level && ` • ${league.skill_level}`}
                            </p>

                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                                {league.home_venue && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {league.home_venue.city}, {league.home_venue.state}
                                    </span>
                                )}
                                {league.season_start && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(league.season_start).toLocaleDateString()} - {league.season_end ? new Date(league.season_end).toLocaleDateString() : 'TBD'}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {teams.length} / {league.max_teams} teams
                                </span>
                            </div>
                        </div>

                        {league.status === 'registration' && (
                            <Button size="lg" asChild>
                                <Link href={`/leagues/${league.slug}/join`}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Join League
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="standings" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4 max-w-lg">
                            <TabsTrigger value="standings">Standings</TabsTrigger>
                            <TabsTrigger value="schedule">Schedule</TabsTrigger>
                            <TabsTrigger value="teams">Teams</TabsTrigger>
                            <TabsTrigger value="info">Info</TabsTrigger>
                        </TabsList>

                        {/* Standings Tab */}
                        <TabsContent value="standings">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-primary" />
                                        League Standings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {standings.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            No teams registered yet
                                        </p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left py-3 px-2">#</th>
                                                        <th className="text-left py-3 px-2">Team</th>
                                                        <th className="text-center py-3 px-2">W</th>
                                                        <th className="text-center py-3 px-2">L</th>
                                                        <th className="text-center py-3 px-2">T</th>
                                                        <th className="text-center py-3 px-2">Pts</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {standings.map((team, index) => (
                                                        <tr key={team.id} className="border-b last:border-0 hover:bg-muted/50">
                                                            <td className="py-3 px-2 font-medium">
                                                                {index + 1}
                                                                {index === 0 && ' 🥇'}
                                                                {index === 1 && ' 🥈'}
                                                                {index === 2 && ' 🥉'}
                                                            </td>
                                                            <td className="py-3 px-2">
                                                                <Link
                                                                    href={`/leagues/${league.slug}/teams/${team.id}`}
                                                                    className="font-medium hover:text-primary transition-colors"
                                                                >
                                                                    {team.name}
                                                                </Link>
                                                            </td>
                                                            <td className="text-center py-3 px-2 text-green-500">{team.wins}</td>
                                                            <td className="text-center py-3 px-2 text-red-500">{team.losses}</td>
                                                            <td className="text-center py-3 px-2">{team.ties}</td>
                                                            <td className="text-center py-3 px-2 font-bold">{team.points}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Schedule Tab */}
                        <TabsContent value="schedule">
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Upcoming Matches */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            Upcoming Matches
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {upcomingMatches.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">
                                                No upcoming matches scheduled
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {upcomingMatches.map((match) => (
                                                    <div key={match.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{match.home_team?.name}</span>
                                                                <span className="text-muted-foreground">vs</span>
                                                                <span className="font-medium">{match.away_team?.name}</span>
                                                            </div>
                                                            {match.scheduled_at && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(match.scheduled_at).toLocaleDateString()} at {new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {match.week_number && (
                                                            <Badge variant="outline">Week {match.week_number}</Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Recent Results */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ClipboardList className="h-5 w-5 text-primary" />
                                            Recent Results
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {recentResults.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">
                                                No completed matches yet
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentResults.map((match) => (
                                                    <div key={match.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-medium ${match.winner_team_id === match.home_team_id ? 'text-green-500' : ''}`}>
                                                                    {match.home_team?.name}
                                                                </span>
                                                                <span className="text-lg font-bold">
                                                                    {match.home_score} - {match.away_score}
                                                                </span>
                                                                <span className={`font-medium ${match.winner_team_id === match.away_team_id ? 'text-green-500' : ''}`}>
                                                                    {match.away_team?.name}
                                                                </span>
                                                            </div>
                                                            {match.completed_at && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {new Date(match.completed_at).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Teams Tab */}
                        <TabsContent value="teams">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {teams.length === 0 ? (
                                    <Card className="col-span-full text-center py-12">
                                        <CardContent>
                                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground">No teams registered yet</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    teams.map((team) => (
                                        <Card key={team.id} className="hover:border-primary/50 transition-colors">
                                            <CardHeader>
                                                <CardTitle>{team.name}</CardTitle>
                                                {team.home_venue && (
                                                    <CardDescription className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {team.home_venue.name}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Record</span>
                                                    <span className="font-medium">
                                                        {team.wins}W - {team.losses}L
                                                        {team.ties > 0 && ` - ${team.ties}T`}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        {/* Info Tab */}
                        <TabsContent value="info">
                            <Card>
                                <CardHeader>
                                    <CardTitle>League Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {league.description && (
                                        <div>
                                            <h4 className="font-medium mb-2">About</h4>
                                            <p className="text-muted-foreground whitespace-pre-wrap">
                                                {league.description}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <h4 className="font-medium mb-2">Format</h4>
                                            <dl className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <dt className="text-muted-foreground">Game</dt>
                                                    <dd>{GAME_TYPE_LABELS[league.game_type]}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-muted-foreground">Format</dt>
                                                    <dd>{FORMAT_LABELS[league.format]}</dd>
                                                </div>
                                                {league.handicap_system && (
                                                    <div className="flex justify-between">
                                                        <dt className="text-muted-foreground">Handicap</dt>
                                                        <dd>{league.handicap_system}</dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Season</h4>
                                            <dl className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <dt className="text-muted-foreground">Length</dt>
                                                    <dd>{league.weeks_in_season} weeks</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-muted-foreground">Team Roster</dt>
                                                    <dd>{league.min_players_per_team}-{league.max_players_per_team} players</dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>

                                    {(league.team_fee || league.player_fee) && (
                                        <div>
                                            <h4 className="font-medium mb-2">Fees</h4>
                                            <dl className="space-y-1 text-sm">
                                                {league.team_fee && (
                                                    <div className="flex justify-between">
                                                        <dt className="text-muted-foreground">Team Fee</dt>
                                                        <dd>${league.team_fee}</dd>
                                                    </div>
                                                )}
                                                {league.player_fee && (
                                                    <div className="flex justify-between">
                                                        <dt className="text-muted-foreground">Player Fee</dt>
                                                        <dd>${league.player_fee}</dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>
                                    )}

                                    {league.rules && (
                                        <div>
                                            <h4 className="font-medium mb-2">Rules</h4>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {league.rules}
                                            </p>
                                        </div>
                                    )}

                                    {(league.contact_email || league.contact_phone) && (
                                        <div>
                                            <h4 className="font-medium mb-2">Contact</h4>
                                            <div className="space-y-1 text-sm">
                                                {league.contact_email && (
                                                    <p>
                                                        <a href={`mailto:${league.contact_email}`} className="text-primary hover:underline">
                                                            {league.contact_email}
                                                        </a>
                                                    </p>
                                                )}
                                                {league.contact_phone && (
                                                    <p>
                                                        <a href={`tel:${league.contact_phone}`} className="text-primary hover:underline">
                                                            {league.contact_phone}
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
}
