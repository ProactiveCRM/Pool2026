import { Metadata } from 'next';
import { GameRules } from '@/components/rules/GameRules';

export const metadata: Metadata = {
    title: 'Game Rules',
    description: 'Learn the rules for 8-ball, 9-ball, and 10-ball pool',
};

export default function RulesPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Game Rules</h1>
                    <p className="text-muted-foreground">
                        Learn the official rules for popular pool games
                    </p>
                </div>

                <GameRules />
            </div>
        </div>
    );
}
