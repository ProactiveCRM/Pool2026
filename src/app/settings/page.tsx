'use client';

import { UserSettings } from '@/components/settings/UserSettings';

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-muted-foreground">
                        Customize your preferences and manage your account
                    </p>
                </div>

                <UserSettings
                    onSave={(settings) => console.log('Settings saved:', settings)}
                />
            </div>
        </div>
    );
}

