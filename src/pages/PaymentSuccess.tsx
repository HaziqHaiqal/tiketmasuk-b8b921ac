
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft, Ticket, Calendar, MapPin, User, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const { toast } = useToast();

  // Get parameters from URL
  const eventId = searchParams.get('event_id');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const totalAmount = parseFloat(searchParams.get('total_amount') || '0');
  const customerEmail = searchParams.get('customer_email');
  const customerPhone = searchParams.get('customer_phone');
  const billCode = searchParams.get('billcode') || searchParams.get('bill_code');

  useEffect(() => {
    if (eventId && customerEmail) {
      recordPurchaseAndGenerateTickets();
    }
  }, [eventId, customerEmail]);

  const recordPurchaseAndGenerateTickets = async () => {
    if (!eventId || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Event ID or customer email is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // First, record the purchase in event_purchases table
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('event_purchases')
        .insert({
          event_id: eventId,
          user_id: null, // For guest purchases
          quantity,
          unit_price: totalAmount / quantity,
          total_price: totalAmount,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          bill_code: billCode,
          payment_status: 'completed',
          payment_method: 'toyyibpay'
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('Purchase recording error:', purchaseError);
      }

      setPurchaseDetails(purchaseData);

      // Generate a guest user ID for ticket generation
      const guestUserId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Generate tickets using the edge function
      const { data: ticketData, error: ticketError } = await supabase.functions.invoke('generate-ticket', {
        body: {
          userId: guestUserId,
          eventId: eventId,
          quantity: quantity,
          totalPrice: totalAmount,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          billCode: billCode
        }
      });

      if (ticketError) {
        console.error('Ticket generation error:', ticketError);
        throw new Error(ticketError.message || 'Failed to generate tickets');
      }

      if (ticketData?.tickets) {
        setTickets(ticketData.tickets);
        toast({
          title: "Tickets Generated",
          description: `${quantity} ticket(s) generated successfully!`,
        });
      }

    } catch (error: any) {
      console.error('Error in purchase process:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process purchase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = (ticket: any) => {
    const ticketHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Event Ticket</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .ticket { border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .header { text-align: center; border-bottom: 2px dashed #3b82f6; padding-bottom: 20px; margin-bottom: 20px; }
          .event-title { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .detail-item { padding: 10px; background: #f8fafc; border-radius: 5px; }
          .detail-label { font-weight: bold; color: #374151; }
          .detail-value { color: #1f2937; margin-top: 5px; }
          .qr-section { text-align: center; border-top: 2px dashed #3b82f6; padding-top: 20px; }
          .qr-code { max-width: 200px; margin: 10px auto; }
          .ticket-number { font-size: 18px; font-weight: bold; color: #dc2626; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <div class="event-title">${ticket.events?.name || 'Event Ticket'}</div>
            <div class="ticket-number">Ticket #${ticket.ticket_number}</div>
          </div>
          
          <div class="details">
            <div class="detail-item">
              <div class="detail-label">📅 Event Date</div>
              <div class="detail-value">${new Date(ticket.events?.event_date).toLocaleDateString()}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">📍 Location</div>
              <div class="detail-value">${ticket.events?.location || 'TBA'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">👤 Customer</div>
              <div class="detail-value">${ticket.user?.name || customerEmail}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">📧 Email</div>
              <div class="detail-value">${ticket.user?.email || customerEmail}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">📱 Phone</div>
              <div class="detail-value">${ticket.user?.phone || customerPhone || 'N/A'}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">💰 Amount Paid</div>
              <div class="detail-value">RM${ticket.amount || (totalAmount / quantity)}</div>
            </div>
          </div>

          <div class="qr-section">
            <p><strong>QR Code for Entry:</strong></p>
            <img src="${ticket.qr_code}" alt="QR Code" class="qr-code" />
            <p style="margin-top: 10px; font-size: 12px;">Present this QR code at the event entrance</p>
          </div>

          <div class="footer">
            <p>Bill Code: ${billCode || 'N/A'} | Generated: ${new Date().toLocaleString()}</p>
            <p>Please keep this ticket safe and bring it to the event.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([ticketHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.ticket_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">Your tickets have been confirmed</p>
        </div>

        {/* Purchase Summary */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-green-500 text-white">
            <CardTitle className="flex items-center">
              <Ticket className="w-6 h-6 mr-2" />
              Purchase Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="font-semibold">Event Tickets</p>
                    <p className="text-gray-600">Quantity: {quantity}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-semibold">Customer</p>
                    <p className="text-gray-600">{customerEmail}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-green-600">RM{totalAmount.toFixed(2)}</p>
                </div>
                {billCode && (
                  <div>
                    <p className="font-semibold">Bill Code</p>
                    <p className="text-gray-600 font-mono">{billCode}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-blue-500 text-white">
            <CardTitle className="flex items-center">
              <User className="w-6 h-6 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-gray-600">{customerEmail}</p>
                </div>
              </div>
              {customerPhone && (
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-gray-600">{customerPhone}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tickets Section */}
        {tickets.length > 0 && (
          <Card className="mb-8 shadow-lg">
            <CardHeader className="bg-purple-500 text-white">
              <CardTitle className="flex items-center">
                <Download className="w-6 h-6 mr-2" />
                Your Tickets ({tickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={ticket.id} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">Ticket #{ticket.ticket_number}</p>
                        <p className="text-gray-600">{ticket.events?.name || 'Event Ticket'}</p>
                        <p className="text-sm text-gray-500">
                          Generated: {new Date(ticket.purchase_date || ticket.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => downloadTicket(ticket)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Tickets Button (if tickets not generated yet) */}
        {tickets.length === 0 && (
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-6 text-center">
              <Button
                onClick={recordPurchaseAndGenerateTickets}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-lg px-8 py-3"
              >
                {loading ? 'Generating...' : 'Generate Tickets'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="text-center space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-semibold">📧 Confirmation Email</p>
            <p className="text-yellow-700">A confirmation email with your tickets has been sent to {customerEmail}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50">
              <Link to="/browse">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse More Events
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Link to="/">
                Go to Homepage
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
