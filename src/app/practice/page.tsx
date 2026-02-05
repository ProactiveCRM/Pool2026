import { Metadata } from 'next';
import { PracticeDrills, demoDrills } from '@/components/practice/PracticeDrills';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Clock, Flame, Trophy } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Practice Mode',
    description: 'Improve your skills with guided practice drills',
};

export default function PracticePage() {
    // Demo stats
    const practiceStats = {
        totalDrills: 44,
        totalMinutes: 520,
        currentStreak: 5,
        longestStreak: 12,
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Practice Mode</h1>
                    <p className="text-muted-foreground">
                        Sharpen your skills with structured drills and track your progress
                    </p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Target className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold">{practiceStats.totalDrills}</p>
                                    <p className="text-sm text-muted-foreground">Drills Done</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Clock className="h-8 w-8 text-primary" />
                                <div>
                                    <p className="text-2xl font-bold">{practiceStats.totalMinutes}</p>
                                    <p className="text-sm text-muted-foreground">Minutes</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Flame className="h-8 w-8 text-orange-500" />
                                <div>
                                    <p className="text-2xl font-bold">{practiceStats.currentStreak}</p>
                                    <p className="text-sm text-muted-foreground">Day Streak</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <p className="text-2xl font-bold">{practiceStats.longestStreak}</p>
                                    <p className="text-sm text-muted-foreground">Best Streak</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Practice Drills */}
                <PracticeDrills
                    drills={demoDrills}
                    weeklyGoal={10}
                    weeklyCompleted={6}
                />
            </div>
        </div>
    );
}
