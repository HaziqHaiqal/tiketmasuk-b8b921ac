
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Generate ticket request received');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData = await req.json();
    console.log('Request data:', requestData);

    const { 
      userId, 
      eventId, 
      quantity, 
      totalPrice, 
      customerEmail, 
      customerPhone,
      customerFirstName,
      customerLastName,
      bookingId
    } = requestData;

    // Verify the event exists
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.log('Event error:', eventError);
      throw new Error('Event not found');
    }

    console.log('Event found:', event);

    // Generate tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      // Generate unique ticket number
      const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate QR code data (JSON string with ticket info)
      const qrData = JSON.stringify({
        ticketNumber,
        eventId,
        eventName: event.name,
        customerEmail,
        customerName: `${customerFirstName} ${customerLastName}`,
        validUntil: event.event_date
      });

      const ticketData = {
        user_id: userId,
        event_id: eventId,
        booking_id: bookingId,
        ticket_number: ticketNumber,
        qr_code: qrData,
        amount: event.price,
        purchased_at: Date.now(),
        status: 'valid',
        guest_email: customerEmail
      };

      const { data: ticket, error: ticketError } = await supabaseClient
        .from('tickets')
        .insert(ticketData)
        .select()
        .single();

      if (ticketError) {
        console.error('Ticket creation error:', ticketError);
        throw new Error(`Failed to create ticket ${i + 1}`);
      }

      tickets.push(ticket);
      console.log(`Ticket ${i + 1} created:`, ticket);
    }

    // Send confirmation email (you can implement this later)
    console.log('Tickets generated successfully, should send email to:', customerEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        tickets,
        message: `${quantity} ticket(s) generated successfully`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating tickets:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
