'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, CheckCircle, FileText } from 'lucide-react';
import {
    claimCreateSchema,
    type ClaimCreateInput,
    BUSINESS_ROLES,
    PROOF_TYPES,
} from '@/lib/validations/claim';
import { createClaim } from '@/lib/actions/claims';

interface ClaimFormProps {
    venueId: string;
    venueName: string;
    userEmail: string;
}

export function ClaimForm({ venueId, venueName, userEmail }: ClaimFormProps) {
    const router = useRouter();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ClaimCreateInput>({
        resolver: zodResolver(claimCreateSchema),
        defaultValues: {
            venue_id: venueId,
            user_name: '',
            user_email: userEmail,
            user_phone: '',
            business_role: undefined,
            proof_type: undefined,
            proof_url: '',
        },
    });

    async function onSubmit(data: ClaimCreateInput) {
        setIsSubmitting(true);
        try {
            const result = await createClaim(data);

            if (result.success) {
                setIsSubmitted(true);
                toast.success('Claim submitted successfully!');
            } else {
                toast.error(result.error || 'Failed to submit claim');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSubmitted) {
        return (
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardContent className="py-12 text-center">
                    <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Claim Submitted!</h2>
                    <p className="text-muted-foreground mb-6">
                        Thank you for submitting your claim for {venueName}. Our team will review it within 2-3 business days.
                    </p>
                    <Button onClick={() => router.push('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Claim Request Form
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>

                            <FormField
                                control={form.control}
                                name="user_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Smith" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="user_email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="user_phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone (optional)</FormLabel>
                                            <FormControl>
                                                <Input type="tel" placeholder="(555) 123-4567" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Business Relationship */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Business Relationship</h3>

                            <FormField
                                control={form.control}
                                name="business_role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {BUSINESS_ROLES.map((role) => (
                                                    <SelectItem key={role.value} value={role.value}>
                                                        {role.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Proof of Ownership */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Proof of Ownership</h3>

                            <FormField
                                control={form.control}
                                name="proof_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type of Proof</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select proof type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {PROOF_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="proof_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proof Document URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="url"
                                                placeholder="https://drive.google.com/..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Upload your document to Google Drive, Dropbox, or another file sharing service and paste the link here.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Claim Request
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
