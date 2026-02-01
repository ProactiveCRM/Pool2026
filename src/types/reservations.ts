// Types for the reservation system

export type TableType = '7-foot' | '8-foot' | '9-foot' | '10-foot' | 'snooker';
export type ClothColor = 'green' | 'blue' | 'red' | 'burgundy' | 'tournament-blue';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface PoolTable {
    id: string;
    venue_id: string;
    name: string;
    table_type: TableType | null;
    brand: string | null;
    cloth_color: ClothColor;
    hourly_rate: number | null;
    peak_hourly_rate: number | null;
    is_available: boolean;
    is_active: boolean;
    position_order: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface VenueHours {
    id: string;
    venue_id: string;
    day_of_week: number; // 0=Sunday, 6=Saturday
    open_time: string; // "HH:MM:SS"
    close_time: string;
    is_closed: boolean;
    notes: string | null;
}

export interface Reservation {
    id: string;
    table_id: string | null;
    venue_id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    party_size: number;
    preferred_table_type: TableType | null;
    any_table_ok: boolean;
    status: ReservationStatus;
    guest_name: string | null;
    guest_phone: string | null;
    guest_email: string | null;
    special_requests: string | null;
    internal_notes: string | null;
    estimated_price: number | null;
    final_price: number | null;
    deposit_amount: number | null;
    is_paid: boolean;
    created_at: string;
    updated_at: string;
    confirmed_at: string | null;
    cancelled_at: string | null;
    checked_in_at: string | null;
    checked_out_at: string | null;
    // Joined data
    venue?: {
        id: string;
        name: string;
        slug: string;
        address: string;
        city: string;
        state: string;
    };
    table?: PoolTable;
}

export interface ReservationFormData {
    venue_id: string;
    date: string; // YYYY-MM-DD
    start_time: string; // HH:MM
    duration: number; // minutes (60, 90, 120, etc.)
    party_size: number;
    preferred_table_type?: TableType;
    any_table_ok: boolean;
    special_requests?: string;
}

export interface TimeSlot {
    time: string; // "14:00"
    available: boolean;
    tables_available: number;
}

export interface AvailabilityResponse {
    date: string;
    venue_id: string;
    slots: TimeSlot[];
    total_tables: number;
}

// Day names for display
export const DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
] as const;

// Table type labels
export const TABLE_TYPE_LABELS: Record<TableType, string> = {
    '7-foot': '7-Foot (Bar Box)',
    '8-foot': '8-Foot',
    '9-foot': '9-Foot (Tournament)',
    '10-foot': '10-Foot',
    'snooker': 'Snooker (12-Foot)'
};

// Duration options
export const DURATION_OPTIONS = [
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
];

// Status labels and colors
export const RESERVATION_STATUS: Record<ReservationStatus, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-500' },
    confirmed: { label: 'Confirmed', color: 'bg-green-500/20 text-green-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-500' },
    completed: { label: 'Completed', color: 'bg-blue-500/20 text-blue-500' },
    no_show: { label: 'No Show', color: 'bg-gray-500/20 text-gray-500' },
};
