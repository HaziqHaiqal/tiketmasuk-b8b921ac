
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface VerifyRequest {
  qrData: string;
  organizerId: string;
  action: 'verify' | 'collect_kit';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Verify ticket request received');
    const { qrData, organizerId, action }: VerifyRequest = await req.json();

    // Parse QR code data
    const ticketData = JSON.parse(qrData);
    const { ticketNumber, eventId, userId } = ticketData;

    // Verify organizer has access to this event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('vendor_id', organizerId)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found or access denied');
    }

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        profiles!tickets_user_id_fkey(name, email),
        events!tickets_event_id_fkey(name, location, event_date)
      `)
      .eq('ticket_number', ticketNumber)
      .eq('event_id', eventId)
      .single();

    if (ticketError || !ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== 'active') {
      throw new Error('Ticket is not active');
    }

    let updateData: any = {};
    let message = '';

    if (action === 'verify') {
      message = 'Ticket verified successfully';
    } else if (action === 'collect_kit') {
      if (ticket.kit_collected) {
        throw new Error('Kit already collected');
      }
      updateData = {
        kit_collected: true,
        collected_at: new Date().toISOString(),
        collected_by: organizerId
      };
      message = 'Kit collection marked successfully';
    }

    // Update ticket if needed
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticket.id);

      if (updateError) {
        console.error('Error updating ticket:', updateError);
        throw new Error('Failed to update ticket');
      }
    }

    console.log('Ticket verification completed:', action);

    return new Response(JSON.stringify({
      success: true,
      message,
      ticket: {
        ...ticket,
        ...updateData
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error verifying ticket:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
