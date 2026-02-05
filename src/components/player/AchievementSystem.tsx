'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Trophy,
    Target,
    Flame,
    Star,
    Zap,
    Award,
    Crown,
    Shield,
    Gem,
    Medal
} from 'lucide-react';

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: 'trophy' | 'target' | 'flame' | 'star' | 'zap' | 'award' | 'crown' | 'shield' | 'gem' | 'medal';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    progress?: number;
    maxProgress?: number;
    unlockedAt?: string;
    isUnlocked: boolean;
}

interface AchievementSystemProps {
    achievements: Achievement[];
    totalPoints?: number;
    level?: number;
}

const iconMap = {
    trophy: Trophy,
    target: Target,
    flame: Flame,
    star: Star,
    zap: Zap,
    award: Award,
    crown: Crown,
    shield: Shield,
    gem: Gem,
    medal: Medal,
};

const rarityColors = {
    common: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' },
    rare: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
    epic: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
    legendary: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
};

export function AchievementSystem({ achievements, totalPoints = 0, level = 1 }: AchievementSystemProps) {
    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    const completionRate = (unlockedCount / achievements.length) * 100;

    const groupedAchievements = {
        legendary: achievements.filter(a => a.rarity === 'legendary'),
        epic: achievements.filter(a => a.rarity === 'epic'),
        rare: achievements.filter(a => a.rarity === 'rare'),
        common: achievements.filter(a => a.rarity === 'common'),
    };

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-3xl font-bold text-primary">{level}</div>
                            <div className="text-sm text-muted-foreground">Level</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{unlockedCount}/{achievements.length}</div>
                            <div className="text-sm text-muted-foreground">Unlocked</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-yellow-500">{totalPoints}</div>
                            <div className="text-sm text-muted-foreground">Points</div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Completion</span>
                            <span>{completionRate.toFixed(0)}%</span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Achievement Groups */}
            {Object.entries(groupedAchievements).map(([rarity, items]) => (
                items.length > 0 && (
                    <Card key={rarity}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 capitalize">
                                <Gem className={`h-5 w-5 ${rarityColors[rarity as keyof typeof rarityColors].text}`} />
                                {rarity} Achievements
                                <Badge variant="outline" className="ml-auto">
                                    {items.filter(a => a.isUnlocked).length}/{items.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {items.map(achievement => (
                                    <AchievementCard key={achievement.id} achievement={achievement} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )
            ))}
        </div>
    );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
    const Icon = iconMap[achievement.icon];
    const colors = rarityColors[achievement.rarity];
    const hasProgress = achievement.progress !== undefined && achievement.maxProgress !== undefined;
    const progressPercent = hasProgress
        ? (achievement.progress! / achievement.maxProgress!) * 100
        : 0;

    return (
        <div className={`p-4 rounded-lg border ${colors.border} ${achievement.isUnlocked ? colors.bg : 'bg-muted/30 opacity-60'
            } transition-all hover:opacity-100`}>
            <div className="flex gap-3">
                <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${achievement.isUnlocked ? colors.text : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">{achievement.name}</h4>
                        {achievement.isUnlocked && (
                            <Badge className={`${colors.bg} ${colors.text} text-xs`}>✓</Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>

                    {hasProgress && !achievement.isUnlocked && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <Progress value={progressPercent} className="h-1.5" />
                        </div>
                    )}

                    {achievement.unlockedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Unlocked {achievement.unlockedAt}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Demo achievements
export const demoAchievements: Achievement[] = [
    // Legendary
    { id: '1', name: 'Grand Champion', description: 'Win a league championship', icon: 'crown', rarity: 'legendary', isUnlocked: false, progress: 0, maxProgress: 1 },
    { id: '2', name: 'Perfect Season', description: 'Win every match in a season', icon: 'gem', rarity: 'legendary', isUnlocked: false },

    // Epic
    { id: '3', name: 'Hot Streak', description: 'Win 10 matches in a row', icon: 'flame', rarity: 'epic', isUnlocked: true, unlockedAt: 'Jan 15, 2026' },
    { id: '4', name: 'Tournament Victor', description: 'Win a tournament', icon: 'trophy', rarity: 'epic', isUnlocked: false, progress: 2, maxProgress: 3 },
    { id: '5', name: 'Centurion', description: 'Play 100 matches', icon: 'shield', rarity: 'epic', isUnlocked: true, unlockedAt: 'Dec 20, 2025' },

    // Rare
    { id: '6', name: 'Sharpshooter', description: 'Make 50 break & runs', icon: 'target', rarity: 'rare', isUnlocked: true, unlockedAt: 'Jan 8, 2026' },
    { id: '7', name: 'Rising Star', description: 'Reach top 10 in leaderboard', icon: 'star', rarity: 'rare', isUnlocked: true, unlockedAt: 'Jan 12, 2026' },
    { id: '8', name: 'Quick Draw', description: 'Win 5 matches under 15 minutes', icon: 'zap', rarity: 'rare', isUnlocked: false, progress: 3, maxProgress: 5 },

    // Common
    { id: '9', name: 'First Win', description: 'Win your first match', icon: 'medal', rarity: 'common', isUnlocked: true, unlockedAt: 'Nov 1, 2025' },
    { id: '10', name: 'Team Player', description: 'Join a team', icon: 'award', rarity: 'common', isUnlocked: true, unlockedAt: 'Nov 5, 2025' },
    { id: '11', name: 'Regular', description: 'Play 10 matches', icon: 'target', rarity: 'common', isUnlocked: true, unlockedAt: 'Nov 15, 2025' },
    { id: '12', name: 'Consistent', description: 'Play matches 4 weeks in a row', icon: 'flame', rarity: 'common', isUnlocked: true, unlockedAt: 'Nov 22, 2025' },
];
