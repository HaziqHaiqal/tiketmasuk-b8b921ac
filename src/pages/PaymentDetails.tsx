
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Clock, CreditCard, MapPin } from 'lucide-react';
import { useTicketReservation } from '@/hooks/useTicketReservation';
import { useToyyibPay } from '@/hooks/useToyyibPay';
import { useToast } from '@/hooks/use-toast';

const PaymentDetails = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { reservation } = useTicketReservation(eventId);
  const { createPayment, loading } = useToyyibPay();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [sameAsBilling, setSameAsBilling] = useState(false);

  const [billingDetails, setBillingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Malaysia'
  });

  const [shippingDetails, setShippingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Malaysia'
  });

  // Countdown timer
  useEffect(() => {
    if (reservation && reservation.expires_at) {
      const expirationTime = new Date(reservation.expires_at).getTime();
      
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const difference = expirationTime - now;
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
        } else {
          setTimeLeft(0);
          clearInterval(timer);
          navigate(`/event/${eventId}`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [reservation, navigate, eventId]);

  // Auto-populate shipping details when checkbox is checked
  useEffect(() => {
    if (sameAsBilling) {
      setShippingDetails({ ...billingDetails });
    }
  }, [sameAsBilling, billingDetails]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateBillingDetails = (field: string, value: string) => {
    setBillingDetails(prev => ({ ...prev, [field]: value }));
  };

  const updateShippingDetails = (field: string, value: string) => {
    if (!sameAsBilling) {
      setShippingDetails(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    const requiredBillingFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    
    for (const field of requiredBillingFields) {
      if (!billingDetails[field as keyof typeof billingDetails]) {
        toast({
          title: "Missing Billing Information",
          description: `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (!sameAsBilling) {
      for (const field of requiredBillingFields) {
        if (!shippingDetails[field as keyof typeof shippingDetails]) {
          toast({
            title: "Missing Shipping Information",
            description: `Please fill in the shipping ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingDetails.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    const ticketHolders = JSON.parse(localStorage.getItem('ticketHolders') || '[]');
    const ticketPrice = 89; // This should come from event data
    const totalAmount = reservation?.quantity ? reservation.quantity * ticketPrice : 0;

    try {
      await createPayment({
        eventId: eventId || '',
        eventName: 'Event Name', // This should come from event data
        totalAmount,
        customerFirstName: billingDetails.firstName,
        customerLastName: billingDetails.lastName,
        customerEmail: billingDetails.email,
        customerPhone: billingDetails.phone,
        customerAddress: billingDetails.address,
        quantity: reservation?.quantity || 1,
        ticketHolders,
        billingDetails,
        shippingDetails: sameAsBilling ? billingDetails : shippingDetails
      });
      
      toast({
        title: "Redirecting to payment",
        description: "You will be redirected to ToyyibPay shortly.",
      });
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-gray-600 mb-4">No active reservation found</p>
            <Button asChild>
              <Link to={`/event/${eventId}`}>Back to Event</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate(`/event/${eventId}/tickets`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ticket Details
            </Button>
            <div className="flex items-center space-x-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Time remaining: {formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Billing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billing-firstName">First Name *</Label>
                  <Input
                    id="billing-firstName"
                    value={billingDetails.firstName}
                    onChange={(e) => updateBillingDetails('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="billing-lastName">Last Name *</Label>
                  <Input
                    id="billing-lastName"
                    value={billingDetails.lastName}
                    onChange={(e) => updateBillingDetails('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="billing-email">Email *</Label>
                <Input
                  id="billing-email"
                  type="email"
                  value={billingDetails.email}
                  onChange={(e) => updateBillingDetails('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="billing-phone">Phone *</Label>
                <Input
                  id="billing-phone"
                  type="tel"
                  value={billingDetails.phone}
                  onChange={(e) => updateBillingDetails('phone', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="billing-address">Address *</Label>
                <Input
                  id="billing-address"
                  value={billingDetails.address}
                  onChange={(e) => updateBillingDetails('address', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billing-city">City *</Label>
                  <Input
                    id="billing-city"
                    value={billingDetails.city}
                    onChange={(e) => updateBillingDetails('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="billing-state">State *</Label>
                  <Input
                    id="billing-state"
                    value={billingDetails.state}
                    onChange={(e) => updateBillingDetails('state', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billing-zipCode">Zip Code *</Label>
                  <Input
                    id="billing-zipCode"
                    value={billingDetails.zipCode}
                    onChange={(e) => updateBillingDetails('zipCode', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="billing-country">Country *</Label>
                  <Input
                    id="billing-country"
                    value={billingDetails.country}
                    onChange={(e) => updateBillingDetails('country', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Shipping Details
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="same-as-billing"
                  checked={sameAsBilling}
                  onCheckedChange={setSameAsBilling}
                />
                <Label htmlFor="same-as-billing">Same as billing address</Label>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping-firstName">First Name *</Label>
                  <Input
                    id="shipping-firstName"
                    value={shippingDetails.firstName}
                    onChange={(e) => updateShippingDetails('firstName', e.target.value)}
                    disabled={sameAsBilling}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shipping-lastName">Last Name *</Label>
                  <Input
                    id="shipping-lastName"
                    value={shippingDetails.lastName}
                    onChange={(e) => updateShippingDetails('lastName', e.target.value)}
                    disabled={sameAsBilling}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="shipping-email">Email *</Label>
                <Input
                  id="shipping-email"
                  type="email"
                  value={shippingDetails.email}
                  onChange={(e) => updateShippingDetails('email', e.target.value)}
                  disabled={sameAsBilling}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shipping-phone">Phone *</Label>
                <Input
                  id="shipping-phone"
                  type="tel"
                  value={shippingDetails.phone}
                  onChange={(e) => updateShippingDetails('phone', e.target.value)}
                  disabled={sameAsBilling}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shipping-address">Address *</Label>
                <Input
                  id="shipping-address"
                  value={shippingDetails.address}
                  onChange={(e) => updateShippingDetails('address', e.target.value)}
                  disabled={sameAsBilling}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping-city">City *</Label>
                  <Input
                    id="shipping-city"
                    value={shippingDetails.city}
                    onChange={(e) => updateShippingDetails('city', e.target.value)}
                    disabled={sameAsBilling}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shipping-state">State *</Label>
                  <Input
                    id="shipping-state"
                    value={shippingDetails.state}
                    onChange={(e) => updateShippingDetails('state', e.target.value)}
                    disabled={sameAsBilling}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping-zipCode">Zip Code *</Label>
                  <Input
                    id="shipping-zipCode"
                    value={shippingDetails.zipCode}
                    onChange={(e) => updateShippingDetails('zipCode', e.target.value)}
                    disabled={sameAsBilling}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shipping-country">Country *</Label>
                  <Input
                    id="shipping-country"
                    value={shippingDetails.country}
                    onChange={(e) => updateShippingDetails('country', e.target.value)}
                    disabled={sameAsBilling}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handlePayment}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
            disabled={loading || timeLeft <= 0}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
