
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
  customerEmail?: string;
  customerPhone?: string;
  billCode?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generate ticket request received');
    const { 
      userId, 
      eventId, 
      quantity, 
      totalPrice, 
      customerEmail, 
      customerPhone, 
      billCode 
    }: TicketRequest = await req.json();

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    console.log('Event found:', event.name);

    // Handle guest users vs registered users
    let userProfile = null;
    const isGuest = userId.startsWith('guest-');
    
    if (!isGuest) {
      // Get user profile for registered users
      const { data: profile, error: profileError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.log('No customer profile found, will use email as identifier');
      } else {
        userProfile = profile;
      }
    }

    const tickets = [];

    // Generate tickets for each quantity
    for (let i = 0; i < quantity; i++) {
      // Generate unique ticket number
      const { data: ticketNumber } = await supabase.rpc('generate_ticket_number');
      
      console.log('Generated ticket number:', ticketNumber);
      
      // Create QR code data with all necessary information
      const qrData = JSON.stringify({
        ticketNumber,
        eventId,
        eventName: event.name,
        customerEmail: customerEmail || userProfile?.email,
        customerPhone: customerPhone || userProfile?.phone,
        eventDate: event.event_date,
        eventLocation: event.location,
        billCode,
        generatedAt: new Date().toISOString()
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Insert ticket into database
      const ticketData = {
        user_id: isGuest ? null : userId,
        event_id: eventId,
        ticket_number: ticketNumber,
        qr_code: qrCode,
        purchase_date: new Date().toISOString(),
        status: 'active',
        guest_email: isGuest || !userProfile ? customerEmail : null,
        amount: totalPrice / quantity,
        purchased_at: Date.now()
      };

      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select(`
          *,
          events!tickets_event_id_fkey(name, event_date, location, description)
        `)
        .single();

      if (ticketError) {
        console.error('Error creating ticket:', ticketError);
        throw new Error('Failed to create ticket');
      }

      // Add user info to ticket response
      const ticketWithUserInfo = {
        ...ticket,
        user: {
          name: userProfile?.full_name || customerEmail || 'Guest',
          email: customerEmail || userProfile?.email || '',
          phone: customerPhone || userProfile?.phone || ''
        }
      };

      tickets.push(ticketWithUserInfo);
    }

    // Record purchase
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: isGuest ? null : userId,
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
    if (customerEmail) {
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
          },
          body: JSON.stringify({
            to: customerEmail,
            templateType: 'ticket_delivery',
            variables: {
              userName: userProfile?.full_name || customerEmail,
              eventName: event.name,
              eventDate: new Date(event.event_date).toLocaleDateString(),
              eventLocation: event.location,
              ticketCount: quantity,
              ticketNumbers: tickets.map(t => t.ticket_number).join(', '),
              billCode: billCode || 'N/A'
            }
          })
        });
      } catch (emailError) {
        console.error('Error sending ticket delivery email:', emailError);
      }
    }

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
