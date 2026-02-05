import type { Metadata } from 'next';
import { ShotAnalyzer } from '@/components/analyzer/ShotAnalyzer';
import { Badge } from '@/components/ui/badge';
import { Camera, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Shot Analyzer',
    description: 'Upload a photo of your pool table and get AI-powered shot suggestions.',
};

export default function AnalyzerPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                            Shot Analyzer
                            <Badge variant="secondary" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Vision
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">
                            Snap a photo, get instant shot suggestions
                        </p>
                    </div>
                </div>
            </div>

            {/* Analyzer */}
            <ShotAnalyzer />
        </div>
    );
}
