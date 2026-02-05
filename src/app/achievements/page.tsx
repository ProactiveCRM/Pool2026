import { Metadata } from 'next';
import { AchievementSystem, demoAchievements } from '@/components/player/AchievementSystem';

export const metadata: Metadata = {
    title: 'Achievements',
    description: 'Track your pool achievements and unlock rewards',
};

export default function AchievementsPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Achievements</h1>
                    <p className="text-muted-foreground">
                        Track your progress and unlock achievements as you play
                    </p>
                </div>

                <AchievementSystem
                    achievements={demoAchievements}
                    totalPoints={1450}
                    level={12}
                />
            </div>
        </div>
    );
}
