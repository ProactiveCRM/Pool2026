'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bell, Mail, Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    type NotificationPreferences
} from '@/lib/actions/notifications';

export default function NotificationSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);

    useEffect(() => {
        async function load() {
            const data = await getNotificationPreferences();
            setPrefs(data);
            setIsLoading(false);
        }
        load();
    }, []);

    const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
        if (!prefs) return;

        setPrefs({ ...prefs, [key]: value });
        setIsSaving(true);

        const result = await updateNotificationPreferences({ [key]: value });

        if (!result.success) {
            // Revert on failure
            setPrefs({ ...prefs, [key]: !value });
            toast.error('Failed to update setting');
        }

        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!prefs) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="text-center p-8">
                    <CardContent>
                        <p>Please sign in to manage notifications</p>
                        <Button asChild className="mt-4">
                            <Link href="/auth">Sign In</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link
                    href="/profile"
                    className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to profile
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Notification Settings</h1>
                        <p className="text-muted-foreground">Manage how we communicate with you</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Email Notifications */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Email Notifications</CardTitle>
                            </div>
                            <CardDescription>
                                Choose which emails you&apos;d like to receive
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email_reservation_confirmed" className="flex-1">
                                    <span className="font-medium">Reservation confirmed</span>
                                    <p className="text-sm text-muted-foreground">
                                        When your table booking is confirmed
                                    </p>
                                </Label>
                                <Switch
                                    id="email_reservation_confirmed"
                                    checked={prefs.email_reservation_confirmed}
                                    onCheckedChange={(v) => handleToggle('email_reservation_confirmed', v)}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="email_reservation_reminder" className="flex-1">
                                    <span className="font-medium">Reservation reminders</span>
                                    <p className="text-sm text-muted-foreground">
                                        Reminder before your upcoming reservation
                                    </p>
                                </Label>
                                <Switch
                                    id="email_reservation_reminder"
                                    checked={prefs.email_reservation_reminder}
                                    onCheckedChange={(v) => handleToggle('email_reservation_reminder', v)}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="email_league_updates" className="flex-1">
                                    <span className="font-medium">League updates</span>
                                    <p className="text-sm text-muted-foreground">
                                        Standings, schedule changes, announcements
                                    </p>
                                </Label>
                                <Switch
                                    id="email_league_updates"
                                    checked={prefs.email_league_updates}
                                    onCheckedChange={(v) => handleToggle('email_league_updates', v)}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="email_match_reminders" className="flex-1">
                                    <span className="font-medium">Match reminders</span>
                                    <p className="text-sm text-muted-foreground">
                                        Upcoming league match notifications
                                    </p>
                                </Label>
                                <Switch
                                    id="email_match_reminders"
                                    checked={prefs.email_match_reminders}
                                    onCheckedChange={(v) => handleToggle('email_match_reminders', v)}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="email_review_responses" className="flex-1">
                                    <span className="font-medium">Review responses</span>
                                    <p className="text-sm text-muted-foreground">
                                        When a venue responds to your review
                                    </p>
                                </Label>
                                <Switch
                                    id="email_review_responses"
                                    checked={prefs.email_review_responses}
                                    onCheckedChange={(v) => handleToggle('email_review_responses', v)}
                                    disabled={isSaving}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="email_promotions" className="flex-1">
                                    <span className="font-medium">Promotions & offers</span>
                                    <p className="text-sm text-muted-foreground">
                                        Special deals from your favorite venues
                                    </p>
                                </Label>
                                <Switch
                                    id="email_promotions"
                                    checked={prefs.email_promotions}
                                    onCheckedChange={(v) => handleToggle('email_promotions', v)}
                                    disabled={isSaving}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Push Notifications */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">Push Notifications</CardTitle>
                            </div>
                            <CardDescription>
                                Get notified on your device
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="push_enabled" className="flex-1">
                                    <span className="font-medium">Enable push notifications</span>
                                    <p className="text-sm text-muted-foreground">
                                        Allow notifications on this device
                                    </p>
                                </Label>
                                <Switch
                                    id="push_enabled"
                                    checked={prefs.push_enabled}
                                    onCheckedChange={(v) => handleToggle('push_enabled', v)}
                                    disabled={isSaving}
                                />
                            </div>

                            {prefs.push_enabled && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="push_reservation_updates" className="flex-1">
                                            <span className="font-medium">Reservation updates</span>
                                            <p className="text-sm text-muted-foreground">
                                                Status changes for your bookings
                                            </p>
                                        </Label>
                                        <Switch
                                            id="push_reservation_updates"
                                            checked={prefs.push_reservation_updates}
                                            onCheckedChange={(v) => handleToggle('push_reservation_updates', v)}
                                            disabled={isSaving}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="push_match_reminders" className="flex-1">
                                            <span className="font-medium">Match reminders</span>
                                            <p className="text-sm text-muted-foreground">
                                                30 minutes before your league match
                                            </p>
                                        </Label>
                                        <Switch
                                            id="push_match_reminders"
                                            checked={prefs.push_match_reminders}
                                            onCheckedChange={(v) => handleToggle('push_match_reminders', v)}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
