
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Calendar, MapPin, Mail, Phone, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const eventId = searchParams.get('event_id');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const totalAmount = parseFloat(searchParams.get('total_amount') || '0');
  const customerFirstName = searchParams.get('customer_first_name') || '';
  const customerLastName = searchParams.get('customer_last_name') || '';
  const customerEmail = searchParams.get('customer_email') || '';
  const customerPhone = searchParams.get('customer_phone') || '';
  const customerAddress = searchParams.get('customer_address') || '';

  useEffect(() => {
    const recordBookingAndGenerateTickets = async () => {
      if (!eventId) {
        toast({
          title: "Error",
          description: "Invalid payment information",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log('Recording booking...');
        
        // Get current user ID (could be null for guest users)
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;

        // Generate a unique user ID for guests
        const guestUserId = userId || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // First, get event details
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) {
          console.error('Event fetch error:', eventError);
          throw new Error('Event not found');
        }

        // Create booking record
        const bookingData = {
          user_id: userId,
          booking_type: 'event',
          customer_first_name: customerFirstName,
          customer_last_name: customerLastName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          total_amount: totalAmount,
          payment_status: 'completed',
          payment_method: 'toyyibpay',
          payment_reference: searchParams.get('billcode') || 'completed',
          booking_details: {
            event_id: eventId,
            event_name: event.name,
            event_date: event.event_date,
            event_location: event.location,
            quantity: quantity,
            unit_price: event.price
          },
          completed_at: new Date().toISOString()
        };

        console.log('Creating booking:', bookingData);

        const { data: bookingResult, error: bookingError } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select()
          .single();

        if (bookingError) {
          console.error('Booking creation error:', bookingError);
          throw new Error('Failed to create booking record');
        }

        console.log('Booking created:', bookingResult);
        setBooking(bookingResult);

        // Generate tickets via edge function
        console.log('Calling generate-ticket function...');
        const { data: ticketData, error: ticketError } = await supabase.functions.invoke('generate-ticket', {
          body: {
            userId: guestUserId,
            eventId: eventId,
            quantity: quantity,
            totalPrice: totalAmount,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            customerFirstName: customerFirstName,
            customerLastName: customerLastName,
            bookingId: bookingResult.id
          }
        });

        if (ticketError) {
          console.error('Ticket generation error:', ticketError);
          toast({
            title: "Ticket Generation Failed",
            description: ticketError.message || "Edge Function returned a non-2xx status code",
            variant: "destructive",
          });
        } else {
          console.log('Tickets generated successfully:', ticketData);
          toast({
            title: "Payment Successful!",
            description: "Your tickets have been generated and sent to your email.",
          });
        }

      } catch (error) {
        console.error('Error in payment processing:', error);
        toast({
          title: "Processing Error",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    recordBookingAndGenerateTickets();
  }, [eventId, quantity, totalAmount, customerEmail, customerPhone, customerFirstName, customerLastName, customerAddress, toast, searchParams]);

  const downloadTicket = () => {
    // This would typically download a PDF ticket
    toast({
      title: "Download Started",
      description: "Your ticket is being downloaded...",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your booking has been confirmed.</p>
        </div>

        {/* Booking Details */}
        {booking && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Booking ID</label>
                  <p className="font-mono text-sm">{booking.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Reference</label>
                  <p className="font-mono text-sm">{booking.payment_reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                    {booking.payment_status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="text-lg font-bold text-blue-600">RM{booking.total_amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Booking Date</label>
                  <p>{new Date(booking.created_at).toLocaleDateString()} at {new Date(booking.created_at).toLocaleTimeString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Event Name</label>
                  <p className="font-semibold">{booking.booking_details.event_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date & Time</label>
                  <p>{new Date(booking.booking_details.event_date * 1000).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p>{booking.booking_details.event_location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p>{booking.booking_details.quantity} ticket{booking.booking_details.quantity > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Unit Price</label>
                  <p>RM{booking.booking_details.unit_price} per ticket</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customer Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p>{customerFirstName} {customerLastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </label>
                <p>{customerEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Phone
                </label>
                <p>{customerPhone}</p>
              </div>
              {customerAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p>{customerAddress}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={downloadTicket} className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download Ticket
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>

        {/* Important Notes */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Please bring a printed copy or digital version of your ticket to the event</li>
              <li>• Your QR code will be required for entry</li>
              <li>• Arrive at least 30 minutes before the event starts</li>
              <li>• A confirmation email has been sent to {customerEmail}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
