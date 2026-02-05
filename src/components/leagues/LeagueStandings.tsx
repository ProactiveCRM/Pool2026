'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TeamStanding {
    rank: number;
    name: string;
    wins: number;
    losses: number;
    winRate: number;
    pointsFor: number;
    pointsAgainst: number;
    streak: 'W' | 'L' | '-';
    streakCount: number;
    change: 'up' | 'down' | 'same';
}

interface LeagueStandingsProps {
    standings: TeamStanding[];
    leagueName?: string;
}

export function LeagueStandings({ standings, leagueName = 'League' }: LeagueStandingsProps) {
    // Prepare data for chart
    const chartData = standings.slice(0, 8).map((team) => ({
        name: team.name.length > 12 ? team.name.slice(0, 12) + '...' : team.name,
        fullName: team.name,
        wins: team.wins,
        losses: team.losses,
        winRate: team.winRate,
    }));

    const getStreakIcon = (change: 'up' | 'down' | 'same') => {
        switch (change) {
            case 'up':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const getStreakBadge = (streak: 'W' | 'L' | '-', count: number) => {
        if (streak === '-' || count === 0) return null;
        return (
            <Badge
                variant="outline"
                className={streak === 'W' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}
            >
                {streak}{count}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Win/Loss Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {leagueName} Standings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="hsl(var(--muted-foreground))"
                                    width={100}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="wins" stackId="a" radius={[0, 0, 0, 0]}>
                                    {chartData.map((_, index) => (
                                        <Cell key={`wins-${index}`} fill="hsl(var(--primary))" />
                                    ))}
                                </Bar>
                                <Bar dataKey="losses" stackId="a" radius={[0, 4, 4, 0]}>
                                    {chartData.map((_, index) => (
                                        <Cell key={`losses-${index}`} fill="hsl(var(--muted))" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Standings Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Full Standings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">#</th>
                                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Team</th>
                                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">W</th>
                                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">L</th>
                                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Win%</th>
                                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">PF</th>
                                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">PA</th>
                                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Streak</th>
                                    <th className="text-center py-3 px-2 font-medium text-muted-foreground">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((team, index) => (
                                    <tr
                                        key={team.name}
                                        className={`border-b border-border hover:bg-muted/50 transition-colors ${index < 3 ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <td className="py-3 px-2">
                                            <span className={`font-bold ${team.rank === 1 ? 'text-yellow-500' :
                                                team.rank === 2 ? 'text-gray-400' :
                                                    team.rank === 3 ? 'text-orange-500' : ''
                                                }`}>
                                                {team.rank === 1 && '🥇 '}
                                                {team.rank === 2 && '🥈 '}
                                                {team.rank === 3 && '🥉 '}
                                                {team.rank}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 font-medium">{team.name}</td>
                                        <td className="py-3 px-2 text-center text-green-500 font-medium">{team.wins}</td>
                                        <td className="py-3 px-2 text-center text-red-500 font-medium">{team.losses}</td>
                                        <td className="py-3 px-2 text-center">{team.winRate.toFixed(0)}%</td>
                                        <td className="py-3 px-2 text-center">{team.pointsFor}</td>
                                        <td className="py-3 px-2 text-center">{team.pointsAgainst}</td>
                                        <td className="py-3 px-2 text-center">
                                            {getStreakBadge(team.streak, team.streakCount)}
                                        </td>
                                        <td className="py-3 px-2 text-center">
                                            {getStreakIcon(team.change)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Demo data for preview
export const demoStandings: TeamStanding[] = [
    { rank: 1, name: 'Pocket Rockets', wins: 12, losses: 2, winRate: 85.7, pointsFor: 156, pointsAgainst: 98, streak: 'W', streakCount: 5, change: 'up' },
    { rank: 2, name: 'Cue Masters', wins: 10, losses: 4, winRate: 71.4, pointsFor: 142, pointsAgainst: 112, streak: 'W', streakCount: 3, change: 'same' },
    { rank: 3, name: 'Break Kings', wins: 9, losses: 5, winRate: 64.3, pointsFor: 138, pointsAgainst: 118, streak: 'L', streakCount: 1, change: 'down' },
    { rank: 4, name: 'Scratch City', wins: 8, losses: 6, winRate: 57.1, pointsFor: 130, pointsAgainst: 126, streak: 'W', streakCount: 2, change: 'up' },
    { rank: 5, name: 'The 8-Ballers', wins: 7, losses: 7, winRate: 50.0, pointsFor: 125, pointsAgainst: 125, streak: 'L', streakCount: 2, change: 'down' },
    { rank: 6, name: 'Corner Pocket', wins: 6, losses: 8, winRate: 42.9, pointsFor: 118, pointsAgainst: 132, streak: 'L', streakCount: 3, change: 'down' },
    { rank: 7, name: 'Rail Runners', wins: 4, losses: 10, winRate: 28.6, pointsFor: 102, pointsAgainst: 148, streak: 'W', streakCount: 1, change: 'up' },
    { rank: 8, name: 'Chalk Dust', wins: 2, losses: 12, winRate: 14.3, pointsFor: 89, pointsAgainst: 161, streak: 'L', streakCount: 4, change: 'same' },
];
