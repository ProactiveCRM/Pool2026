import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserClaims } from '@/lib/actions/claims';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, LogOut } from 'lucide-react';

export const metadata = {
    title: 'Dashboard',
    description: 'Manage your venue claims and listings',
};

function getStatusBadge(status: string) {
    switch (status) {
        case 'pending':
            return <Badge variant="secondary" className="bg-secondary/50"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
        case 'approved':
            return <Badge variant="default" className="bg-primary/90"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
        case 'rejected':
            return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
        default:
            return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />{status}</Badge>;
    }
}

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    const claims = await getUserClaims();

    const handleSignOut = async () => {
        'use server';
        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect('/');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {user.email}
                    </p>
                </div>
                <form action={handleSignOut}>
                    <Button variant="outline" type="submit">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </form>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="py-6">
                        <div className="text-2xl font-bold text-primary">
                            {claims.filter(c => c.status === 'pending').length}
                        </div>
                        <p className="text-sm text-muted-foreground">Pending Claims</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="py-6">
                        <div className="text-2xl font-bold text-primary">
                            {claims.filter(c => c.status === 'approved').length}
                        </div>
                        <p className="text-sm text-muted-foreground">Approved Venues</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-primary/20 to-secondary/10 border-primary/20">
                    <CardContent className="py-6">
                        <p className="text-sm text-muted-foreground mb-2">Want to claim a venue?</p>
                        <Button asChild size="sm">
                            <Link href="/venues">Browse Directory</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Claims Table */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>Your Claims</CardTitle>
                    <CardDescription>
                        Track the status of your venue ownership claims
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {claims.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Claims Yet</h3>
                            <p className="text-muted-foreground mb-4">
                                You haven&apos;t submitted any venue claims yet.
                            </p>
                            <Button asChild>
                                <Link href="/venues">Find Your Venue</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Venue</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {claims.map((claim) => (
                                        <TableRow key={claim.id}>
                                            <TableCell className="font-medium">
                                                {claim.venue?.name || 'Unknown Venue'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {claim.venue?.city}, {claim.venue?.state}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(claim.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {claim.venue?.slug && (
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/venues/${claim.venue.slug}`}>
                                                            View <ExternalLink className="h-3 w-3 ml-1" />
                                                        </Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Card for Approved Claims */}
            {claims.some(c => c.status === 'approved') && (
                <Card className="mt-6 bg-gradient-to-br from-primary/10 to-secondary/5 border-primary/20">
                    <CardContent className="py-6">
                        <h3 className="font-semibold mb-2">🎉 You have approved claims!</h3>
                        <p className="text-sm text-muted-foreground">
                            For approved venues, you can now update your listing information.
                            Contact our support team to get editing access enabled for your account.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
