'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Settings,
    Bell,
    Moon,
    Sun,
    Globe,
    Shield,
    User,
    Palette,
    Volume2,
    Eye,
    Smartphone
} from 'lucide-react';

interface SettingsSection {
    title: string;
    description: string;
    icon: React.ReactNode;
    settings: Setting[];
}

interface Setting {
    id: string;
    label: string;
    description?: string;
    type: 'toggle' | 'select';
    value: boolean | string;
}

interface UserSettingsProps {
    onSave?: (settings: Record<string, boolean | string>) => void;
}

export function UserSettings({ onSave }: UserSettingsProps) {
    const [settings, setSettings] = useState<Record<string, boolean | string>>({
        darkMode: true,
        notifications: true,
        emailNotifications: false,
        pushNotifications: true,
        matchReminders: true,
        friendRequests: true,
        leagueUpdates: true,
        achievementAlerts: true,
        soundEffects: true,
        showOnlineStatus: true,
        showMatchHistory: true,
        allowChallenges: true,
    });

    const updateSetting = (key: string, value: boolean | string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onSave?.(settings);
    };

    const sections: SettingsSection[] = [
        {
            title: 'Appearance',
            description: 'Customize how RackCity looks',
            icon: <Palette className="h-5 w-5" />,
            settings: [
                { id: 'darkMode', label: 'Dark Mode', description: 'Use dark theme', type: 'toggle', value: settings.darkMode },
            ],
        },
        {
            title: 'Notifications',
            description: 'Control what notifications you receive',
            icon: <Bell className="h-5 w-5" />,
            settings: [
                { id: 'notifications', label: 'Enable Notifications', type: 'toggle', value: settings.notifications },
                { id: 'emailNotifications', label: 'Email Notifications', type: 'toggle', value: settings.emailNotifications },
                { id: 'pushNotifications', label: 'Push Notifications', type: 'toggle', value: settings.pushNotifications },
                { id: 'matchReminders', label: 'Match Reminders', description: 'Get notified before scheduled matches', type: 'toggle', value: settings.matchReminders },
                { id: 'friendRequests', label: 'Friend Request Alerts', type: 'toggle', value: settings.friendRequests },
                { id: 'leagueUpdates', label: 'League Updates', description: 'Standings changes, schedule updates', type: 'toggle', value: settings.leagueUpdates },
                { id: 'achievementAlerts', label: 'Achievement Alerts', type: 'toggle', value: settings.achievementAlerts },
            ],
        },
        {
            title: 'Privacy',
            description: 'Control your profile visibility',
            icon: <Shield className="h-5 w-5" />,
            settings: [
                { id: 'showOnlineStatus', label: 'Show Online Status', description: 'Let friends see when you\'re online', type: 'toggle', value: settings.showOnlineStatus },
                { id: 'showMatchHistory', label: 'Public Match History', description: 'Let others view your matches', type: 'toggle', value: settings.showMatchHistory },
                { id: 'allowChallenges', label: 'Allow Challenges', description: 'Let friends challenge you to matches', type: 'toggle', value: settings.allowChallenges },
            ],
        },
        {
            title: 'Sound',
            description: 'Audio preferences',
            icon: <Volume2 className="h-5 w-5" />,
            settings: [
                { id: 'soundEffects', label: 'Sound Effects', description: 'Play sounds for notifications and actions', type: 'toggle', value: settings.soundEffects },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            {sections.map((section, index) => (
                <Card key={section.title}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            {section.icon}
                            {section.title}
                        </CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {section.settings.map((setting, settingIndex) => (
                            <div key={setting.id}>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor={setting.id}>{setting.label}</Label>
                                        {setting.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {setting.description}
                                            </p>
                                        )}
                                    </div>
                                    {setting.type === 'toggle' && (
                                        <Switch
                                            id={setting.id}
                                            checked={setting.value as boolean}
                                            onCheckedChange={(checked) => updateSetting(setting.id, checked)}
                                        />
                                    )}
                                </div>
                                {settingIndex < section.settings.length - 1 && (
                                    <Separator className="mt-4" />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            <Button onClick={handleSave} className="w-full">
                Save Settings
            </Button>
        </div>
    );
}
