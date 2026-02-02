// Supabase Edge Function: trigger-ghl-workflow
// Triggers GHL workflows for various events (emails, SMS, etc.)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GHL_API_KEY = Deno.env.get('GHL_API_KEY')!
const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID')!
const GHL_BASE_URL = 'https://services.leadconnectorhq.com'

// GHL Workflow IDs - configure these in your GHL account
const WORKFLOWS = {
    reservation_confirmation: Deno.env.get('GHL_WORKFLOW_RESERVATION_CONFIRM') || '',
    reservation_reminder: Deno.env.get('GHL_WORKFLOW_RESERVATION_REMINDER') || '',
    claim_submitted: Deno.env.get('GHL_WORKFLOW_CLAIM_SUBMITTED') || '',
    claim_approved: Deno.env.get('GHL_WORKFLOW_CLAIM_APPROVED') || '',
    claim_rejected: Deno.env.get('GHL_WORKFLOW_CLAIM_REJECTED') || '',
    league_welcome: Deno.env.get('GHL_WORKFLOW_LEAGUE_WELCOME') || '',
    match_scheduled: Deno.env.get('GHL_WORKFLOW_MATCH_SCHEDULED') || '',
    venue_welcome: Deno.env.get('GHL_WORKFLOW_VENUE_WELCOME') || '',
}

interface TriggerRequest {
    workflow: keyof typeof WORKFLOWS
    contactId: string
    customData?: Record<string, string | number>
}

async function triggerWorkflow(
    contactId: string,
    workflowId: string,
    customData?: Record<string, string | number>
): Promise<boolean> {
    if (!workflowId) {
        console.log('Workflow ID not configured')
        return false
    }

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
        )

        if (!response.ok) {
            const error = await response.text()
            console.error('GHL workflow trigger failed:', error)
            return false
        }

        console.log('Workflow triggered successfully:', workflowId)
        return true
    } catch (error) {
        console.error('Error triggering workflow:', error)
        return false
    }
}

async function addContactToWorkflow(
    contactId: string,
    workflowId: string
): Promise<boolean> {
    try {
        const response = await fetch(
            `${GHL_BASE_URL}/workflows/${workflowId}/contacts`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GHL_API_KEY}`,
                    'Version': '2021-07-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contactId,
                    eventStartTime: new Date().toISOString(),
                }),
            }
        )

        return response.ok
    } catch (error) {
        console.error('Error adding contact to workflow:', error)
        return false
    }
}

serve(async (req) => {
    try {
        const { workflow, contactId, customData }: TriggerRequest = await req.json()

        if (!workflow || !contactId) {
            return new Response(
                JSON.stringify({ error: 'Missing workflow or contactId' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const workflowId = WORKFLOWS[workflow]
        if (!workflowId) {
            return new Response(
                JSON.stringify({ error: `Unknown workflow: ${workflow}` }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const success = await triggerWorkflow(contactId, workflowId, customData)

        return new Response(
            JSON.stringify({ success, workflow, contactId }),
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
