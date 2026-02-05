'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Trophy,
    Target,
    Flame,
    Star,
    MapPin,
    Calendar,
    Award,
    TrendingUp,
    BarChart3
} from 'lucide-react';

interface PlayerStats {
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    currentStreak: number;
    bestStreak: number;
    avgBallsRun: number;
    breakAndRuns: number;
    nineBallBreakRuns: number;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
}

interface RecentMatch {
    id: string;
    opponent: string;
    result: 'win' | 'loss';
    score: string;
    date: string;
    league: string;
}

interface PlayerProfileProps {
    name: string;
    username: string;
    avatarUrl?: string;
    location?: string;
    memberSince: string;
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Pro';
    preferredGame: string;
    stats: PlayerStats;
    achievements: Achievement[];
    recentMatches: RecentMatch[];
}

export function PlayerProfile({
    name,
    username,
    avatarUrl,
    location,
    memberSince,
    skillLevel,
    preferredGame,
    stats,
    achievements,
    recentMatches,
}: PlayerProfileProps) {
    const getSkillColor = (level: string) => {
        switch (level) {
            case 'Beginner': return 'bg-blue-500/20 text-blue-500';
            case 'Intermediate': return 'bg-green-500/20 text-green-500';
            case 'Advanced': return 'bg-yellow-500/20 text-yellow-500';
            case 'Expert': return 'bg-orange-500/20 text-orange-500';
            case 'Pro': return 'bg-purple-500/20 text-purple-500';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                        <Avatar className="h-24 w-24 border-4 border-primary/20">
                            <AvatarImage src={avatarUrl} alt={name} />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold">{name}</h1>
                            <p className="text-muted-foreground">@{username}</p>
                            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                                <Badge className={getSkillColor(skillLevel)}>{skillLevel}</Badge>
                                <Badge variant="outline">{preferredGame}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground justify-center sm:justify-start">
                                {location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {location}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Member since {memberSince}
                                </span>
                            </div>
                        </div>
                        <Button variant="outline">Edit Profile</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                        <div className="text-2xl font-bold">{stats.gamesWon}</div>
                        <div className="text-sm text-muted-foreground">Wins</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Win Rate</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                        <div className="text-2xl font-bold">{stats.currentStreak}</div>
                        <div className="text-sm text-muted-foreground">Current Streak</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <div className="text-2xl font-bold">{stats.breakAndRuns}</div>
                        <div className="text-sm text-muted-foreground">Break & Runs</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Detailed Info */}
            <Tabs defaultValue="stats" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="stats" className="gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Stats
                    </TabsTrigger>
                    <TabsTrigger value="matches" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Matches
                    </TabsTrigger>
                    <TabsTrigger value="achievements" className="gap-2">
                        <Award className="h-4 w-4" />
                        Badges
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="stats">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div>
                                    <div className="text-sm text-muted-foreground">Games Played</div>
                                    <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Games Won</div>
                                    <div className="text-2xl font-bold text-green-500">{stats.gamesWon}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Games Lost</div>
                                    <div className="text-2xl font-bold text-red-500">{stats.gamesPlayed - stats.gamesWon}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Best Streak</div>
                                    <div className="text-2xl font-bold">{stats.bestStreak} wins</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Avg Balls Run</div>
                                    <div className="text-2xl font-bold">{stats.avgBallsRun.toFixed(1)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">9-Ball Break Runs</div>
                                    <div className="text-2xl font-bold">{stats.nineBallBreakRuns}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="matches">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Matches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentMatches.map((match) => (
                                    <div
                                        key={match.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant={match.result === 'win' ? 'default' : 'secondary'}
                                                className={match.result === 'win' ? 'bg-green-500' : 'bg-red-500'}
                                            >
                                                {match.result === 'win' ? 'W' : 'L'}
                                            </Badge>
                                            <div>
                                                <div className="font-medium">vs {match.opponent}</div>
                                                <div className="text-sm text-muted-foreground">{match.league}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{match.score}</div>
                                            <div className="text-sm text-muted-foreground">{match.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="achievements">
                    <Card>
                        <CardHeader>
                            <CardTitle>Achievements & Badges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="text-4xl mb-2">{achievement.icon}</div>
                                        <div className="font-medium text-sm">{achievement.name}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {achievement.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Demo data
export const demoProfile: PlayerProfileProps = {
    name: 'Alex Thompson',
    username: 'alexpool',
    location: 'Austin, TX',
    memberSince: 'Jan 2024',
    skillLevel: 'Advanced',
    preferredGame: '8-Ball',
    stats: {
        gamesPlayed: 156,
        gamesWon: 98,
        winRate: 62.8,
        currentStreak: 4,
        bestStreak: 12,
        avgBallsRun: 3.2,
        breakAndRuns: 8,
        nineBallBreakRuns: 3,
    },
    achievements: [
        { id: '1', name: 'First Win', description: 'Win your first match', icon: '🏆', earnedAt: '2024-01-15' },
        { id: '2', name: 'Hot Streak', description: '5 wins in a row', icon: '🔥', earnedAt: '2024-02-20' },
        { id: '3', name: 'Break Master', description: '10 break & runs', icon: '💥', earnedAt: '2024-03-10' },
        { id: '4', name: 'League Member', description: 'Join a league', icon: '👥', earnedAt: '2024-01-20' },
        { id: '5', name: 'Century Club', description: 'Play 100 games', icon: '💯', earnedAt: '2024-04-01' },
        { id: '6', name: 'Road Warrior', description: 'Play at 10 venues', icon: '🚗', earnedAt: '2024-03-25' },
        { id: '7', name: 'Night Owl', description: 'Play after midnight', icon: '🦉', earnedAt: '2024-02-14' },
        { id: '8', name: 'Social Butterfly', description: '50 different opponents', icon: '🦋', earnedAt: '2024-04-15' },
    ],
    recentMatches: [
        { id: '1', opponent: 'Mike Chen', result: 'win', score: '5-3', date: 'Feb 4', league: 'Austin 8-Ball' },
        { id: '2', opponent: 'Sarah Wilson', result: 'win', score: '5-4', date: 'Feb 3', league: 'Austin 8-Ball' },
        { id: '3', opponent: 'Jake Roberts', result: 'loss', score: '3-5', date: 'Jan 31', league: 'Austin 8-Ball' },
        { id: '4', opponent: 'Emma Davis', result: 'win', score: '5-2', date: 'Jan 28', league: 'Austin 8-Ball' },
        { id: '5', opponent: 'Chris Lee', result: 'win', score: '5-1', date: 'Jan 24', league: 'Austin 8-Ball' },
    ],
};
