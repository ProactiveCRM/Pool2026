'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    onChange?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
    showValue?: boolean;
}

export function StarRating({
    rating,
    onChange,
    size = 'md',
    readonly = false,
    showValue = false,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHoverRating(star)}
                    onMouseLeave={() => !readonly && setHoverRating(0)}
                    className={cn(
                        'transition-colors',
                        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                    )}
                >
                    <Star
                        className={cn(
                            sizes[size],
                            star <= displayRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-muted text-muted-foreground'
                        )}
                    />
                </button>
            ))}
            {showValue && (
                <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
            )}
        </div>
    );
}

// Compact display for cards
interface RatingDisplayProps {
    rating: number;
    count?: number;
    size?: 'sm' | 'md';
}

export function RatingDisplay({ rating, count, size = 'md' }: RatingDisplayProps) {
    return (
        <div className="flex items-center gap-1.5">
            <Star className={cn(
                'fill-yellow-400 text-yellow-400',
                size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
            )} />
            <span className={cn('font-medium', size === 'sm' ? 'text-sm' : 'text-base')}>
                {rating.toFixed(1)}
            </span>
            {count !== undefined && (
                <span className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
                    ({count})
                </span>
            )}
        </div>
    );
}
