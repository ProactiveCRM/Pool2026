import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HandicapCalculator } from '@/components/scoring/HandicapCalculator';
import { QuickScorer } from '@/components/scoring/QuickScorer';
import { Calculator, Target } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Scoring',
    description: 'Handicap calculator and match scoring tools',
};

export default function ScoringPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Scoring Tools</h1>
                    <p className="text-muted-foreground">
                        Calculate handicaps and keep score during matches
                    </p>
                </div>

                <Tabs defaultValue="scorer" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="scorer" className="gap-2">
                            <Target className="h-4 w-4" />
                            Quick Scorer
                        </TabsTrigger>
                        <TabsTrigger value="handicap" className="gap-2">
                            <Calculator className="h-4 w-4" />
                            Handicap Calc
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="scorer">
                        <QuickScorer
                            player1Name="You"
                            player2Name="Opponent"
                            player1Race={5}
                            player2Race={5}
                            onMatchComplete={(winner, score) => {
                                console.log('Match complete:', winner, score);
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="handicap">
                        <HandicapCalculator
                            onCalculate={(result) => console.log('Handicap:', result)}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
