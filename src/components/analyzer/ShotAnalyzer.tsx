'use client';

import { useState } from 'react';
import { CameraCapture } from '@/components/analyzer/CameraCapture';
import { AnalysisResults } from '@/components/analyzer/AnalysisResults';
import { analyzePoolTable, AnalysisResult } from '@/lib/actions/analyze-shot';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export function ShotAnalyzer() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const handleCapture = async (imageData: string) => {
        setIsAnalyzing(true);
        setCapturedImage(imageData);
        setResult(null);

        try {
            const analysisResult = await analyzePoolTable(imageData);

            if (analysisResult.success) {
                setResult(analysisResult);
                toast.success('Analysis complete!');
            } else {
                toast.error(analysisResult.error || 'Failed to analyze image');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error('Failed to analyze image. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const reset = () => {
        setResult(null);
        setCapturedImage(null);
    };

    return (
        <div className="space-y-6">
            {/* Show camera if no result yet */}
            {!result && (
                <CameraCapture onCapture={handleCapture} isAnalyzing={isAnalyzing} />
            )}

            {/* Show results */}
            {result && capturedImage && (
                <>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={reset} className="gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Analyze Another
                        </Button>
                    </div>
                    <AnalysisResults result={result} imageUrl={capturedImage} />
                </>
            )}

            {/* Tips */}
            {!result && !isAnalyzing && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Tips for best results
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Position camera directly above or at a slight angle</li>
                        <li>• Ensure good lighting on the table</li>
                        <li>• Include the entire table in the frame</li>
                        <li>• Avoid shadows covering the balls</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
