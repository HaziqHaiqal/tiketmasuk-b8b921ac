
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { eventId, action } = await req.json()

    if (action === 'process_queue') {
      // Call the database function to process the queue
      const { error } = await supabaseClient.rpc('process_ticket_queue')

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ message: 'Queue processed successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'expire_reservations') {
      // Call the database function to expire old reservations
      const { error } = await supabaseClient.rpc('expire_ticket_reservations')

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ message: 'Reservations expired successfully' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'process_next') {
      // Move the next person in queue to "offered" status
      const { data: nextInLine, error: fetchError } = await supabaseClient
        .from('waiting_list')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'waiting')
        .order('position', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (fetchError) {
        throw fetchError
      }

      if (!nextInLine) {
        return new Response(
          JSON.stringify({ message: 'No one in queue' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }

      // Set offer expiration (20 minutes from now)
      const offerExpiresAt = new Date()
      offerExpiresAt.setMinutes(offerExpiresAt.getMinutes() + 20)

      const { error: updateError } = await supabaseClient
        .from('waiting_list')
        .update({
          status: 'offered',
          offer_expires_at: Math.floor(offerExpiresAt.getTime()),
          updated_at: new Date().toISOString()
        })
        .eq('id', nextInLine.id)

      if (updateError) {
        throw updateError
      }

      return new Response(
        JSON.stringify({ 
          message: 'Next person offered tickets',
          entry: nextInLine 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
