'use client';

import { NotificationCenter, demoNotifications } from '@/components/notifications/NotificationCenter';

export default function NotificationsPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Notifications</h1>
                    <p className="text-muted-foreground">
                        Stay up to date with your matches, friends, and achievements
                    </p>
                </div>

                <NotificationCenter
                    notifications={demoNotifications}
                    onMarkAsRead={(id) => console.log('Mark as read:', id)}
                    onMarkAllAsRead={() => console.log('Mark all as read')}
                    onDelete={(id) => console.log('Delete:', id)}
                />
            </div>
        </div>
    );
}

