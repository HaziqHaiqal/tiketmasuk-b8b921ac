
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
      Denv.get('SUPABASE_URL') ?? '',
      Denv.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { eventId, action } = await req.json()

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

      // Set offer expiration (15 minutes from now)
      const offerExpiresAt = new Date()
      offerExpiresAt.setMinutes(offerExpiresAt.getMinutes() + 15)

      const { error: updateError } = await supabaseClient
        .from('waiting_list')
        .update({
          status: 'offered',
          offer_expires_at: offerExpiresAt.toISOString(),
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

    if (action === 'expire_offers') {
      // Expire old offers and move people back to waiting
      const now = new Date().toISOString()
      
      const { error: expireError } = await supabaseClient
        .from('waiting_list')
        .update({ status: 'expired' })
        .eq('status', 'offered')
        .lt('offer_expires_at', now)

      if (expireError) {
        throw expireError
      }

      return new Response(
        JSON.stringify({ message: 'Expired offers processed' }),
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
