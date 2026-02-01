import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InquiryForm } from '@/components/forms/InquiryForm';
import { getVenueBySlug } from '@/lib/actions/venues';
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    Clock,
    Table2,
    CheckCircle,
    ArrowLeft,
    Flag,
    CalendarCheck,
} from 'lucide-react';

interface VenueDetailPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: VenueDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const venue = await getVenueBySlug(slug);

    if (!venue) {
        return {
            title: 'Venue Not Found',
        };
    }

    return {
        title: venue.name,
        description:
            venue.description ||
            `Find ${venue.name} in ${venue.city}, ${venue.state}. View details, hours, and contact information.`,
    };
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
    const { slug } = await params;
    const venue = await getVenueBySlug(slug);

    if (!venue) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back link */}
            <Link
                href="/venues"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to all venues
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold">{venue.name}</h1>
                            {venue.is_claimed && (
                                <Badge variant="secondary" className="bg-primary/90 text-primary-foreground flex-shrink-0">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>
                                {venue.address}, {venue.city}, {venue.state} {venue.zip}
                            </span>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative h-64 md:h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden">
                        {venue.image_url ? (
                            <img
                                src={venue.image_url}
                                alt={venue.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Table2 className="h-24 w-24 text-primary/40" />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {venue.description && (
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {venue.description}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Table Info */}
                    <Card className="bg-card/50 border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Table2 className="h-5 w-5 text-primary" />
                                Tables & Games
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {venue.num_tables > 0 && (
                                <div>
                                    <span className="font-medium">{venue.num_tables}</span>{' '}
                                    <span className="text-muted-foreground">tables available</span>
                                </div>
                            )}

                            {venue.table_types && venue.table_types.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium mb-2">Table Types</p>
                                    <div className="flex flex-wrap gap-2">
                                        {venue.table_types.map((type) => (
                                            <Badge key={type} variant="outline">
                                                {type}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Amenities */}
                    {venue.amenities && venue.amenities.length > 0 && (
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader>
                                <CardTitle>Amenities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {venue.amenities.map((amenity) => (
                                        <Badge key={amenity} variant="secondary">
                                            {amenity}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <Card className="bg-card/50 border-border/50">
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {venue.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <a
                                        href={`tel:${venue.phone}`}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {venue.phone}
                                    </a>
                                </div>
                            )}
                            {venue.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <a
                                        href={`mailto:${venue.email}`}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {venue.email}
                                    </a>
                                </div>
                            )}
                            {venue.website && (
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary" />
                                    <a
                                        href={venue.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-primary transition-colors truncate"
                                    >
                                        {venue.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </div>
                            )}
                            {!venue.phone && !venue.email && !venue.website && (
                                <p className="text-muted-foreground text-sm">
                                    No contact information available.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Hours */}
                    {venue.hours && Object.keys(venue.hours).length > 0 && (
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Hours
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-1 text-sm">
                                    {Object.entries(venue.hours).map(([day, hours]) => (
                                        <div key={day} className="flex justify-between">
                                            <dt className="capitalize text-muted-foreground">{day}</dt>
                                            <dd>{hours}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    )}

                    {/* Reserve a Table - Primary CTA */}
                    <Card className="bg-primary/10 border-primary/30">
                        <CardContent className="py-6 text-center">
                            <div className="text-4xl mb-3">🎱</div>
                            <h3 className="font-semibold text-lg mb-2">Reserve a Table</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Book online and skip the wait
                            </p>
                            <Button size="lg" className="w-full" asChild>
                                <Link href={`/venues/${venue.slug}/book`}>
                                    <CalendarCheck className="mr-2 h-4 w-4" />
                                    Book Now
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Inquiry Form */}
                    <InquiryForm venueId={venue.id} venueName={venue.name} />

                    {/* Claim CTA */}
                    {!venue.is_claimed && (
                        <Card className="bg-gradient-to-br from-secondary/20 to-primary/10 border-primary/20">
                            <CardContent className="py-6 text-center">
                                <Flag className="h-8 w-8 text-primary mx-auto mb-3" />
                                <h3 className="font-semibold mb-2">Own this venue?</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Claim this listing to manage your information and respond to inquiries.
                                </p>
                                <Button asChild>
                                    <Link href={`/claim/${venue.id}`}>Claim Listing</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
