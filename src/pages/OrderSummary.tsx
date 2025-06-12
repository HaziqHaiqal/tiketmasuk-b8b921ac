
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CreditCard, User, FileText } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useToyyibPay } from '@/hooks/useToyyibPay';
import CartTimerBar from '@/components/CartTimerBar';
import { toast } from 'sonner';

interface PurchaseFormData {
  buyerFullName: string;
  buyerEmail: string;
  buyerPhone: string;
  ticketHolderFullName: string;
  ticketHolderEmail: string;
  ticketHolderPhone: string;
  ticketHolderIC: string;
  ticketHolderDOB: string;
  ticketHolderGender: string;
  ticketHolderCountry: string;
  ticketHolderState: string;
  ticketHolderAddress: string;
  ticketHolderPostcode: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

const OrderSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, getTotalItems } = useShoppingCart();
  const { createPayment, loading, error } = useToyyibPay();
  const [formData, setFormData] = useState<PurchaseFormData | null>(null);

  useEffect(() => {
    const savedFormData = localStorage.getItem('purchaseFormData');
    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
      } catch (error) {
        console.error('Error parsing form data:', error);
        navigate(`/event/${id}/complete-purchase`);
      }
    } else {
      navigate(`/event/${id}/complete-purchase`);
    }
  }, [id, navigate]);

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

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order summary...</p>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      await createPayment({
        eventId: id!,
        eventName: `Event Ticket Purchase`,
        totalAmount: getTotalPrice(),
        customerFirstName: formData.buyerFullName.split(' ')[0],
        customerLastName: formData.buyerFullName.split(' ').slice(1).join(' '),
        customerEmail: formData.buyerEmail,
        customerPhone: formData.buyerPhone,
        customerAddress: formData.ticketHolderAddress,
        quantity: getTotalItems(),
      });
    } catch (err) {
      toast.error('Failed to process payment. Please try again.');
      console.error('Payment error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate(`/event/${id}/complete-purchase`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Purchase Details
            </Button>
            <div className="flex items-center space-x-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Step 3 of 3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buyer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Buyer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.buyerFullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.buyerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{formData.buyerPhone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Holder Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Ticket Holder Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.ticketHolderFullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.ticketHolderEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{formData.ticketHolderPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IC/Passport:</span>
                    <span className="font-medium">{formData.ticketHolderIC}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date of Birth:</span>
                    <span className="font-medium">{new Date(formData.ticketHolderDOB).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium capitalize">{formData.ticketHolderGender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Country:</span>
                    <span className="font-medium">{formData.ticketHolderCountry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">State:</span>
                    <span className="font-medium">{formData.ticketHolderState}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{formData.ticketHolderAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Postcode:</span>
                    <span className="font-medium">{formData.ticketHolderPostcode}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">RM{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.title} x{item.quantity}</span>
                        <span>RM{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>RM{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Fee</span>
                      <span>RM0.00</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>RM{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                      {error}
                    </div>
                  )}
                  
                  <Button 
                    onClick={handlePayment}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    By clicking "Proceed to Payment", you acknowledge that you have read and agreed to our Terms and Conditions and Privacy Policy.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CartTimerBar eventId={id!} />
    </div>
  );
};

export default OrderSummary;
