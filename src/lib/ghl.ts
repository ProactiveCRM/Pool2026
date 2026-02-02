// GHL (GoHighLevel) API utilities
// Server-side only - do not import in client components

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

export interface GHLContact {
    id?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    tags?: string[];
    customFields?: { id: string; value: string }[];
}

export interface GHLOpportunity {
    id?: string;
    name: string;
    pipelineId: string;
    stageId: string;
    contactId: string;
    monetaryValue?: number;
}

// Create or update a GHL contact
export async function upsertGHLContact(contact: GHLContact): Promise<string | null> {
    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
        console.warn('GHL credentials not configured');
        return null;
    }

    try {
        // Search for existing contact
        const searchRes = await fetch(
            `${GHL_BASE_URL}/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(contact.email)}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${GHL_API_KEY}`,
                    'Version': '2021-07-28',
                },
            }
        );

        const searchData = await searchRes.json();

        if (searchData.contact?.id) {
            // Update existing
            await fetch(`${GHL_BASE_URL}/contacts/${searchData.contact.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GHL_API_KEY}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...contact, locationId: GHL_LOCATION_ID }),
            });
            return searchData.contact.id;
        } else {
            // Create new
            const createRes = await fetch(`${GHL_BASE_URL}/contacts/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GHL_API_KEY}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...contact, locationId: GHL_LOCATION_ID }),
            });
            const createData = await createRes.json();
            return createData.contact?.id || null;
        }
    } catch (error) {
        console.error('GHL upsertContact error:', error);
        return null;
    }
}

// Add tags to a contact
export async function addGHLTags(contactId: string, tags: string[]): Promise<boolean> {
    if (!GHL_API_KEY) return false;

    try {
        const response = await fetch(`${GHL_BASE_URL}/contacts/${contactId}/tags`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tags }),
        });
        return response.ok;
    } catch (error) {
        console.error('GHL addTags error:', error);
        return false;
    }
}

// Create an opportunity (for claims pipeline)
export async function createGHLOpportunity(opportunity: GHLOpportunity): Promise<string | null> {
    if (!GHL_API_KEY) return null;

    try {
        const response = await fetch(`${GHL_BASE_URL}/opportunities/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(opportunity),
        });
        const data = await response.json();
        return data.opportunity?.id || null;
    } catch (error) {
        console.error('GHL createOpportunity error:', error);
        return null;
    }
}

// Get a payment link URL
export function getGHLPaymentLink(type: 'venue_pro' | 'league_entry', metadata?: Record<string, string>): string {
    const baseLinks = {
        venue_pro: process.env.GHL_PAYMENT_LINK_VENUE_PRO || '',
        league_entry: process.env.GHL_PAYMENT_LINK_LEAGUE_ENTRY || '',
    };

    let url = baseLinks[type];

    // Append metadata as query params
    if (metadata && url) {
        const params = new URLSearchParams(metadata);
        url += (url.includes('?') ? '&' : '?') + params.toString();
    }

    return url;
}

// Trigger a GHL workflow
export async function triggerGHLWorkflow(
    contactId: string,
    workflowId: string,
    customData?: Record<string, string | number>
): Promise<boolean> {
    if (!GHL_API_KEY || !workflowId) return false;

    try {
        const response = await fetch(
            `${GHL_BASE_URL}/contacts/${contactId}/workflow/${workflowId}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GHL_API_KEY}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventStartTime: new Date().toISOString(),
                    ...(customData && { customData }),
                }),
            }
        );
        return response.ok;
    } catch (error) {
        console.error('GHL triggerWorkflow error:', error);
        return false;
    }
}
