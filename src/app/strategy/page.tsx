import { Metadata } from 'next';
import { BreakPatternGuide } from '@/components/strategy/BreakPatternGuide';
import { StrategyAssistant } from '@/components/strategy/StrategyAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Strategy',
    description: 'Break patterns and game strategy guides for pool',
};

export default function StrategyPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-lg">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Strategy</h1>
                    <p className="text-muted-foreground">
                        Break patterns and situational game strategy
                    </p>
                </div>

                <Tabs defaultValue="break" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="break" className="gap-2">
                            <Zap className="h-4 w-4" />
                            Break Patterns
                        </TabsTrigger>
                        <TabsTrigger value="strategy" className="gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Game Strategy
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="break">
                        <BreakPatternGuide />
                    </TabsContent>

                    <TabsContent value="strategy">
                        <StrategyAssistant />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
