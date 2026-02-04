import type { Metadata } from 'next';
import { CoachChat } from '@/components/coach/CoachChat';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
    title: 'AI Pool Coach',
    description: 'Get expert pool tips and strategy advice from your AI-powered coach.',
};

export default function CoachPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                            AI Pool Coach
                            <Badge variant="secondary" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Powered by Gemini
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">
                            Your personal expert for strategy, technique, and game improvement
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Interface */}
            <CoachChat />
        </div>
    );
}
