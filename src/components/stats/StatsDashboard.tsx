'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Trophy, Flame, Zap } from 'lucide-react';

interface PerformanceData {
    date: string;
    wins: number;
    winRate: number;
}

interface GameTypeStats {
    name: string;
    value: number;
    color: string;
}

interface StatsDashboardProps {
    performanceData: PerformanceData[];
    gameTypeStats: GameTypeStats[];
    currentStreak: number;
    bestStreak: number;
    totalGames: number;
    winRate: number;
    winRateChange: number;
    recentForm: ('W' | 'L')[];
}

export function StatsDashboard({
    performanceData,
    gameTypeStats,
    currentStreak,
    bestStreak,
    totalGames,
    winRate,
    winRateChange,
    recentForm,
}: StatsDashboardProps) {
    return (
        <div className="space-y-6">
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Win Rate</p>
                                <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
                            </div>
                            <div className={`flex items-center gap-1 text-sm ${winRateChange >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {winRateChange >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                ) : (
                                    <TrendingDown className="h-4 w-4" />
                                )}
                                {Math.abs(winRateChange).toFixed(1)}%
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Current Streak</p>
                                <p className="text-2xl font-bold">{currentStreak}</p>
                            </div>
                            <Flame className={`h-8 w-8 ${currentStreak >= 5 ? 'text-orange-500' : 'text-muted-foreground'
                                }`} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Best Streak</p>
                                <p className="text-2xl font-bold">{bestStreak}</p>
                            </div>
                            <Trophy className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Games</p>
                                <p className="text-2xl font-bold">{totalGames}</p>
                            </div>
                            <Target className="h-8 w-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Recent Form
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        {recentForm.map((result, index) => (
                            <div
                                key={index}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${result === 'W' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            >
                                {result}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Win Rate Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Win Rate Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="hsl(var(--muted-foreground))"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        domain={[0, 100]}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="winRate"
                                        stroke="hsl(var(--primary))"
                                        fill="url(#winRateGradient)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Game Types Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Games by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gameTypeStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {gameTypeStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {gameTypeStats.map((stat) => (
                                <div key={stat.name} className="flex items-center gap-2 text-sm">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: stat.color }}
                                    />
                                    {stat.name}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Wins Over Time */}
            <Card>
                <CardHeader>
                    <CardTitle>Wins Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    stroke="hsl(var(--muted-foreground))"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="wins"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Demo data
export const demoPerformanceData: PerformanceData[] = [
    { date: 'Jan', wins: 8, winRate: 57 },
    { date: 'Feb', wins: 12, winRate: 63 },
    { date: 'Mar', wins: 10, winRate: 59 },
    { date: 'Apr', wins: 15, winRate: 68 },
    { date: 'May', wins: 14, winRate: 70 },
    { date: 'Jun', wins: 18, winRate: 75 },
];

export const demoGameTypeStats: GameTypeStats[] = [
    { name: '8-Ball', value: 65, color: 'hsl(var(--primary))' },
    { name: '9-Ball', value: 25, color: '#22c55e' },
    { name: '10-Ball', value: 10, color: '#eab308' },
];

export const demoRecentForm: ('W' | 'L')[] = ['W', 'W', 'L', 'W', 'W', 'W', 'L', 'W', 'W', 'W'];
