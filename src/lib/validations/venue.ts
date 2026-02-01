import { z } from 'zod';

// Search/Filter schema for venue listings
export const venueSearchSchema = z.object({
    query: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    tableTypes: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type VenueSearchInput = z.infer<typeof venueSearchSchema>;

// Schema for creating a new venue (admin)
export const venueCreateSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(200),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().length(2, 'Use 2-letter state code'),
    zip: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    description: z.string().max(2000).optional(),
    num_tables: z.coerce.number().int().min(0).optional(),
    table_types: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),
    image_url: z.string().url().optional().or(z.literal('')),
});

export type VenueCreateInput = z.infer<typeof venueCreateSchema>;

// Schema for updating a venue
export const venueUpdateSchema = venueCreateSchema.partial().extend({
    id: z.string().uuid(),
});

export type VenueUpdateInput = z.infer<typeof venueUpdateSchema>;

// Constants for filtering
export const TABLE_TYPES = [
    '8-ball',
    '9-ball',
    '10-ball',
    'snooker',
    'carom',
    'straight pool',
] as const;

export const AMENITIES = [
    'bar',
    'food',
    'parking',
    'tournaments',
    'lessons',
    'pro shop',
    'wifi',
    'league play',
    'private rooms',
] as const;

export const US_STATES = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
] as const;
