import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Mail, Phone, ExternalLink, Download } from 'lucide-react';

export const metadata = {
    title: 'Leads - Admin',
    description: 'View and manage venue inquiries',
};

interface LeadsPageProps {
    searchParams: Promise<{ page?: string; query?: string }>;
}

export default async function AdminLeadsPage({ searchParams }: LeadsPageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const query = params.query || '';
    const perPage = 20;

    const supabase = await createClient();

    let leadsQuery = supabase
        .from('leads')
        .select(`
      *,
      venue:venues(id, name, slug)
    `, { count: 'exact' });

    if (query) {
        leadsQuery = leadsQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
    }

    const { data: leads, count } = await leadsQuery
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

    const totalPages = Math.ceil((count || 0) / perPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Leads</h1>
                    <p className="text-muted-foreground">View and manage venue inquiries</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/leads/export">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
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
                                placeholder="Search by name or email..."
                                defaultValue={query}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Leads Table */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>All Leads ({count || 0})</CardTitle>
                    <CardDescription>
                        Page {page} of {totalPages || 1}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {(!leads || leads.length === 0) ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No leads found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Venue</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads.map((lead) => (
                                        <TableRow key={lead.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{lead.name}</p>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {lead.email}
                                                    </div>
                                                    {lead.phone && (
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Phone className="h-3 w-3 mr-1" />
                                                            {lead.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {lead.venue ? (
                                                    <Link
                                                        href={`/venues/${lead.venue.slug}`}
                                                        className="text-primary hover:underline"
                                                        target="_blank"
                                                    >
                                                        {lead.venue.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{lead.lead_type}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {lead.message || '-'}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={`mailto:${lead.email}`}>
                                                            <Mail className="h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                    {lead.venue?.slug && (
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/venues/${lead.venue.slug}`} target="_blank">
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Link>
                                                        </Button>
                                                    )}
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
                                    <Link href={`/admin/leads?page=${page - 1}${query ? `&query=${query}` : ''}`}>
                                        Previous
                                    </Link>
                                </Button>
                            )}
                            <span className="px-4 py-2 text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            {page < totalPages && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/leads?page=${page + 1}${query ? `&query=${query}` : ''}`}>
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
