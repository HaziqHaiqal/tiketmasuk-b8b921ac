
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import QRCode from 'https://esm.sh/qrcode@1.5.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface TicketRequest {
  userId: string;
  eventId: string;
  quantity: number;
  totalPrice: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generate ticket request received');
    const { userId, eventId, quantity, totalPrice }: TicketRequest = await req.json();

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const tickets = [];

    // Generate tickets for each quantity
    for (let i = 0; i < quantity; i++) {
      // Generate unique ticket number
      const { data: ticketNumber } = await supabase.rpc('generate_ticket_number');
      
      // Create QR code data
      const qrData = JSON.stringify({
        ticketNumber,
        eventId,
        userId,
        eventName: event.name,
        userEmail: profile.email
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(qrData);

      // Insert ticket into database
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: userId,
          event_id: eventId,
          ticket_number: ticketNumber,
          qr_code: qrCode,
          purchase_date: new Date().toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Error creating ticket:', ticketError);
        throw new Error('Failed to create ticket');
      }

      tickets.push(ticket);
    }

    // Record purchase
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        item_type: 'event',
        item_id: eventId,
        quantity,
        unit_price: totalPrice / quantity,
        total_price: totalPrice,
        payment_status: 'completed'
      });

    if (purchaseError) {
      console.error('Error recording purchase:', purchaseError);
    }

    // Send ticket delivery email
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        to: profile.email,
        templateType: 'ticket_delivery',
        variables: {
          userName: profile.name,
          eventName: event.name,
          eventDate: new Date(event.event_date).toLocaleDateString(),
          eventLocation: event.location,
          ticketCount: quantity,
          ticketNumbers: tickets.map(t => t.ticket_number).join(', ')
        }
      })
    });

    console.log('Tickets generated successfully:', tickets.length);

    return new Response(JSON.stringify({ 
      success: true, 
      tickets,
      message: `${quantity} ticket(s) generated successfully`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error generating tickets:", error);
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
