'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    TrendingUp,
    TrendingDown,
    Target,
    Trophy,
    Flame,
    Calendar,
    BarChart3
} from 'lucide-react';

interface StatsDashboardProps {
    playerName?: string;
}

// Demo stats data
const stats = {
    skillLevel: { eightBall: 5, nineBall: 6 },
    record: { wins: 47, losses: 31 },
    currentStreak: 4,
    bestStreak: 8,
    recentForm: ['W', 'W', 'W', 'W', 'L', 'W', 'L', 'W', 'W', 'L'],
    thisWeek: { matches: 6, wins: 4, hoursPlayed: 8.5 },
    thisMonth: { matches: 18, wins: 11, hoursPlayed: 24 },
    shotAccuracy: {
        overall: 72,
        straight: 89,
        cut: 74,
        bank: 58,
        kick: 52,
        combo: 45,
        safety: 81
    },
    milestones: [
        { name: '50 Wins', progress: 94, current: 47, target: 50 },
        { name: '100 Matches', progress: 78, current: 78, target: 100 },
        { name: 'SL7 in 8-Ball', progress: 60, current: 5, target: 7 },
        { name: '10 Game Win Streak', progress: 80, current: 8, target: 10 }
    ]
};

export function StatsDashboard({ playerName = 'Player' }: StatsDashboardProps) {
    const winRate = Math.round((stats.record.wins / (stats.record.wins + stats.record.losses)) * 100);

    return (
        <div className="space-y-6">
            {/* Skill Levels */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
                    <CardContent className="pt-4 text-center">
                        <span className="text-4xl">🎱</span>
                        <p className="text-xs text-muted-foreground mt-1">8-Ball</p>
                        <p className="text-3xl font-bold">SL{stats.skillLevel.eightBall}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5">
                    <CardContent className="pt-4 text-center">
                        <span className="text-4xl">🟡</span>
                        <p className="text-xs text-muted-foreground mt-1">9-Ball</p>
                        <p className="text-3xl font-bold">SL{stats.skillLevel.nineBall}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Record & Streak */}
            <Card>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                            <p className="text-2xl font-bold">{stats.record.wins}-{stats.record.losses}</p>
                            <p className="text-xs text-muted-foreground">Record</p>
                        </div>
                        <div>
                            <Target className="h-5 w-5 mx-auto mb-1 text-green-500" />
                            <p className="text-2xl font-bold">{winRate}%</p>
                            <p className="text-xs text-muted-foreground">Win Rate</p>
                        </div>
                        <div>
                            <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                            <p className="text-2xl font-bold">{stats.currentStreak}</p>
                            <p className="text-xs text-muted-foreground">Streak</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Form */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Recent Form
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-1">
                        {stats.recentForm.map((result, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-bold ${result === 'W'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-red-500 text-white'
                                    }`}
                            >
                                {result}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Last 10 matches: {stats.recentForm.filter(r => r === 'W').length} wins
                    </p>
                </CardContent>
            </Card>

            {/* Period Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            This Week
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Matches</span>
                            <span className="font-medium">{stats.thisWeek.matches}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Wins</span>
                            <span className="font-medium text-green-500">{stats.thisWeek.wins}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Hours</span>
                            <span className="font-medium">{stats.thisWeek.hoursPlayed}h</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Matches</span>
                            <span className="font-medium">{stats.thisMonth.matches}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Wins</span>
                            <span className="font-medium text-green-500">{stats.thisMonth.wins}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Hours</span>
                            <span className="font-medium">{stats.thisMonth.hoursPlayed}h</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Shot Accuracy */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Shot Accuracy
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Object.entries(stats.shotAccuracy).filter(([key]) => key !== 'overall').map(([type, pct]) => (
                        <div key={type} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="capitalize">{type}</span>
                                <span className={pct >= 70 ? 'text-green-500' : pct >= 50 ? 'text-yellow-500' : 'text-red-500'}>
                                    {pct}%
                                </span>
                            </div>
                            <Progress value={pct} className="h-2" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Milestones
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {stats.milestones.map(milestone => (
                        <div key={milestone.name} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>{milestone.name}</span>
                                <span className="text-muted-foreground">
                                    {milestone.current}/{milestone.target}
                                </span>
                            </div>
                            <Progress value={milestone.progress} className="h-2" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Trends */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm font-medium">Win Rate</p>
                                <p className="text-xs text-green-500">+8% vs last month</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <div>
                                <p className="text-sm font-medium">Safety %</p>
                                <p className="text-xs text-green-500">+12% improvement</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
