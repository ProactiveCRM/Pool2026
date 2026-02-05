'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Users,
    Trophy,
    Crown,
    Shield,
    UserPlus,
    MoreHorizontal,
    Star,
    TrendingUp,
    Calendar
} from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    role: 'captain' | 'co-captain' | 'member';
    skillLevel: number;
    wins: number;
    losses: number;
    joinedDate: string;
    isActive: boolean;
}

interface Team {
    id: string;
    name: string;
    logo?: string;
    league: string;
    season: string;
    record: { wins: number; losses: number };
    ranking: number;
    members: TeamMember[];
}

interface TeamRosterProps {
    team: Team;
    isOwner?: boolean;
    onInvite?: () => void;
    onPromote?: (member: TeamMember) => void;
    onRemove?: (member: TeamMember) => void;
}

const roleIcons = {
    captain: Crown,
    'co-captain': Shield,
    member: Users,
};

const roleColors = {
    captain: 'text-yellow-500',
    'co-captain': 'text-blue-500',
    member: 'text-muted-foreground',
};

export function TeamRoster({ team, isOwner, onInvite, onPromote, onRemove }: TeamRosterProps) {
    const totalWins = team.members.reduce((sum, m) => sum + m.wins, 0);
    const totalLosses = team.members.reduce((sum, m) => sum + m.losses, 0);
    const avgSkill = team.members.reduce((sum, m) => sum + m.skillLevel, 0) / team.members.length;

    return (
        <div className="space-y-6">
            {/* Team Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={team.logo} />
                            <AvatarFallback className="text-xl">
                                {team.name.split(' ').map(w => w[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">{team.name}</h2>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>{team.league}</span>
                                <span>•</span>
                                <span>{team.season}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge variant="outline" className="text-lg px-3 py-1">
                                #{team.ranking}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Team Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4 text-center">
                        <Trophy className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                        <p className="text-xl font-bold">{team.record.wins}-{team.record.losses}</p>
                        <p className="text-xs text-muted-foreground">Record</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
                        <p className="text-xl font-bold">{team.members.length}</p>
                        <p className="text-xs text-muted-foreground">Players</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <Star className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                        <p className="text-xl font-bold">{avgSkill.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Avg Skill</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-1 text-green-500" />
                        <p className="text-xl font-bold">
                            {((totalWins / (totalWins + totalLosses)) * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Roster */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Roster
                        </CardTitle>
                        {isOwner && (
                            <Button size="sm" onClick={onInvite}>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Invite
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {team.members.map(member => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            isOwner={isOwner}
                            onPromote={() => onPromote?.(member)}
                            onRemove={() => onRemove?.(member)}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function MemberCard({
    member,
    isOwner,
    onPromote,
    onRemove
}: {
    member: TeamMember;
    isOwner?: boolean;
    onPromote?: () => void;
    onRemove?: () => void;
}) {
    const RoleIcon = roleIcons[member.role];
    const winRate = ((member.wins / (member.wins + member.losses)) * 100).toFixed(0);

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Avatar>
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{member.name}</span>
                    <RoleIcon className={`h-4 w-4 ${roleColors[member.role]}`} />
                    {!member.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Skill: {member.skillLevel}</span>
                    <span>{member.wins}W - {member.losses}L ({winRate}%)</span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">{member.joinedDate}</span>
            </div>

            {isOwner && member.role !== 'captain' && (
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}

// Demo data
export const demoTeam: Team = {
    id: '1',
    name: 'Cue Masters',
    league: 'Austin 8-Ball League',
    season: 'Spring 2026',
    record: { wins: 18, losses: 6 },
    ranking: 2,
    members: [
        { id: '1', name: 'Marcus Chen', username: 'marcusc', role: 'captain', skillLevel: 85, wins: 42, losses: 12, joinedDate: 'Aug 2024', isActive: true },
        { id: '2', name: 'Sarah Williams', username: 'swilliams', role: 'co-captain', skillLevel: 78, wins: 35, losses: 15, joinedDate: 'Aug 2024', isActive: true },
        { id: '3', name: 'Jake Thompson', username: 'jakethompson', role: 'member', skillLevel: 72, wins: 28, losses: 18, joinedDate: 'Sep 2024', isActive: true },
        { id: '4', name: 'Emma Davis', username: 'emmad', role: 'member', skillLevel: 68, wins: 22, losses: 14, joinedDate: 'Oct 2024', isActive: true },
        { id: '5', name: 'Chris Rodriguez', username: 'chrisr', role: 'member', skillLevel: 65, wins: 18, losses: 12, joinedDate: 'Nov 2024', isActive: true },
        { id: '6', name: 'Taylor Brown', username: 'tbrown', role: 'member', skillLevel: 60, wins: 10, losses: 8, joinedDate: 'Jan 2025', isActive: false },
    ],
};
