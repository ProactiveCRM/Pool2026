'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Play,
    Pause,
    RotateCcw,
    Clock,
    DollarSign,
    AlertTriangle
} from 'lucide-react';

interface TableTimerProps {
    hourlyRate?: number;
    warningMinutes?: number;
    onTimeUpdate?: (minutes: number, cost: number) => void;
}

export function TableTimer({
    hourlyRate = 12,
    warningMinutes = 55,
    onTimeUpdate
}: TableTimerProps) {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    useEffect(() => {
        const minutes = Math.floor(seconds / 60);
        const cost = (seconds / 3600) * hourlyRate;
        onTimeUpdate?.(minutes, cost);
    }, [seconds, hourlyRate, onTimeUpdate]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatCost = (totalSeconds: number) => {
        const cost = (totalSeconds / 3600) * hourlyRate;
        return cost.toFixed(2);
    };

    const handleStart = () => {
        if (!startTime) {
            setStartTime(new Date());
        }
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleReset = () => {
        setSeconds(0);
        setIsRunning(false);
        setStartTime(null);
    };

    const minutes = Math.floor(seconds / 60);
    const isWarning = minutes >= warningMinutes && minutes < 60;
    const isOverHour = minutes >= 60;
    const currentHour = Math.floor(minutes / 60) + 1;

    return (
        <Card className={`overflow-hidden ${isWarning ? 'border-yellow-500' : ''} ${isOverHour ? 'border-red-500' : ''}`}>
            <CardHeader className={`${isOverHour ? 'bg-red-500/10' : isWarning ? 'bg-yellow-500/10' : 'bg-muted/50'}`}>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Table Timer
                    </div>
                    {startTime && (
                        <Badge variant="outline" className="font-normal">
                            Started {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {/* Main Timer Display */}
                <div className="text-center mb-6">
                    <div className={`text-6xl font-mono font-bold mb-2 ${isOverHour ? 'text-red-500' : isWarning ? 'text-yellow-500' : ''
                        }`}>
                        {formatTime(seconds)}
                    </div>

                    {/* Warning Messages */}
                    {isWarning && !isOverHour && (
                        <div className="flex items-center justify-center gap-2 text-yellow-500 animate-pulse">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {60 - minutes} minutes until next hour
                            </span>
                        </div>
                    )}
                    {isOverHour && (
                        <div className="flex items-center justify-center gap-2 text-red-500">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Hour {currentHour} in progress
                            </span>
                        </div>
                    )}
                </div>

                {/* Cost Display */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-muted text-center">
                        <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-500" />
                        <p className="text-2xl font-bold">${formatCost(seconds)}</p>
                        <p className="text-xs text-muted-foreground">Current Cost</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted text-center">
                        <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">${hourlyRate}/hr</p>
                        <p className="text-xs text-muted-foreground">Table Rate</p>
                    </div>
                </div>

                {/* Hour Breakdown */}
                {seconds > 0 && (
                    <div className="mb-6 p-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium mb-2">Session Breakdown</p>
                        <div className="flex gap-2 flex-wrap">
                            {Array.from({ length: Math.ceil(seconds / 3600) }).map((_, i) => {
                                const hourSeconds = Math.min(
                                    3600,
                                    i === Math.floor(seconds / 3600) ? seconds % 3600 || 3600 : 3600
                                );
                                const hourCost = (hourSeconds / 3600) * hourlyRate;
                                const isCurrentHour = i === Math.floor(seconds / 3600);

                                return (
                                    <Badge
                                        key={i}
                                        variant={isCurrentHour ? 'default' : 'secondary'}
                                        className="text-xs"
                                    >
                                        Hr {i + 1}: ${hourCost.toFixed(2)}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-3">
                    {!isRunning ? (
                        <Button
                            onClick={handleStart}
                            className="flex-1"
                            variant={seconds > 0 ? 'outline' : 'default'}
                        >
                            <Play className="h-4 w-4 mr-2" />
                            {seconds > 0 ? 'Resume' : 'Start'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handlePause}
                            className="flex-1"
                            variant="outline"
                        >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                        </Button>
                    )}
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        disabled={seconds === 0}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
