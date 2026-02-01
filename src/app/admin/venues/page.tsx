import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { MapPin, ExternalLink, CheckCircle, Search, Plus } from 'lucide-react';

export const metadata = {
    title: 'Manage Venues - Admin',
    description: 'Manage all venues in the directory',
};

interface VenuesPageProps {
    searchParams: Promise<{ page?: string; query?: string }>;
}

export default async function AdminVenuesPage({ searchParams }: VenuesPageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const query = params.query || '';
    const perPage = 20;

    const supabase = await createClient();

    let venuesQuery = supabase
        .from('venues')
        .select('*', { count: 'exact' });

    if (query) {
        venuesQuery = venuesQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%`);
    }

    const { data: venues, count } = await venuesQuery
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

    const totalPages = Math.ceil((count || 0) / perPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Venues</h1>
                    <p className="text-muted-foreground">Manage all venues in the directory</p>
                </div>
                <Button asChild>
                    <Link href="/admin/venues/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Venue
                    </Link>
                </Button>
            </div>

            {/* Search */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                    <form className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="query"
                                placeholder="Search venues..."
                                defaultValue={query}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Venues Table */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>All Venues ({count || 0})</CardTitle>
                    <CardDescription>
                        Page {page} of {totalPages || 1}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {(!venues || venues.length === 0) ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No venues found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Tables</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {venues.map((venue) => (
                                        <TableRow key={venue.id}>
                                            <TableCell className="font-medium">{venue.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {venue.city}, {venue.state}
                                                </div>
                                            </TableCell>
                                            <TableCell>{venue.num_tables || 0}</TableCell>
                                            <TableCell>
                                                {venue.is_claimed ? (
                                                    <Badge variant="default" className="bg-primary/90">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Claimed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Unclaimed</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/venues/${venue.slug}`} target="_blank">
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/venues/${venue.id}`}>
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {page > 1 && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/venues?page=${page - 1}${query ? `&query=${query}` : ''}`}>
                                        Previous
                                    </Link>
                                </Button>
                            )}
                            <span className="px-4 py-2 text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            {page < totalPages && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/venues?page=${page + 1}${query ? `&query=${query}` : ''}`}>
                                        Next
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
