'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bell,
    Trophy,
    Users,
    Calendar,
    MessageCircle,
    Target,
    Check,
    CheckCheck,
    Trash2,
    Settings
} from 'lucide-react';

interface Notification {
    id: string;
    type: 'match' | 'friend' | 'league' | 'achievement' | 'message' | 'challenge';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    avatar?: string;
    actionUrl?: string;
}

interface NotificationCenterProps {
    notifications: Notification[];
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onDelete?: (id: string) => void;
}

const typeIcons = {
    match: Trophy,
    friend: Users,
    league: Calendar,
    achievement: Target,
    message: MessageCircle,
    challenge: Target,
};

const typeColors = {
    match: 'text-yellow-500',
    friend: 'text-blue-500',
    league: 'text-green-500',
    achievement: 'text-purple-500',
    message: 'text-primary',
    challenge: 'text-orange-500',
};

export function NotificationCenter({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete
}: NotificationCenterProps) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                        {unreadCount > 0 && (
                            <Badge variant="destructive">{unreadCount}</Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onMarkAllAsRead}
                            >
                                <CheckCheck className="h-4 w-4 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unread">
                            Unread
                            {unreadCount > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {unreadCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="space-y-2">
                        {filteredNotifications.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            filteredNotifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={() => onMarkAsRead?.(notification.id)}
                                    onDelete={() => onDelete?.(notification.id)}
                                />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete
}: {
    notification: Notification;
    onMarkAsRead: () => void;
    onDelete: () => void;
}) {
    const Icon = typeIcons[notification.type];

    return (
        <div className={`p-4 rounded-lg transition-colors ${notification.isRead ? 'bg-muted/30' : 'bg-muted/50 border-l-2 border-primary'
            }`}>
            <div className="flex gap-3">
                {notification.avatar ? (
                    <Avatar>
                        <AvatarImage src={notification.avatar} />
                        <AvatarFallback>
                            <Icon className={`h-4 w-4 ${typeColors[notification.type]}`} />
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${typeColors[notification.type]}`} />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <p className={`font-medium ${notification.isRead ? 'text-muted-foreground' : ''}`}>
                        {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    {!notification.isRead && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onMarkAsRead}
                            className="h-8 w-8"
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Demo notifications
export const demoNotifications: Notification[] = [
    {
        id: '1',
        type: 'challenge',
        title: 'New Challenge!',
        message: 'Marcus Chen challenged you to a match',
        timestamp: '5 minutes ago',
        isRead: false,
    },
    {
        id: '2',
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You earned "Hot Streak" - 10 wins in a row',
        timestamp: '1 hour ago',
        isRead: false,
    },
    {
        id: '3',
        type: 'league',
        title: 'Match Reminder',
        message: 'Your league match is tomorrow at 7 PM',
        timestamp: '2 hours ago',
        isRead: false,
    },
    {
        id: '4',
        type: 'friend',
        title: 'Friend Request',
        message: 'Alex Kim wants to be your friend',
        timestamp: '3 hours ago',
        isRead: true,
    },
    {
        id: '5',
        type: 'match',
        title: 'Match Result',
        message: 'Your match vs Sarah Williams has been recorded',
        timestamp: 'Yesterday',
        isRead: true,
    },
    {
        id: '6',
        type: 'message',
        title: 'New Message',
        message: 'Jake Thompson: "Great game last night!"',
        timestamp: 'Yesterday',
        isRead: true,
    },
];
