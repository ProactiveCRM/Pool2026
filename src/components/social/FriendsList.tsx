'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    Users,
    UserPlus,
    MessageCircle,
    Trophy,
    Target,
    Search,
    Circle,
    Clock
} from 'lucide-react';
import { useState } from 'react';

interface Friend {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    status: 'online' | 'offline' | 'playing';
    winRate: number;
    lastActive?: string;
    mutualFriends?: number;
}

interface FriendsListProps {
    friends: Friend[];
    pendingRequests?: Friend[];
    suggestions?: Friend[];
    onChallenge?: (friend: Friend) => void;
    onMessage?: (friend: Friend) => void;
    onAddFriend?: (friend: Friend) => void;
}

const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    playing: 'bg-yellow-500',
};

const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    playing: 'In a match',
};

export function FriendsList({
    friends,
    pendingRequests = [],
    suggestions = [],
    onChallenge,
    onMessage,
    onAddFriend
}: FriendsListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onlineFriends = filteredFriends.filter(f => f.status !== 'offline');
    const offlineFriends = filteredFriends.filter(f => f.status === 'offline');

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Friend Requests
                            <Badge variant="destructive" className="ml-auto">
                                {pendingRequests.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {pendingRequests.map(friend => (
                            <FriendRequestCard
                                key={friend.id}
                                friend={friend}
                                onAccept={() => onAddFriend?.(friend)}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Online Friends */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                        Online Now
                        <span className="text-muted-foreground font-normal">
                            ({onlineFriends.length})
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {onlineFriends.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No friends online
                        </p>
                    ) : (
                        onlineFriends.map(friend => (
                            <FriendCard
                                key={friend.id}
                                friend={friend}
                                onChallenge={() => onChallenge?.(friend)}
                                onMessage={() => onMessage?.(friend)}
                            />
                        ))
                    )}
                </CardContent>
            </Card>

            {/* Offline Friends */}
            {offlineFriends.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
                            Offline
                            <span className="text-muted-foreground font-normal">
                                ({offlineFriends.length})
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {offlineFriends.map(friend => (
                            <FriendCard
                                key={friend.id}
                                friend={friend}
                                onMessage={() => onMessage?.(friend)}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            People You May Know
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {suggestions.map(friend => (
                            <SuggestionCard
                                key={friend.id}
                                friend={friend}
                                onAdd={() => onAddFriend?.(friend)}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function FriendCard({
    friend,
    onChallenge,
    onMessage
}: {
    friend: Friend;
    onChallenge?: () => void;
    onMessage?: () => void;
}) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="relative">
                <Avatar>
                    <AvatarImage src={friend.avatarUrl} />
                    <AvatarFallback>
                        {friend.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${statusColors[friend.status]}`} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{friend.name}</p>
                <p className="text-xs text-muted-foreground">
                    {friend.status === 'playing' ? (
                        <span className="text-yellow-500">🎱 In a match</span>
                    ) : friend.status === 'online' ? (
                        <span className="text-green-500">● Online</span>
                    ) : (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {friend.lastActive}
                        </span>
                    )}
                </p>
            </div>

            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={onMessage}>
                    <MessageCircle className="h-4 w-4" />
                </Button>
                {friend.status !== 'offline' && onChallenge && (
                    <Button variant="ghost" size="icon" onClick={onChallenge}>
                        <Target className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function FriendRequestCard({
    friend,
    onAccept
}: {
    friend: Friend;
    onAccept: () => void;
}) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <Avatar>
                <AvatarImage src={friend.avatarUrl} />
                <AvatarFallback>
                    {friend.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{friend.name}</p>
                <p className="text-xs text-muted-foreground">
                    {friend.mutualFriends} mutual friends
                </p>
            </div>

            <div className="flex gap-2">
                <Button size="sm" onClick={onAccept}>Accept</Button>
                <Button size="sm" variant="outline">Ignore</Button>
            </div>
        </div>
    );
}

function SuggestionCard({
    friend,
    onAdd
}: {
    friend: Friend;
    onAdd: () => void;
}) {
    return (
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar>
                <AvatarImage src={friend.avatarUrl} />
                <AvatarFallback>
                    {friend.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{friend.name}</p>
                <p className="text-xs text-muted-foreground">
                    {friend.mutualFriends} mutual friends • {friend.winRate}% win rate
                </p>
            </div>

            <Button size="sm" variant="outline" onClick={onAdd}>
                <UserPlus className="h-4 w-4 mr-1" />
                Add
            </Button>
        </div>
    );
}

// Demo data
export const demoFriends: Friend[] = [
    { id: '1', name: 'Marcus Chen', username: 'marcusc', status: 'online', winRate: 78 },
    { id: '2', name: 'Sarah Williams', username: 'swilliams', status: 'playing', winRate: 75 },
    { id: '3', name: 'Jake Thompson', username: 'jakethompson', status: 'online', winRate: 71 },
    { id: '4', name: 'Emma Davis', username: 'emmad', status: 'offline', winRate: 68, lastActive: '2 hours ago' },
    { id: '5', name: 'Chris Rodriguez', username: 'chrisr', status: 'offline', winRate: 65, lastActive: '1 day ago' },
];

export const demoPendingRequests: Friend[] = [
    { id: '6', name: 'Alex Kim', username: 'alexkim', status: 'online', winRate: 62, mutualFriends: 3 },
];

export const demoSuggestions: Friend[] = [
    { id: '7', name: 'Jordan Lee', username: 'jlee', status: 'offline', winRate: 60, mutualFriends: 5 },
    { id: '8', name: 'Taylor Brown', username: 'tbrown', status: 'online', winRate: 58, mutualFriends: 2 },
];
