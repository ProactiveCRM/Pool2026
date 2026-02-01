'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { StarRating } from './StarRating';
import { createReview } from '@/lib/actions/reviews';

interface ReviewFormProps {
    venueId: string;
    venueName: string;
    reservationId?: string;
    onSuccess?: () => void;
}

export function ReviewForm({ venueId, venueName, reservationId, onSuccess }: ReviewFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Ratings
    const [rating, setRating] = useState(0);
    const [ratingTables, setRatingTables] = useState(0);
    const [ratingAtmosphere, setRatingAtmosphere] = useState(0);
    const [ratingService, setRatingService] = useState(0);
    const [ratingValue, setRatingValue] = useState(0);

    // Content
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [visitDate, setVisitDate] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select an overall rating');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createReview({
                venue_id: venueId,
                rating,
                rating_tables: ratingTables || undefined,
                rating_atmosphere: ratingAtmosphere || undefined,
                rating_service: ratingService || undefined,
                rating_value: ratingValue || undefined,
                title: title || undefined,
                content: content || undefined,
                visit_date: visitDate || undefined,
                reservation_id: reservationId,
            });

            if (result.success) {
                toast.success('Review submitted!', {
                    description: reservationId ? 'Your review is verified ✓' : 'Thank you for your feedback',
                });
                onSuccess?.();
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to submit review');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Review {venueName}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Overall Rating */}
                    <div className="space-y-2">
                        <Label className="text-base">Overall Rating *</Label>
                        <StarRating rating={rating} onChange={setRating} size="lg" />
                    </div>

                    {/* Category Ratings */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Tables</Label>
                            <StarRating rating={ratingTables} onChange={setRatingTables} size="sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Atmosphere</Label>
                            <StarRating rating={ratingAtmosphere} onChange={setRatingAtmosphere} size="sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Service</Label>
                            <StarRating rating={ratingService} onChange={setRatingService} size="sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Value</Label>
                            <StarRating rating={ratingValue} onChange={setRatingValue} size="sm" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Review Title</Label>
                        <Input
                            id="title"
                            placeholder="Sum up your experience"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="content">Your Review</Label>
                        <Textarea
                            id="content"
                            placeholder="Share details about your experience..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Visit Date */}
                    <div className="space-y-2">
                        <Label htmlFor="visitDate">When did you visit?</Label>
                        <Input
                            id="visitDate"
                            type="date"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                        />
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit Review
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
