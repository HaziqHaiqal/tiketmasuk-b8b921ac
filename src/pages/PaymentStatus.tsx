import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Download, Calendar, MapPin, Mail, Phone, User, Package, Ticket, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const { toast } = useToast();

  const eventId = searchParams.get('event_id');
  const status = searchParams.get('status_id'); // ToyyibPay status: 1 = success, 2 = pending, 3 = failed
  const billCode = searchParams.get('billcode');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const totalAmount = parseFloat(searchParams.get('total_amount') || '0');
  const customerFirstName = searchParams.get('customer_first_name') || '';
  const customerLastName = searchParams.get('customer_last_name') || '';
  const customerEmail = searchParams.get('customer_email') || '';
  const customerPhone = searchParams.get('customer_phone') || '';
  const customerAddress = searchParams.get('customer_address') || '';

  useEffect(() => {
    const determinePaymentStatus = () => {
      if (status === '1') return 'success';
      if (status === '3') return 'failed';
      return 'pending';
    };

    const paymentResult = determinePaymentStatus();
    setPaymentStatus(paymentResult);

    if (paymentResult === 'success') {
      recordSuccessfulBooking();
    } else {
      setLoading(false);
    }
  }, [status, eventId, quantity, totalAmount, customerEmail, customerPhone, customerFirstName, customerLastName, customerAddress]);

  const recordSuccessfulBooking = async () => {
    if (!eventId) {
      toast({
        title: "Error",
        description: "Invalid payment information",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Recording successful booking...');
      
      // Get current user ID (could be null for guest users)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

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
        payment_reference: billCode || 'completed',
        booking_details: {
          event_id: eventId,
          event_name: event.name,
          event_date: event.event_date,
          event_location: event.location,
          quantity: quantity,
          unit_price: event.price,
          ticket_type: 'General Admission'
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

      // Send confirmation email
      try {
        console.log('Sending confirmation email...');
        const { error: emailError } = await supabase.functions.invoke('send-email', {
          body: {
            to: customerEmail,
            templateType: 'purchase_confirmation',
            variables: {
              customer_name: `${customerFirstName} ${customerLastName}`,
              booking_id: bookingResult.id,
              event_name: event.name,
              event_date: new Date(event.event_date * 1000).toLocaleDateString(),
              event_location: event.location,
              quantity: quantity,
              total_amount: totalAmount
            }
          }
        });

        if (emailError) {
          console.error('Email sending error:', emailError);
          toast({
            title: "Booking Confirmed",
            description: "Your booking was successful, but we couldn't send the confirmation email.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Payment Successful!",
            description: "Your booking has been confirmed and a confirmation email has been sent.",
          });
        }
      } catch (emailErr) {
        console.error('Email function error:', emailErr);
        toast({
          title: "Booking Confirmed", 
          description: "Your booking was successful, but we couldn't send the confirmation email.",
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

  const downloadTicket = () => {
    toast({
      title: "Download Started",
      description: "Your ticket is being downloaded...",
    });
  };

  const retryPayment = () => {
    // Redirect back to payment page
    window.location.href = `/event/${eventId}/payment`;
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

  // Failed Payment UI
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600">Unfortunately, your payment could not be processed.</p>
          </div>

          <Card className="mb-8 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-900">Payment Details</h3>
              </div>
              <div className="space-y-2 text-sm text-red-800">
                <p><strong>Bill Code:</strong> {billCode || 'N/A'}</p>
                <p><strong>Amount:</strong> RM{totalAmount}</p>
                <p><strong>Status:</strong> Failed</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={retryPayment} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/event/${eventId}`}>Back to Event</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Pending Payment UI
  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
            <p className="text-gray-600">Your payment is being processed. Please wait...</p>
          </div>

          <Card className="mb-8 bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-yellow-900">Payment Status</h3>
              </div>
              <div className="space-y-2 text-sm text-yellow-800">
                <p><strong>Bill Code:</strong> {billCode || 'N/A'}</p>
                <p><strong>Amount:</strong> RM{totalAmount}</p>
                <p><strong>Status:</strong> Pending</p>
                <p>Please check back in a few minutes or contact support if the issue persists.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>
              Refresh Status
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success Payment UI (existing code)
  const renderBookingDetails = () => {
    if (!booking?.booking_details) return null;

    const details = booking.booking_details;

    if (booking.booking_type === 'event') {
      return (
        <div className="space-y-3">
          <div className="flex items-center">
            <Ticket className="w-5 h-5 mr-2 text-blue-600" />
            <div>
              <label className="text-sm font-medium text-gray-500">Event Ticket</label>
              <p className="font-semibold">{details.event_name}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Date & Time</label>
            <p>{new Date(details.event_date * 1000).toLocaleDateString()} at {new Date(details.event_date * 1000).toLocaleTimeString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Location</label>
            <p>{details.event_location}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Ticket Type</label>
            <p>{details.ticket_type || 'General Admission'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Quantity</label>
            <p>{details.quantity} ticket{details.quantity > 1 ? 's' : ''}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Unit Price</label>
            <p>RM{details.unit_price} per ticket</p>
          </div>
        </div>
      );
    } else if (booking.booking_type === 'product') {
      return (
        <div className="space-y-3">
          <div className="flex items-center">
            <Package className="w-5 h-5 mr-2 text-green-600" />
            <label className="text-sm font-medium text-gray-500">Products</label>
          </div>
          {details.items?.map((item: any, index: number) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4">
              <p className="font-semibold">{item.product_name}</p>
              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              <p className="text-sm text-gray-600">Unit Price: RM{item.unit_price}</p>
              <p className="text-sm font-medium">Subtotal: RM{(item.quantity * item.unit_price).toFixed(2)}</p>
            </div>
          ))}
        </div>
      );
    } else if (booking.booking_type === 'mixed') {
      return (
        <div className="space-y-4">
          {details.event && (
            <div>
              <div className="flex items-center mb-2">
                <Ticket className="w-5 h-5 mr-2 text-blue-600" />
                <label className="text-sm font-medium text-gray-500">Event Ticket</label>
              </div>
              <div className="border-l-2 border-blue-200 pl-4">
                <p className="font-semibold">{details.event.event_name}</p>
                <p className="text-sm text-gray-600">Quantity: {details.event.quantity}</p>
                <p className="text-sm text-gray-600">Unit Price: RM{details.event.unit_price}</p>
              </div>
            </div>
          )}
          {details.products && details.products.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                <label className="text-sm font-medium text-gray-500">Products</label>
              </div>
              {details.products.map((item: any, index: number) => (
                <div key={index} className="border-l-2 border-green-200 pl-4 mb-2">
                  <p className="font-semibold">{item.product_name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-600">Unit Price: RM{item.unit_price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

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

            {/* Purchase Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Purchase Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderBookingDetails()}
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
            Download Receipt
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
              <li>• Please save this confirmation page for your records</li>
              <li>• Your booking confirmation will be required for entry</li>
              <li>• Arrive at least 30 minutes before the event starts</li>
              <li>• A confirmation email has been sent to {customerEmail}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentStatus;
