'use client';

import { TeamRoster, demoTeam } from '@/components/teams/TeamRoster';

export default function TeamPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Team</h1>
                    <p className="text-muted-foreground">
                        View your team roster and manage members
                    </p>
                </div>

                <TeamRoster
                    team={demoTeam}
                    isOwner={true}
                    onInvite={() => console.log('Invite player')}
                    onPromote={(member) => console.log('Promote:', member.name)}
                    onRemove={(member) => console.log('Remove:', member.name)}
                />
            </div>
        </div>
    );
}

