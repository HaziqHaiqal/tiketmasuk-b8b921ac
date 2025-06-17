
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Minus, Plus, Trash2 } from 'lucide-react';
import { useWaitingListCart } from '@/hooks/useWaitingListCart';
import { useAuth } from '@/hooks/useAuth';

const EventCart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cartItems, 
    waitingListEntry, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice, 
    clearCart, 
    getExpiryTime 
  } = useWaitingListCart(id!);
  const [timeLeft, setTimeLeft] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [offerExpired, setOfferExpired] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const expiryTime = getExpiryTime();
    
    if (expiryTime && cartItems.length > 0) {
      const updateTimer = () => {
        const now = Date.now();
        const difference = expiryTime - now;
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
          setOfferExpired(false);
        } else {
          setTimeLeft(0);
          setOfferExpired(true);
        }
      };
      
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [cartItems.length, getExpiryTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleProceed = () => {
    if (offerExpired) {
      return;
    }
    
    if (user) {
      navigate(`/event/${id}/complete-purchase`);
    }
  };

  const handleClearExpiredCart = () => {
    clearCart(navigate);
  };

  // Show waiting list status
  const getStatusContent = () => {
    if (!waitingListEntry) return null;

    if (waitingListEntry.status === 'waiting') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">You're in the waiting list</h3>
          <p className="text-blue-600">
            You'll be notified when tickets become available. Keep this page open to be ready when your turn comes!
          </p>
        </div>
      );
    }

    if (waitingListEntry.status === 'offered' && timeLeft > 0 && !offerExpired) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">Tickets offered!</h3>
          <p className="text-green-600">
            You have {formatTime(timeLeft)} to complete your purchase before the offer expires.
          </p>
        </div>
      );
    }

    if (offerExpired) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Offer Expired</h3>
          <p className="text-red-600 mb-3">
            Your ticket offer has expired. You can join the waiting list again to get a new offer.
          </p>
          <Button 
            onClick={handleClearExpiredCart}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Clear Cart & Return to Event
          </Button>
        </div>
      );
    }

    return null;
  };

  if (!user) {
    return null; // Will redirect to login
  }

  if (cartItems.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some tickets to get started!</p>
          <Button onClick={() => navigate(`/event/${id}`)}>
            Browse Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate(`/event/${id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
            {waitingListEntry?.status === 'offered' && timeLeft > 0 && !offerExpired && (
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Time remaining: {formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getStatusContent()}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Cart</CardTitle>
                <p className="text-gray-600">Review your selected tickets</p>
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
                        <p className="text-sm text-gray-500">Type: {item.ticketType}</p>
                        <p className="text-lg font-bold text-blue-600">RM{item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={offerExpired}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={offerExpired}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={offerExpired}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.title} x{item.quantity}</span>
                        <span>RM{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={offerExpired}
                      />
                      <Button variant="outline" size="sm" className="w-full" disabled={offerExpired}>
                        Apply Code
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>RM{getTotalPrice()}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleProceed}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    disabled={waitingListEntry?.status !== 'offered' || offerExpired}
                  >
                    {offerExpired 
                      ? 'Offer Expired'
                      : waitingListEntry?.status === 'offered' 
                        ? 'Proceed to Checkout'
                        : 'Waiting for ticket offer...'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCart;
