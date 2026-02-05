import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FriendsList, demoFriends, demoPendingRequests, demoSuggestions } from '@/components/social/FriendsList';
import { MatchHistory, demoMatches } from '@/components/matches/MatchHistory';
import { Users, Clock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Social',
    description: 'Connect with friends and view your match history',
};

export default function SocialPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Social</h1>
                    <p className="text-muted-foreground">
                        Connect with friends and track your matches
                    </p>
                </div>

                <Tabs defaultValue="friends" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="friends" className="gap-2">
                            <Users className="h-4 w-4" />
                            Friends
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Match History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends">
                        <FriendsList
                            friends={demoFriends}
                            pendingRequests={demoPendingRequests}
                            suggestions={demoSuggestions}
                            onChallenge={(friend) => console.log('Challenge:', friend.name)}
                            onMessage={(friend) => console.log('Message:', friend.name)}
                            onAddFriend={(friend) => console.log('Add friend:', friend.name)}
                        />
                    </TabsContent>

                    <TabsContent value="history">
                        <MatchHistory matches={demoMatches} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
