'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
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
import { Send, CheckCircle } from 'lucide-react';
import { leadCreateSchema, type LeadCreateInput, LEAD_TYPES } from '@/lib/validations/lead';
import { createLead } from '@/lib/actions/leads';

interface InquiryFormProps {
    venueId: string;
    venueName: string;
}

export function InquiryForm({ venueId, venueName }: InquiryFormProps) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<LeadCreateInput>({
        resolver: zodResolver(leadCreateSchema),
        defaultValues: {
            venue_id: venueId,
            name: '',
            email: '',
            phone: '',
            message: '',
            lead_type: 'inquiry',
        },
    });

    async function onSubmit(data: LeadCreateInput) {
        setIsSubmitting(true);
        try {
            const result = await createLead(data);

            if (result.success) {
                setIsSubmitted(true);
                toast.success('Inquiry sent successfully!');
            } else {
                toast.error(result.error || 'Failed to send inquiry');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSubmitted) {
        return (
            <Card className="bg-card/50 border-primary/20">
                <CardContent className="py-8 text-center">
                    <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Inquiry Sent!</h3>
                    <p className="text-muted-foreground">
                        Thank you for your interest in {venueName}. They will be in touch soon.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50 border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Contact {venueName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
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

                        <FormField
                            control={form.control}
                            name="lead_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Inquiry Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {LEAD_TYPES.map((type) => (
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
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us what you're looking for..."
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
