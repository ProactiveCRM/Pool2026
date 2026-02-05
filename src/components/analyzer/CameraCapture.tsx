'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, X, RotateCcw, Loader2 } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (imageData: string) => void;
    isAnalyzing: boolean;
}

export function CameraCapture({ onCapture, isAnalyzing }: CameraCaptureProps) {
    const [mode, setMode] = useState<'idle' | 'camera' | 'preview'>('idle');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startCamera = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setMode('camera');
        } catch (err) {
            console.error('Camera error:', err);
            setError('Could not access camera. Please allow camera permissions or upload an image.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        setPreviewImage(imageData);
        setMode('preview');
        stopCamera();
    }, [stopCamera]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target?.result as string;
            setPreviewImage(imageData);
            setMode('preview');
        };
        reader.readAsDataURL(file);
    };

    const reset = () => {
        setPreviewImage(null);
        setMode('idle');
        setError(null);
        stopCamera();
    };

    const analyze = () => {
        if (previewImage) {
            onCapture(previewImage);
        }
    };

    return (
        <Card className="p-6">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Idle State */}
            {mode === 'idle' && (
                <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Capture Pool Table</h3>
                                <p className="text-sm text-muted-foreground">
                                    Take a photo or upload an image of the table
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={startCamera} className="gap-2">
                            <Camera className="w-4 h-4" />
                            Open Camera
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Image
                        </Button>
                    </div>
                </div>
            )}

            {/* Camera Mode */}
            {mode === 'camera' && (
                <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {/* Table overlay guide */}
                        <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg pointer-events-none" />
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
                            Align table within frame
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={reset} className="gap-2">
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button onClick={capturePhoto} className="gap-2">
                            <Camera className="w-4 h-4" />
                            Capture
                        </Button>
                    </div>
                </div>
            )}

            {/* Preview Mode */}
            {mode === 'preview' && previewImage && (
                <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                            src={previewImage}
                            alt="Captured table"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={reset} className="gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Retake
                        </Button>
                        <Button
                            onClick={analyze}
                            disabled={isAnalyzing}
                            className="gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                'Analyze Shot'
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
