// Supabase Edge Function: ghl-webhook-handler
// Handles incoming webhooks from GoHighLevel (payments, workflow triggers)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GHL_WEBHOOK_SECRET = Deno.env.get('GHL_WEBHOOK_SECRET')

serve(async (req) => {
    try {
        // Verify webhook signature (if configured)
        const signature = req.headers.get('x-ghl-signature')
        if (GHL_WEBHOOK_SECRET && signature) {
            // TODO: Implement signature verification
        }

        const payload = await req.json()
        const { type, data } = payload

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        console.log('GHL Webhook received:', type, data)

        switch (type) {
            case 'PaymentReceived':
            case 'InvoicePaid': {
                // Handle payment for venue subscription or league fee
                const { contactId, amount, productName, invoiceId } = data

                // Find user by GHL contact ID
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('ghl_contact_id', contactId)
                    .single()

                if (!profile) {
                    console.log('No profile found for GHL contact:', contactId)
                    break
                }

                // Determine payment type from product name
                if (productName?.toLowerCase().includes('pro subscription') ||
                    productName?.toLowerCase().includes('venue pro')) {
                    // Venue Pro subscription payment
                    const { data: venue } = await supabase
                        .from('venues')
                        .select('id')
                        .eq('ghl_contact_id', contactId)
                        .single()

                    if (venue) {
                        await supabase
                            .from('venues')
                            .update({
                                subscription_tier: 'pro',
                                subscription_started_at: new Date().toISOString(),
                                ghl_invoice_id: invoiceId,
                            })
                            .eq('id', venue.id)

                        console.log('Upgraded venue to Pro:', venue.id)
                    }
                } else if (productName?.toLowerCase().includes('league')) {
                    // League entry fee payment
                    // Extract league ID from product metadata if available
                    const leagueIdMatch = productName.match(/league[_-]?(\w+)/i)

                    if (leagueIdMatch) {
                        // Update team member payment status
                        await supabase
                            .from('team_members')
                            .update({
                                payment_status: 'paid',
                                payment_amount: amount,
                                paid_at: new Date().toISOString(),
                                ghl_invoice_id: invoiceId,
                            })
                            .eq('user_id', profile.id)
                            .eq('payment_status', 'pending')
                            .order('created_at', { ascending: false })
                            .limit(1)

                        console.log('Updated league payment for user:', profile.id)
                    }
                }
                break
            }

            case 'ContactTagAdded': {
                // Handle tag changes (e.g., upgraded to pro via GHL automation)
                const { contactId, tag } = data

                if (tag === 'pro') {
                    const { data: venue } = await supabase
                        .from('venues')
                        .select('id')
                        .eq('ghl_contact_id', contactId)
                        .single()

                    if (venue) {
                        await supabase
                            .from('venues')
                            .update({ subscription_tier: 'pro' })
                            .eq('id', venue.id)
                    }
                }
                break
            }

            case 'OpportunityStageChanged': {
                // Handle claim approval/rejection via GHL pipeline
                const { opportunityId, stageName, contactId } = data

                // Find claim by GHL opportunity ID
                const { data: claim } = await supabase
                    .from('claims')
                    .select('id, venue_id')
                    .eq('ghl_opportunity_id', opportunityId)
                    .single()

                if (claim) {
                    if (stageName?.toLowerCase() === 'approved' || stageName?.toLowerCase() === 'won') {
                        await supabase
                            .from('claims')
                            .update({
                                status: 'approved',
                                reviewed_at: new Date().toISOString(),
                            })
                            .eq('id', claim.id)

                        await supabase
                            .from('venues')
                            .update({
                                is_claimed: true,
                                ghl_contact_id: contactId,
                            })
                            .eq('id', claim.venue_id)

                        console.log('Claim approved:', claim.id)
                    } else if (stageName?.toLowerCase() === 'rejected' || stageName?.toLowerCase() === 'lost') {
                        await supabase
                            .from('claims')
                            .update({
                                status: 'rejected',
                                reviewed_at: new Date().toISOString(),
                            })
                            .eq('id', claim.id)

                        console.log('Claim rejected:', claim.id)
                    }
                }
                break
            }

            case 'FormSubmission': {
                // Handle form submissions from GHL (e.g., contact forms)
                const { formName, fields, contactId } = data

                if (formName?.toLowerCase().includes('contact') ||
                    formName?.toLowerCase().includes('inquiry')) {
                    // Create a lead in the database
                    await supabase
                        .from('leads')
                        .insert({
                            name: fields.name || fields.firstName + ' ' + (fields.lastName || ''),
                            email: fields.email,
                            phone: fields.phone,
                            message: fields.message || fields.notes,
                            lead_type: 'inquiry',
                            status: 'new',
                        })

                    console.log('Created lead from GHL form:', fields.email)
                }
                break
            }

            default:
                console.log('Unhandled webhook type:', type)
        }

        return new Response(
            JSON.stringify({ success: true, type }),
            { headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
})
