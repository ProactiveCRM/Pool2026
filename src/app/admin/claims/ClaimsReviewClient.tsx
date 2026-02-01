'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MapPin, Clock, CheckCircle, XCircle, Eye, ExternalLink, Loader2 } from 'lucide-react';
import { updateClaimStatus } from '@/lib/actions/admin';

interface Claim {
    id: string;
    user_name: string;
    user_email: string;
    user_phone?: string;
    business_role: string;
    proof_type: string;
    proof_url: string;
    status: string;
    created_at: string;
    admin_notes?: string;
    venue?: {
        id: string;
        name: string;
        slug: string;
        city: string;
        state: string;
    };
}

interface ClaimsReviewClientProps {
    claims: Claim[];
}

export function ClaimsReviewClient({ claims }: ClaimsReviewClientProps) {
    const router = useRouter();
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [isReviewing, setIsReviewing] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    const handleReview = async (status: 'approved' | 'rejected') => {
        if (!selectedClaim) return;

        setIsReviewing(true);
        try {
            const result = await updateClaimStatus(selectedClaim.id, status, adminNotes);

            if (result.success) {
                toast.success(`Claim ${status} successfully`);
                setSelectedClaim(null);
                setAdminNotes('');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to update claim');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsReviewing(false);
        }
    };

    function getStatusBadge(status: string) {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'approved':
                return <Badge variant="default" className="bg-primary/90"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    }

    return (
        <>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>All Claims ({claims.length})</CardTitle>
                    <CardDescription>Review and manage venue ownership claims</CardDescription>
                </CardHeader>
                <CardContent>
                    {claims.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No claims to review</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Venue</TableHead>
                                        <TableHead>Claimant</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {claims.map((claim) => (
                                        <TableRow key={claim.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{claim.venue?.name || 'Unknown'}</p>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {claim.venue?.city}, {claim.venue?.state}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm">{claim.user_name}</p>
                                                    <p className="text-xs text-muted-foreground">{claim.user_email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{claim.business_role}</Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(claim.status)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(claim.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedClaim(claim)}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Review
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Claim</DialogTitle>
                        <DialogDescription>
                            Review the claim details and approve or reject
                        </DialogDescription>
                    </DialogHeader>

                    {selectedClaim && (
                        <div className="space-y-4">
                            {/* Venue Info */}
                            <div className="p-4 rounded-lg bg-muted/30">
                                <h4 className="font-medium mb-2">Venue</h4>
                                <p className="text-lg font-semibold">{selectedClaim.venue?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {selectedClaim.venue?.city}, {selectedClaim.venue?.state}
                                </p>
                            </div>

                            {/* Claimant Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Name</p>
                                    <p className="font-medium">{selectedClaim.user_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{selectedClaim.user_email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{selectedClaim.user_phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Role</p>
                                    <p className="font-medium">{selectedClaim.business_role}</p>
                                </div>
                            </div>

                            {/* Proof */}
                            <div className="p-4 rounded-lg bg-muted/30">
                                <h4 className="font-medium mb-2">Proof of Ownership</h4>
                                <p className="text-sm text-muted-foreground mb-2">Type: {selectedClaim.proof_type}</p>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={selectedClaim.proof_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        View Document
                                    </a>
                                </Button>
                            </div>

                            {/* Admin Notes */}
                            {selectedClaim.status === 'pending' && (
                                <div>
                                    <label className="text-sm font-medium">Admin Notes (optional)</label>
                                    <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add notes about this review..."
                                        className="mt-1"
                                    />
                                </div>
                            )}

                            {selectedClaim.admin_notes && selectedClaim.status !== 'pending' && (
                                <div className="p-4 rounded-lg bg-muted/30">
                                    <h4 className="font-medium mb-2">Admin Notes</h4>
                                    <p className="text-sm">{selectedClaim.admin_notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {selectedClaim?.status === 'pending' ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => handleReview('rejected')}
                                    disabled={isReviewing}
                                >
                                    {isReviewing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => handleReview('approved')}
                                    disabled={isReviewing}
                                >
                                    {isReviewing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" onClick={() => setSelectedClaim(null)}>
                                Close
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
