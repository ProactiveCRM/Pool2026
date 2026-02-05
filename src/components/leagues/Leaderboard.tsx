'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Target, Flame, TrendingUp, Crown } from 'lucide-react';

interface LeaderboardPlayer {
    rank: number;
    name: string;
    username: string;
    avatarUrl?: string;
    wins: number;
    winRate: number;
    streak: number;
    points: number;
    change: 'up' | 'down' | 'same';
    changeAmount: number;
}

interface LeaderboardProps {
    players: LeaderboardPlayer[];
    title?: string;
    period?: string;
}

export function Leaderboard({ players, title = 'Leaderboard', period = 'This Season' }: LeaderboardProps) {
    const getRankDisplay = (rank: number) => {
        switch (rank) {
            case 1:
                return (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20">
                        <Crown className="h-5 w-5 text-yellow-500" />
                    </div>
                );
            case 2:
                return (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400/20">
                        <Medal className="h-5 w-5 text-gray-400" />
                    </div>
                );
            case 3:
                return (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/20">
                        <Medal className="h-5 w-5 text-orange-500" />
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center w-8 h-8 text-lg font-bold text-muted-foreground">
                        {rank}
                    </div>
                );
        }
    };

    const getChangeIndicator = (change: 'up' | 'down' | 'same', amount: number) => {
        if (change === 'same' || amount === 0) return null;

        return (
            <span className={`text-xs font-medium ${change === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {change === 'up' ? '↑' : '↓'}{amount}
            </span>
        );
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        {title}
                    </CardTitle>
                    <Badge variant="outline">{period}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="points" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="points" className="text-xs sm:text-sm">
                            <Target className="h-4 w-4 mr-1 hidden sm:inline" />
                            Points
                        </TabsTrigger>
                        <TabsTrigger value="wins" className="text-xs sm:text-sm">
                            <Trophy className="h-4 w-4 mr-1 hidden sm:inline" />
                            Wins
                        </TabsTrigger>
                        <TabsTrigger value="streak" className="text-xs sm:text-sm">
                            <Flame className="h-4 w-4 mr-1 hidden sm:inline" />
                            Streak
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="points" className="space-y-2">
                        {[...players].sort((a, b) => b.points - a.points).map((player, index) => (
                            <LeaderboardRow
                                key={player.username}
                                player={{ ...player, rank: index + 1 }}
                                metric={`${player.points} pts`}
                                getRankDisplay={getRankDisplay}
                                getChangeIndicator={getChangeIndicator}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="wins" className="space-y-2">
                        {[...players].sort((a, b) => b.wins - a.wins).map((player, index) => (
                            <LeaderboardRow
                                key={player.username}
                                player={{ ...player, rank: index + 1 }}
                                metric={`${player.wins} wins`}
                                getRankDisplay={getRankDisplay}
                                getChangeIndicator={getChangeIndicator}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="streak" className="space-y-2">
                        {[...players].sort((a, b) => b.streak - a.streak).map((player, index) => (
                            <LeaderboardRow
                                key={player.username}
                                player={{ ...player, rank: index + 1 }}
                                metric={
                                    <span className="flex items-center gap-1">
                                        <Flame className="h-4 w-4 text-orange-500" />
                                        {player.streak}
                                    </span>
                                }
                                getRankDisplay={getRankDisplay}
                                getChangeIndicator={getChangeIndicator}
                            />
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function LeaderboardRow({
    player,
    metric,
    getRankDisplay,
    getChangeIndicator,
}: {
    player: LeaderboardPlayer;
    metric: React.ReactNode;
    getRankDisplay: (rank: number) => React.ReactNode;
    getChangeIndicator: (change: 'up' | 'down' | 'same', amount: number) => React.ReactNode;
}) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${player.rank <= 3 ? 'bg-primary/5' : 'hover:bg-muted/50'
            }`}>
            {getRankDisplay(player.rank)}

            <Avatar className="h-10 w-10">
                <AvatarImage src={player.avatarUrl} alt={player.name} />
                <AvatarFallback className="text-sm">
                    {player.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{player.name}</p>
                    {getChangeIndicator(player.change, player.changeAmount)}
                </div>
                <p className="text-sm text-muted-foreground">@{player.username}</p>
            </div>

            <div className="text-right">
                <div className="font-bold">{metric}</div>
                <div className="text-xs text-muted-foreground">{player.winRate.toFixed(0)}% win</div>
            </div>
        </div>
    );
}

// Demo data
export const demoLeaderboardPlayers: LeaderboardPlayer[] = [
    { rank: 1, name: 'Marcus Chen', username: 'marcusc', wins: 45, winRate: 78.2, streak: 8, points: 1250, change: 'same', changeAmount: 0 },
    { rank: 2, name: 'Sarah Williams', username: 'swilliams', wins: 42, winRate: 75.0, streak: 5, points: 1180, change: 'up', changeAmount: 2 },
    { rank: 3, name: 'Jake Thompson', username: 'jakethompson', wins: 38, winRate: 71.4, streak: 3, points: 1095, change: 'down', changeAmount: 1 },
    { rank: 4, name: 'Emma Davis', username: 'emmad', wins: 35, winRate: 68.6, streak: 12, points: 980, change: 'up', changeAmount: 3 },
    { rank: 5, name: 'Chris Rodriguez', username: 'chrisr', wins: 32, winRate: 65.3, streak: 2, points: 920, change: 'same', changeAmount: 0 },
    { rank: 6, name: 'Alex Kim', username: 'alexkim', wins: 30, winRate: 62.5, streak: 4, points: 875, change: 'up', changeAmount: 1 },
    { rank: 7, name: 'Jordan Lee', username: 'jlee', wins: 28, winRate: 60.9, streak: 1, points: 820, change: 'down', changeAmount: 2 },
    { rank: 8, name: 'Taylor Brown', username: 'tbrown', wins: 25, winRate: 58.1, streak: 6, points: 765, change: 'up', changeAmount: 4 },
];
