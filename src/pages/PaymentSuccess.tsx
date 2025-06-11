
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft, Mail, Calendar, MapPin, User, Phone, Receipt, Ticket } from 'lucide-react';
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
  const [eventData, setEventData] = useState<any>(null);
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
    
    if (eventId) {
      fetchEventData();
    }
    
    if (isSuccess && eventId && customerEmail && !tickets.length) {
      generateTickets();
    }
  }, [billCode, status, eventId]);

  const isSuccess = status === '1';

  const fetchEventData = async () => {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return;
      }

      setEventData(event);
    } catch (error) {
      console.error('Failed to fetch event data:', error);
    }
  };

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
      // Create a beautiful HTML ticket that can be printed
      const ticketHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Event Ticket - ${ticket.ticket_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Arial', sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .ticket-container {
              background: white;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
              margin: 20px 0;
            }
            .ticket-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              text-align: center;
              position: relative;
            }
            .ticket-header::after {
              content: '';
              position: absolute;
              bottom: -10px;
              left: 0;
              right: 0;
              height: 20px;
              background: white;
              border-radius: 50% 50% 0 0 / 100% 100% 0 0;
            }
            .ticket-title {
              font-size: 2.5em;
              font-weight: bold;
              margin-bottom: 10px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .event-name {
              font-size: 1.8em;
              margin-bottom: 15px;
              opacity: 0.95;
            }
            .ticket-number {
              background: rgba(255,255,255,0.2);
              padding: 10px 20px;
              border-radius: 25px;
              display: inline-block;
              font-size: 1.1em;
              font-weight: bold;
            }
            .ticket-body {
              padding: 40px;
              background: white;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 40px;
            }
            .detail-card {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 15px;
              border-left: 5px solid #667eea;
            }
            .detail-label {
              font-weight: bold;
              color: #495057;
              font-size: 0.9em;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .detail-value {
              font-size: 1.2em;
              color: #333;
              font-weight: 600;
            }
            .qr-section {
              text-align: center;
              padding: 30px;
              background: #f8f9fa;
              border-radius: 15px;
              margin: 30px 0;
            }
            .qr-title {
              font-size: 1.3em;
              font-weight: bold;
              color: #333;
              margin-bottom: 20px;
            }
            .qr-code {
              border: 3px solid #667eea;
              border-radius: 15px;
              padding: 15px;
              background: white;
              display: inline-block;
            }
            .qr-instructions {
              font-size: 0.9em;
              color: #666;
              margin-top: 15px;
              font-style: italic;
            }
            .ticket-footer {
              background: #f8f9fa;
              padding: 30px;
              text-align: center;
              border-top: 2px dashed #ddd;
            }
            .important-note {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 20px;
              border-radius: 10px;
              margin-top: 20px;
            }
            @media print {
              body { background: white; }
              .ticket-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="ticket-header">
              <div class="ticket-title">🎫 EVENT TICKET</div>
              <div class="event-name">${ticket.event.name}</div>
              <div class="ticket-number">Ticket #: ${ticket.ticket_number}</div>
            </div>
            
            <div class="ticket-body">
              <div class="details-grid">
                <div class="detail-card">
                  <div class="detail-label">📅 Event Date & Time</div>
                  <div class="detail-value">${new Date(ticket.event.event_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">📍 Location</div>
                  <div class="detail-value">${ticket.event.location}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">👤 Customer Name</div>
                  <div class="detail-value">${customerEmail}</div>
                </div>
                
                <div class="detail-card">
                  <div class="detail-label">📞 Phone Number</div>
                  <div class="detail-value">${customerPhone || 'N/A'}</div>
                </div>
              </div>
              
              <div class="qr-section">
                <div class="qr-title">🔍 Entry QR Code</div>
                <div class="qr-code">
                  <img src="${ticket.qr_code}" alt="QR Code" style="width: 250px; height: 250px;" />
                </div>
                <div class="qr-instructions">
                  Present this QR code at the event entrance for quick check-in
                </div>
              </div>
              
              <div class="important-note">
                <strong>⚠️ Important Instructions:</strong><br>
                • This ticket is valid for one person only<br>
                • Please arrive 30 minutes before the event starts<br>
                • Keep this ticket safe and bring it to the event<br>
                • This QR code will be scanned for attendance verification
              </div>
            </div>
            
            <div class="ticket-footer">
              <p style="font-size: 0.9em; color: #666; margin-bottom: 10px;">
                Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </p>
              <p style="font-size: 0.8em; color: #999;">
                For support, please contact the event organizer
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
        description: "Your beautifully designed ticket has been downloaded. Open it in a browser to print.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-white shadow-2xl border-0 overflow-hidden">
          <CardHeader className={`text-center py-8 ${isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
              isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <CheckCircle className={`w-10 h-10 ${
                isSuccess ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              {isSuccess ? '🎉 Payment Successful!' : '❌ Payment Failed'}
            </CardTitle>
            <p className="text-white/90 text-lg">
              {isSuccess ? 'Your ticket purchase has been completed successfully!' : 'Unfortunately, your payment could not be processed.'}
            </p>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {isSuccess ? (
              <>
                {/* Purchase Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-bold text-blue-800 mb-4 flex items-center text-xl">
                    <Receipt className="w-6 h-6 mr-3" />
                    Purchase Summary
                  </h3>
                  
                  {eventData && (
                    <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Ticket className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 text-lg">{eventData.name}</h4>
                          <div className="flex items-center text-gray-600 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(eventData.event_date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{eventData.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Unit Price</div>
                          <div className="font-semibold text-lg">RM {(totalAmount / quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                      <div className="text-blue-600 font-semibold">Bill Code</div>
                      <div className="text-gray-800 font-mono">{billCode}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                      <div className="text-blue-600 font-semibold">Quantity</div>
                      <div className="text-gray-800 font-bold">{quantity} ticket(s)</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                      <div className="text-blue-600 font-semibold">Total Amount</div>
                      <div className="text-gray-800 font-bold text-lg">RM {totalAmount.toFixed(2)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-blue-100">
                      <div className="text-green-600 font-semibold">Status</div>
                      <div className="text-green-600 font-bold">✅ Paid</div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                {(customerEmail || customerPhone) && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="font-bold text-purple-800 mb-4 flex items-center text-xl">
                      <User className="w-6 h-6 mr-3" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerEmail && (
                        <div className="flex items-center bg-white rounded-lg p-3 border border-purple-100">
                          <Mail className="w-5 h-5 mr-3 text-purple-600" />
                          <div>
                            <div className="text-sm text-gray-600">Email Address</div>
                            <div className="font-semibold">{customerEmail}</div>
                          </div>
                        </div>
                      )}
                      {customerPhone && (
                        <div className="flex items-center bg-white rounded-lg p-3 border border-purple-100">
                          <Phone className="w-5 h-5 mr-3 text-purple-600" />
                          <div>
                            <div className="text-sm text-gray-600">Phone Number</div>
                            <div className="font-semibold">{customerPhone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tickets Section */}
                {loading ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-lg">Generating your tickets...</p>
                    <p className="text-sm text-gray-500">This may take a moment</p>
                  </div>
                ) : tickets.length > 0 ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-bold text-green-800 mb-6 flex items-center text-xl">
                      <Download className="w-6 h-6 mr-3" />
                      Your Digital Tickets ({tickets.length})
                    </h3>
                    <div className="grid gap-4">
                      {tickets.map((ticket, index) => (
                        <div key={ticket.id} className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">Ticket #{index + 1}</p>
                                  <p className="text-sm text-gray-600">ID: {ticket.ticket_number}</p>
                                </div>
                              </div>
                              {ticket.event && (
                                <div className="text-sm text-gray-600 ml-11">
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
                              className="bg-green-600 hover:bg-green-700 shadow-lg"
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-green-100 rounded-lg">
                      <p className="text-green-800 text-sm">
                        📧 <strong>Email Confirmation:</strong> A confirmation email with all tickets has been sent to {customerEmail}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-blue-50 rounded-xl border border-blue-200">
                    <Ticket className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                    <p className="text-gray-600 mb-4">Ready to generate your tickets?</p>
                    <Button
                      onClick={generateTickets}
                      className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                      disabled={loading}
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Generate & Download Tickets
                    </Button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button variant="outline" asChild size="lg" className="shadow-lg">
                    <Link to="/browse">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Browse More Events
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-red-800 font-semibold mb-2">Payment Error Details:</h3>
                  <p className="text-red-700">Status Code: {status}</p>
                  {billCode && <p className="text-red-700">Bill Code: {billCode}</p>}
                  <p className="text-red-600 mt-3">Please try again or contact support if the problem persists.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild size="lg">
                    <Link to={`/event/${eventId || ''}`}>
                      Try Again
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="lg">
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
