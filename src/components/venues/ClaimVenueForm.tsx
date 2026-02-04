'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClaim } from '@/lib/actions/claims';

interface ClaimVenueFormProps {
    venueId: string;
    venueName: string;
    venueCity: string;
    venueState: string;
}

export function ClaimVenueForm({ venueId, venueName, venueCity, venueState }: ClaimVenueFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Form state
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [businessRole, setBusinessRole] = useState<'owner' | 'manager' | 'employee'>('owner');
    const [proofType, setProofType] = useState<'ownership_doc' | 'utility_bill' | 'business_card' | 'other'>('ownership_doc');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userName.trim() || !userEmail.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createClaim({
                venue_id: venueId,
                user_name: userName.trim(),
                user_email: userEmail.trim(),
                user_phone: userPhone.trim() || undefined,
                business_role: businessRole,
                proof_type: proofType,
                proof_url: 'pending',
            });

            if (result.success) {
                setIsSubmitted(true);
                toast.success('Claim submitted successfully!');
            } else {
                toast.error(result.error || 'Failed to submit claim');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md text-center">
                    <CardContent className="pt-8 pb-6">
                        <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Claim Submitted!</h2>
                        <p className="text-muted-foreground mb-6">
                            We&apos;ll review your claim for <strong>{venueName}</strong> and get back to you within 2-3 business days.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button asChild>
                                <Link href={`/venues`}>Browse Venues</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/profile">View My Claims</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link
                    href={`/venues`}
                    className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to venues
                </Link>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Claim This Venue</CardTitle>
                                <CardDescription>
                                    {venueName} • {venueCity}, {venueState}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="font-medium">Contact Information</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="userName">Full Name *</Label>
                                    <Input
                                        id="userName"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="userEmail">Email *</Label>
                                    <Input
                                        id="userEmail"
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => setUserEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="userPhone">Phone (optional)</Label>
                                    <Input
                                        id="userPhone"
                                        type="tel"
                                        value={userPhone}
                                        onChange={(e) => setUserPhone(e.target.value)}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>

                            {/* Role */}
                            <div className="space-y-3">
                                <Label>Your Role at This Venue *</Label>
                                <RadioGroup value={businessRole} onValueChange={(v) => setBusinessRole(v as typeof businessRole)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="owner" id="owner" />
                                        <Label htmlFor="owner" className="font-normal">Owner</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="manager" id="manager" />
                                        <Label htmlFor="manager" className="font-normal">Manager</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="employee" id="employee" />
                                        <Label htmlFor="employee" className="font-normal">Employee</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Verification */}
                            <div className="space-y-3">
                                <Label>How would you like to verify ownership?</Label>
                                <RadioGroup value={proofType} onValueChange={(v) => setProofType(v as typeof proofType)}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="ownership_doc" id="ownership_doc" />
                                        <Label htmlFor="ownership_doc" className="font-normal">Ownership Document</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="utility_bill" id="utility_bill" />
                                        <Label htmlFor="utility_bill" className="font-normal">Utility Bill</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="business_card" id="business_card" />
                                        <Label htmlFor="business_card" className="font-normal">Business Card</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="other" id="other" />
                                        <Label htmlFor="other" className="font-normal">Other</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Notice */}
                            <div className="bg-muted/50 rounded-lg p-4 text-sm">
                                <p className="text-muted-foreground">
                                    By submitting this claim, you confirm that you are authorized to manage this venue&apos;s listing on RackCity. We&apos;ll verify your claim and get back to you within 2-3 business days.
                                </p>
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
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Submit Claim
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
