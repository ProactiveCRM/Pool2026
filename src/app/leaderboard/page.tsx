import { Metadata } from 'next';
import { Leaderboard, demoLeaderboardPlayers } from '@/components/leagues/Leaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Target } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Leaderboard',
    description: 'See who tops the rankings in your pool league',
};

export default function LeaderboardPage() {
    // Demo stats
    const leagueStats = {
        totalPlayers: 156,
        totalMatches: 432,
        currentSeason: 'Spring 2026',
        weeksRemaining: 6,
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">League Leaderboard</h1>
                    <p className="text-muted-foreground">
                        Track your progress and see how you stack up against the competition
                    </p>
                </div>

                {/* Season Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Users className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold">{leagueStats.totalPlayers}</p>
                                    <p className="text-sm text-muted-foreground">Players</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Target className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold">{leagueStats.totalMatches}</p>
                                    <p className="text-sm text-muted-foreground">Matches</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <p className="text-2xl font-bold">{leagueStats.currentSeason}</p>
                                    <p className="text-sm text-muted-foreground">Season</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold">{leagueStats.weeksRemaining}</p>
                                    <p className="text-sm text-muted-foreground">Weeks Left</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Leaderboard */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Leaderboard
                            players={demoLeaderboardPlayers}
                            title="Top Players"
                            period="Spring 2026"
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Champions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    { season: 'Winter 2025', name: 'Marcus Chen', team: 'Cue Masters' },
                                    { season: 'Fall 2025', name: 'Sarah Williams', team: 'Break Kings' },
                                    { season: 'Summer 2025', name: 'Jake Thompson', team: 'Rail Runners' },
                                ].map((champ) => (
                                    <div key={champ.season} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                        <div>
                                            <p className="font-medium text-sm">{champ.name}</p>
                                            <p className="text-xs text-muted-foreground">{champ.team}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{champ.season}</Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">This Week&apos;s Hot Streaks</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {demoLeaderboardPlayers
                                    .filter(p => p.streak >= 5)
                                    .sort((a, b) => b.streak - a.streak)
                                    .slice(0, 3)
                                    .map((player) => (
                                        <div key={player.username} className="flex items-center justify-between">
                                            <span className="font-medium">{player.name}</span>
                                            <Badge className="bg-orange-500">
                                                🔥 {player.streak} wins
                                            </Badge>
                                        </div>
                                    ))
                                }
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
