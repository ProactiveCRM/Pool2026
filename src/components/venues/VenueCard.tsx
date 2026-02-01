import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Table2, CheckCircle } from 'lucide-react';
import type { Venue } from '@/lib/types';

interface VenueCardProps {
    venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
    return (
        <Card className="group overflow-hidden bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                {venue.image_url ? (
                    <img
                        src={venue.image_url}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Table2 className="h-16 w-16 text-primary/40" />
                    </div>
                )}
                {venue.is_claimed && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="pt-4">
                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {venue.name}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">
                        {venue.city}, {venue.state}
                    </span>
                </div>

                {/* Table count */}
                {venue.num_tables > 0 && (
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <Table2 className="h-4 w-4 mr-1" />
                        <span>{venue.num_tables} tables</span>
                    </div>
                )}

                {/* Table types */}
                {venue.table_types && venue.table_types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {venue.table_types.slice(0, 3).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                                {type}
                            </Badge>
                        ))}
                        {venue.table_types.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{venue.table_types.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0">
                <Button asChild className="w-full" variant="secondary">
                    <Link href={`/venues/${venue.slug}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
