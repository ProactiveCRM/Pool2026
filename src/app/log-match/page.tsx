import { Metadata } from 'next';
import { MatchLogger } from '@/components/matches/MatchLogger';

export const metadata: Metadata = {
    title: 'Log Match',
    description: 'Record your match results for APA handicap tracking',
};

export default function LogMatchPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-lg">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Log Match</h1>
                    <p className="text-muted-foreground">
                        Record your match for skill level tracking
                    </p>
                </div>

                <MatchLogger
                    yourSkillLevel={5}
                    onSave={(match) => {
                        console.log('Match saved:', match);
                        alert('Match saved successfully!');
                    }}
                />
            </div>
        </div>
    );
}
