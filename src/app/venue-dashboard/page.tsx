import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMyVenues, getVenueDashboardStats, getVenuePromotions } from '@/lib/actions/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3, Calendar, Star, Tag, Users, TrendingUp,
    Clock, CheckCircle, ArrowRight, Plus, MapPin
} from 'lucide-react';
import { PROMOTION_TYPE_LABELS } from '@/types/analytics';

export const metadata: Metadata = {
    title: 'Venue Dashboard',
    description: 'Manage your pool venue and view analytics',
};

export default async function VenueDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?next=/venue-dashboard');
    }

    const myVenues = await getMyVenues();

    if (myVenues.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-16 text-center">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Venue Dashboard</h1>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        You don&apos;t have any venues yet. Claim your venue listing to access analytics and manage reservations.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/venues">
                            Find Your Venue
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Get stats for first venue (or implement venue selector)
    const activeVenue = myVenues[0];
    const [stats, promotions] = await Promise.all([
        getVenueDashboardStats(activeVenue.id),
        getVenuePromotions(activeVenue.id),
    ]);

    const activePromotions = promotions.filter(p => p.is_active);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">{activeVenue.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {activeVenue.city}, {activeVenue.state}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/venues/${activeVenue.slug}`}>
                                View Listing
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/venue-dashboard/promotions/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Promotion
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Today&apos;s Reservations
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.reservations.today || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.reservations.pending || 0} pending confirmation
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                This Month
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.reservations.this_month || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.reservations.total || 0} total reservations
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Average Rating
                            </CardTitle>
                            <Star className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats?.reviews.average_rating?.toFixed(1) || '—'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.reviews.total || 0} reviews
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Promotions
                            </CardTitle>
                            <Tag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats?.promotions.active || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.promotions.total_redemptions || 0} redemptions
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="reservations">Reservations</TabsTrigger>
                        <TabsTrigger value="promotions">Promotions</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reservation Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-yellow-500" />
                                            <span>Pending</span>
                                        </div>
                                        <span className="font-medium">{stats?.reservations.pending || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>Confirmed</span>
                                        </div>
                                        <span className="font-medium">{stats?.reservations.confirmed || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-blue-500" />
                                            <span>This Week</span>
                                        </div>
                                        <span className="font-medium">{stats?.reservations.this_week || 0}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Active Promotions */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Active Promotions</CardTitle>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/venue-dashboard/promotions">
                                            View All
                                            <ArrowRight className="ml-2 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {activePromotions.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">
                                            No active promotions
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {activePromotions.slice(0, 3).map((promo) => (
                                                <div key={promo.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span>{PROMOTION_TYPE_LABELS[promo.promotion_type].icon}</span>
                                                        <span className="font-medium">{promo.name}</span>
                                                    </div>
                                                    <Badge variant="outline">
                                                        {promo.views_count} views
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Summary</CardTitle>
                                <CardDescription>Your venue at a glance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                                        <div className="text-2xl font-bold text-primary">
                                            {stats?.reservations.total || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total Reservations</div>
                                    </div>
                                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-500">
                                            ⭐ {stats?.reviews.average_rating?.toFixed(1) || '—'}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            From {stats?.reviews.total || 0} Reviews
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                                        <div className="text-2xl font-bold text-green-500">
                                            {stats?.promotions.total_redemptions || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Promo Redemptions</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reservations Tab */}
                    <TabsContent value="reservations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Reservations</CardTitle>
                                <CardDescription>Manage your bookings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center py-8">
                                    Reservation management coming soon
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Promotions Tab */}
                    <TabsContent value="promotions">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Promotions</CardTitle>
                                    <CardDescription>Create and manage special offers</CardDescription>
                                </div>
                                <Button asChild>
                                    <Link href="/venue-dashboard/promotions/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Promotion
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {promotions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground mb-4">No promotions yet</p>
                                        <Button asChild>
                                            <Link href="/venue-dashboard/promotions/new">
                                                Create Your First Promotion
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {promotions.map((promo) => (
                                            <div
                                                key={promo.id}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {PROMOTION_TYPE_LABELS[promo.promotion_type].icon}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium">{promo.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {PROMOTION_TYPE_LABELS[promo.promotion_type].label}
                                                            {promo.discount_value && ` • ${promo.discount_value}${promo.discount_type === 'percentage' ? '%' : '$'} off`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                                                        {promo.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {promo.views_count} views
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reviews</CardTitle>
                                <CardDescription>See what customers are saying</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Star className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                                    <p className="text-2xl font-bold mb-2">
                                        {stats?.reviews.average_rating?.toFixed(1) || '—'} ⭐
                                    </p>
                                    <p className="text-muted-foreground">
                                        Based on {stats?.reviews.total || 0} reviews
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {stats?.reviews.new_this_month || 0} new this month
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
