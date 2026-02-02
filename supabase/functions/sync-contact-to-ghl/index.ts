// Supabase Edge Function: sync-contact-to-ghl
// Syncs users and venues to GoHighLevel as contacts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GHL_API_KEY = Deno.env.get('GHL_API_KEY')!
const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID')!
const GHL_BASE_URL = 'https://services.leadconnectorhq.com'

interface GHLContact {
    firstName?: string
    lastName?: string
    email: string
    phone?: string
    tags?: string[]
    customFields?: { id: string; value: string }[]
}

async function createOrUpdateGHLContact(contact: GHLContact): Promise<string | null> {
    try {
        // First, try to find existing contact by email
        const searchRes = await fetch(
            `${GHL_BASE_URL}/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(contact.email)}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${GHL_API_KEY}`,
                    'Version': '2021-07-28',
                },
            }
        )

        const searchData = await searchRes.json()

        if (searchData.contact?.id) {
            // Update existing contact
            const updateRes = await fetch(
                `${GHL_BASE_URL}/contacts/${searchData.contact.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${GHL_API_KEY}`,
                        'Version': '2021-07-28',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...contact,
                        locationId: GHL_LOCATION_ID,
                    }),
                }
            )
            const updateData = await updateRes.json()
            return updateData.contact?.id || searchData.contact.id
        } else {
            // Create new contact
            const createRes = await fetch(
                `${GHL_BASE_URL}/contacts/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GHL_API_KEY}`,
                        'Version': '2021-07-28',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...contact,
                        locationId: GHL_LOCATION_ID,
                    }),
                }
            )
            const createData = await createRes.json()
            return createData.contact?.id || null
        }
    } catch (error) {
        console.error('GHL API error:', error)
        return null
    }
}

serve(async (req) => {
    try {
        const { type, record, old_record } = await req.json()

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        let ghlContactId: string | null = null
        let updateTable: string | null = null
        let updateId: string | null = null

        switch (type) {
            case 'user_signup': {
                // New user signed up - sync to GHL
                const { email, user_metadata } = record
                const nameParts = (user_metadata?.full_name || user_metadata?.name || '').split(' ')

                ghlContactId = await createOrUpdateGHLContact({
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email,
                    tags: ['player', 'poolfinder'],
                })

                if (ghlContactId) {
                    // Update profile with GHL contact ID
                    await supabase
                        .from('profiles')
                        .update({ ghl_contact_id: ghlContactId })
                        .eq('id', record.id)
                }
                break
            }

            case 'venue_claimed': {
                // Venue was claimed - sync owner to GHL
                const claim = record

                ghlContactId = await createOrUpdateGHLContact({
                    firstName: claim.user_name?.split(' ')[0] || '',
                    lastName: claim.user_name?.split(' ').slice(1).join(' ') || '',
                    email: claim.user_email,
                    phone: claim.user_phone,
                    tags: ['venue-owner', 'poolfinder', `role-${claim.business_role}`],
                })

                if (ghlContactId) {
                    // Update venue with GHL contact ID
                    await supabase
                        .from('venues')
                        .update({ ghl_contact_id: ghlContactId })
                        .eq('id', claim.venue_id)
                }
                break
            }

            case 'league_created': {
                // League organizer - add tag
                const league = record

                // Get organizer profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('email, full_name, ghl_contact_id')
                    .eq('id', league.organizer_id)
                    .single()

                if (profile) {
                    ghlContactId = await createOrUpdateGHLContact({
                        firstName: profile.full_name?.split(' ')[0] || '',
                        lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
                        email: profile.email,
                        tags: ['league-organizer', 'poolfinder'],
                    })

                    if (ghlContactId && !profile.ghl_contact_id) {
                        await supabase
                            .from('profiles')
                            .update({ ghl_contact_id: ghlContactId })
                            .eq('id', league.organizer_id)
                    }
                }
                break
            }

            case 'reservation_created': {
                // Reservation made - trigger GHL workflow
                const reservation = record

                // Get user profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('email, full_name, ghl_contact_id')
                    .eq('id', reservation.user_id)
                    .single()

                // Get venue info
                const { data: venue } = await supabase
                    .from('venues')
                    .select('name, address, city, state')
                    .eq('id', reservation.venue_id)
                    .single()

                if (profile?.ghl_contact_id && venue) {
                    // Trigger GHL workflow for reservation confirmation
                    await fetch(
                        `${GHL_BASE_URL}/contacts/${profile.ghl_contact_id}/workflow/reservation_confirmation`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${GHL_API_KEY}`,
                                'Version': '2021-07-28',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                customData: {
                                    venue_name: venue.name,
                                    venue_address: `${venue.address}, ${venue.city}, ${venue.state}`,
                                    reservation_date: reservation.reservation_date,
                                    start_time: reservation.start_time,
                                    end_time: reservation.end_time,
                                },
                            }),
                        }
                    )
                }
                break
            }

            default:
                console.log('Unknown event type:', type)
        }

        return new Response(
            JSON.stringify({ success: true, ghl_contact_id: ghlContactId }),
            { headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
})
