import Link from 'next/link';
import { getAdminDashboardStats, getRecentClaims, getRecentLeads } from '@/lib/actions/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Building2,
    CheckCircle,
    Clock,
    Users,
    TrendingUp,
    ArrowRight,
    MapPin,
    Mail,
} from 'lucide-react';

export const metadata = {
    title: 'Admin Dashboard',
    description: 'Pool Directory Admin Dashboard',
};

export default async function AdminDashboardPage() {
    const stats = await getAdminDashboardStats();
    const recentClaims = await getRecentClaims();
    const recentLeads = await getRecentLeads();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Overview of your pool directory</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Venues</p>
                                <p className="text-3xl font-bold">{stats.totalVenues}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Claimed Venues</p>
                                <p className="text-3xl font-bold">{stats.claimedVenues}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Claims</p>
                                <p className="text-3xl font-bold">{stats.pendingClaims}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-500" />
                            </div>
                        </div>
                        {stats.pendingClaims > 0 && (
                            <Button variant="link" className="px-0 mt-2" asChild>
                                <Link href="/admin/claims">Review now <ArrowRight className="h-4 w-4 ml-1" /></Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Leads</p>
                                <p className="text-3xl font-bold">{stats.totalLeads}</p>
                                {stats.recentLeads > 0 && (
                                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                                        +{stats.recentLeads} this week
                                    </p>
                                )}
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Claims */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Claims</CardTitle>
                                <CardDescription>Venue ownership claims</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/claims">View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentClaims.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No claims yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentClaims.map((claim) => (
                                    <div key={claim.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                        <div>
                                            <p className="font-medium text-sm">{claim.venue?.name || 'Unknown'}</p>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {claim.venue?.city}, {claim.venue?.state}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                claim.status === 'approved' ? 'default' :
                                                    claim.status === 'rejected' ? 'destructive' : 'secondary'
                                            }
                                        >
                                            {claim.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Leads */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Leads</CardTitle>
                                <CardDescription>Venue inquiries</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/leads">View All</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentLeads.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No leads yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentLeads.map((lead) => (
                                    <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                        <div>
                                            <p className="font-medium text-sm">{lead.name}</p>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Mail className="h-3 w-3 mr-1" />
                                                {lead.email}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline">{lead.lead_type}</Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {lead.venue?.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
