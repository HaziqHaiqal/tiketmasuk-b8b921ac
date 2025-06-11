
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft, Mail, Calendar, MapPin, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TicketData {
  id: string;
  ticket_number: string;
  qr_code: string;
  event: {
    name: string;
    event_date: string;
    location: string;
    description: string;
  };
  user: {
    name: string;
    email: string;
  };
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const { toast } = useToast();
  
  const billCode = searchParams.get('billcode');
  const status = searchParams.get('status_id');
  const eventId = searchParams.get('event_id');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const totalAmount = parseFloat(searchParams.get('total_amount') || '0');
  const customerEmail = searchParams.get('customer_email');
  const customerPhone = searchParams.get('customer_phone');

  useEffect(() => {
    console.log('Payment callback received:', { billCode, status, eventId, quantity, totalAmount, customerEmail });
    
    if (isSuccess && eventId && !tickets.length) {
      generateTickets();
    }
  }, [billCode, status, eventId]);

  const isSuccess = status === '1';

  const generateTickets = async () => {
    if (!eventId || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Event ID or customer email is missing.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get current user or create a guest profile
      const { data: { user } } = await supabase.auth.getUser();
      
      let userId = user?.id;
      
      // If no user logged in, we'll use the customer email as identifier
      if (!userId) {
        // For guest purchases, we'll use a special identifier
        userId = 'guest-' + customerEmail;
      }

      console.log('Generating tickets for:', { userId, eventId, quantity, totalAmount });

      const { data, error } = await supabase.functions.invoke('generate-ticket', {
        body: {
          userId,
          eventId,
          quantity,
          totalPrice: totalAmount,
          customerEmail,
          customerPhone,
          billCode
        }
      });

      if (error) {
        console.error('Error generating tickets:', error);
        throw error;
      }

      console.log('Tickets generated successfully:', data);
      setTickets(data.tickets || []);
      
      // Send confirmation email
      await sendConfirmationEmail();
      
      toast({
        title: "Tickets Generated",
        description: `${quantity} ticket(s) have been generated and sent to your email.`,
      });

    } catch (error: any) {
      console.error('Failed to generate tickets:', error);
      toast({
        title: "Ticket Generation Failed",
        description: error.message || "Failed to generate tickets. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendConfirmationEmail = async () => {
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: customerEmail,
          templateType: 'purchase_confirmation',
          variables: {
            customerEmail,
            billCode,
            eventId,
            quantity,
            totalAmount: totalAmount.toFixed(2),
            ticketCount: quantity
          }
        }
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  const downloadTicket = async (ticket: TicketData) => {
    try {
      // Create a simple HTML ticket that can be printed
      const ticketHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Event Ticket - ${ticket.ticket_number}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .ticket { border: 2px solid #333; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 20px; margin-bottom: 20px; }
            .qr-section { text-align: center; margin: 20px 0; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .detail-item { margin-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-top: 5px; }
            img { max-width: 200px; height: auto; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>EVENT TICKET</h1>
              <h2>${ticket.event.name}</h2>
              <p>Ticket #: ${ticket.ticket_number}</p>
            </div>
            
            <div class="details">
              <div class="detail-item">
                <div class="label">Event Date:</div>
                <div class="value">${new Date(ticket.event.event_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>
              
              <div class="detail-item">
                <div class="label">Location:</div>
                <div class="value">${ticket.event.location}</div>
              </div>
              
              <div class="detail-item">
                <div class="label">Customer Name:</div>
                <div class="value">${customerEmail}</div>
              </div>
              
              <div class="detail-item">
                <div class="label">Phone:</div>
                <div class="value">${customerPhone || 'N/A'}</div>
              </div>
            </div>
            
            <div class="qr-section">
              <p><strong>Scan this QR code for entry:</strong></p>
              <img src="${ticket.qr_code}" alt="QR Code" />
              <p style="font-size: 12px; color: #666; margin-top: 10px;">
                Show this QR code at the event entrance for verification
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
              <p style="font-size: 12px; color: #666;">
                This ticket is valid for one person only. Keep this ticket safe and bring it to the event.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create and download the ticket
      const blob = new Blob([ticketHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticket.ticket_number}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Ticket Downloaded",
        description: "Your ticket has been downloaded. Open it in a browser to print.",
      });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <CheckCircle className={`w-8 h-8 ${
                isSuccess ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <CardTitle className="text-2xl">
              {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isSuccess ? (
              <>
                <p className="text-gray-600 text-center">
                  Your ticket purchase has been completed successfully. You will receive a confirmation email shortly.
                </p>
                
                {/* Payment Details */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <strong className="text-green-800">Bill Code:</strong>
                      <span className="ml-2">{billCode}</span>
                    </div>
                    <div className="flex items-center">
                      <strong className="text-green-800">Quantity:</strong>
                      <span className="ml-2">{quantity} ticket(s)</span>
                    </div>
                    <div className="flex items-center">
                      <strong className="text-green-800">Total Amount:</strong>
                      <span className="ml-2">RM {totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center">
                      <strong className="text-green-800">Payment Status:</strong>
                      <span className="ml-2 text-green-600">Completed</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                {(customerEmail || customerPhone) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {customerEmail && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{customerEmail}</span>
                        </div>
                      )}
                      {customerPhone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{customerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tickets Section */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Generating your tickets...</p>
                  </div>
                ) : tickets.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <Download className="w-5 h-5 mr-2" />
                      Your Tickets
                    </h3>
                    {tickets.map((ticket, index) => (
                      <div key={ticket.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">Ticket #{index + 1}</p>
                            <p className="text-sm text-gray-600">Ticket Number: {ticket.ticket_number}</p>
                            {ticket.event && (
                              <div className="mt-2 text-sm text-gray-600">
                                <div className="flex items-center mt-1">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(ticket.event.event_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center mt-1">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {ticket.event.location}
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => downloadTicket(ticket)}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button
                      onClick={generateTickets}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate Tickets
                    </Button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                  <Button variant="outline" asChild>
                    <Link to="/browse">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Events
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 text-center">
                  Unfortunately, your payment could not be processed. Please try again.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">Error Details:</p>
                  <p className="text-red-700 mt-1">Status Code: {status}</p>
                  {billCode && <p className="text-red-700">Bill Code: {billCode}</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <Link to={`/event/${eventId || ''}`}>
                      Try Again
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/browse">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Events
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
