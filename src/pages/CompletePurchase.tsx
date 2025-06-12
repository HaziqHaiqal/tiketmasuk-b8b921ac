
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Clock, User, FileText, Shield } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useAuth } from '@/hooks/useAuth';
import CartTimerBar from '@/components/CartTimerBar';
import TicketHolderForm from '@/components/TicketHolderForm';
import { useForm } from 'react-hook-form';

interface TicketHolderData {
  fullName: string;
  email: string;
  phone: string;
  icPassport: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  state: string;
  address: string;
  postcode: string;
  ticketType: string;
}

interface PurchaseFormData {
  // Buyer Details
  buyerFullName: string;
  buyerEmail: string;
  buyerPhone: string;
  
  // Ticket Holders
  ticketHolders: TicketHolderData[];
  
  // Waiver
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

const CompletePurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getTotalPrice, getTotalItems } = useShoppingCart();
  const [isLoading, setIsLoading] = useState(false);

  // Group cart items by ticket type and count tickets
  const ticketItems = useMemo(() => {
    return cartItems.filter(item => item.ticketType !== 'product');
  }, [cartItems]);

  // Create ticket holder forms data
  const ticketHoldersList = useMemo(() => {
    const holders: Array<{ ticketType: string; index: number }> = [];
    ticketItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        holders.push({
          ticketType: item.ticketType,
          index: holders.length
        });
      }
    });
    return holders;
  }, [ticketItems]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PurchaseFormData>({
    defaultValues: {
      buyerFullName: user?.user_metadata?.full_name || '',
      buyerEmail: user?.email || '',
      buyerPhone: user?.user_metadata?.phone || '',
      ticketHolders: ticketHoldersList.map(() => ({
        fullName: '',
        email: '',
        phone: '',
        icPassport: '',
        dateOfBirth: '',
        gender: '',
        country: 'Malaysia',
        state: '',
        address: '',
        postcode: '',
        ticketType: ''
      })),
      acceptTerms: false,
      acceptPrivacy: false,
    }
  });

  const watchAcceptTerms = watch('acceptTerms');
  const watchAcceptPrivacy = watch('acceptPrivacy');

  if (getTotalItems() === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button variant="ghost" onClick={() => navigate(`/event/${id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Items in Cart</h1>
          <p className="text-gray-600 mb-8">Please add tickets to your cart first.</p>
          <Button onClick={() => navigate(`/event/${id}`)}>
            Browse Tickets
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = (data: PurchaseFormData) => {
    if (!data.acceptTerms || !data.acceptPrivacy) {
      alert('Please accept all terms and conditions to continue.');
      return;
    }

    setIsLoading(true);
    // Store form data in localStorage for the order summary page
    localStorage.setItem('purchaseFormData', JSON.stringify(data));
    navigate(`/event/${id}/order-summary`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate(`/event/${id}/cart`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cart
            </Button>
            <div className="flex items-center space-x-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Step 2 of 3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Buyer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Buyer Details
              </CardTitle>
              <p className="text-gray-600">Information of the person making the purchase</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyerFullName">Full Name *</Label>
                  <Input
                    id="buyerFullName"
                    {...register('buyerFullName', { required: 'Full name is required' })}
                    className={errors.buyerFullName ? 'border-red-500' : ''}
                  />
                  {errors.buyerFullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.buyerFullName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="buyerEmail">Email *</Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    {...register('buyerEmail', { required: 'Email is required' })}
                    className={errors.buyerEmail ? 'border-red-500' : ''}
                  />
                  {errors.buyerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.buyerEmail.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="buyerPhone">Phone Number *</Label>
                  <Input
                    id="buyerPhone"
                    {...register('buyerPhone', { required: 'Phone number is required' })}
                    className={errors.buyerPhone ? 'border-red-500' : ''}
                  />
                  {errors.buyerPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.buyerPhone.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Holder Details */}
          {ticketHoldersList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Ticket Holder Details
                </CardTitle>
                <p className="text-gray-600">
                  Please provide information for each ticket holder ({ticketHoldersList.length} ticket{ticketHoldersList.length !== 1 ? 's' : ''})
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {ticketHoldersList.map((holder, index) => (
                    <TicketHolderForm
                      key={index}
                      ticketIndex={index}
                      ticketType={holder.ticketType}
                      eventId={id!}
                      register={register}
                      setValue={setValue}
                      errors={errors}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Terms & Conditions
              </CardTitle>
              <p className="text-gray-600">Please review and accept our terms</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptTerms"
                    checked={watchAcceptTerms}
                    onCheckedChange={(checked) => setValue('acceptTerms', !!checked)}
                    className="mt-1"
                  />
                  <div>
                    <Label htmlFor="acceptTerms" className="text-sm font-medium">
                      I agree to the Terms and Conditions *
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      By purchasing this ticket, you acknowledge that you have read, understood, and agree to be bound by the event's terms and conditions, including but not limited to entry requirements, refund policies, and liability waivers.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acceptPrivacy"
                    checked={watchAcceptPrivacy}
                    onCheckedChange={(checked) => setValue('acceptPrivacy', !!checked)}
                    className="mt-1"
                  />
                  <div>
                    <Label htmlFor="acceptPrivacy" className="text-sm font-medium">
                      I agree to the Privacy Policy *
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      I consent to the collection, use, and disclosure of my personal information as described in the Privacy Policy for the purposes of event management and communication.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !watchAcceptTerms || !watchAcceptPrivacy}
            >
              {isLoading ? 'Processing...' : 'Continue to Order Summary'}
            </Button>
          </div>
        </form>
      </div>

      <CartTimerBar eventId={id!} />
    </div>
  );
};

export default CompletePurchase;
