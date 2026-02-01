'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { createPromotion } from '@/lib/actions/analytics';
import { PROMOTION_TYPE_LABELS, type PromotionType, type DiscountType } from '@/types/analytics';

interface CreatePromotionFormProps {
    venueId: string;
    venueName: string;
}

export function CreatePromotionForm({ venueId, venueName }: CreatePromotionFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [promotionType, setPromotionType] = useState<PromotionType>('happy_hour');
    const [discountType, setDiscountType] = useState<DiscountType>('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter a promotion name');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createPromotion({
                venue_id: venueId,
                name: name.trim(),
                description: description.trim() || undefined,
                promotion_type: promotionType,
                discount_type: discountValue ? discountType : undefined,
                discount_value: discountValue ? parseFloat(discountValue) : undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                start_time: startTime || undefined,
                end_time: endTime || undefined,
            });

            if (result.success) {
                toast.success('Promotion created!');
                router.push('/venue-dashboard');
            } else {
                toast.error(result.error || 'Failed to create promotion');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link
                    href="/venue-dashboard"
                    className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to dashboard
                </Link>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Tag className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Create Promotion</CardTitle>
                                <CardDescription>
                                    New promotion for {venueName}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Promotion Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Promotion Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Happy Hour Special"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Promotion Type */}
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {(Object.entries(PROMOTION_TYPE_LABELS) as [PromotionType, { label: string; icon: string }][]).map(([type, { label, icon }]) => (
                                        <Button
                                            key={type}
                                            type="button"
                                            variant={promotionType === type ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setPromotionType(type)}
                                            className="justify-start"
                                        >
                                            <span className="mr-2">{icon}</span>
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Discount */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="discountType">Discount Type</Label>
                                    <select
                                        id="discountType"
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="percentage">Percentage Off</option>
                                        <option value="fixed">Fixed Amount Off</option>
                                        <option value="free_hour">Free Hour</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discountValue">
                                        {discountType === 'percentage' ? 'Percentage' : discountType === 'fixed' ? 'Amount ($)' : 'Hours'}
                                    </Label>
                                    <Input
                                        id="discountValue"
                                        type="number"
                                        step={discountType === 'percentage' ? '1' : '0.01'}
                                        min="0"
                                        placeholder={discountType === 'percentage' ? '20' : '5.00'}
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Time Range */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="startTime">Start Time</Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endTime">End Time</Label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Details about this promotion..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Submit */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Tag className="mr-2 h-4 w-4" />
                                        Create Promotion
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
