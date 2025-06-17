
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Minus, Plus, Trash2, Users } from 'lucide-react';
import { useWaitingListCart } from '@/hooks/useWaitingListCart';
import { useQueueStats } from '@/hooks/useQueueStats';
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
  const { queueStats } = useQueueStats(id);
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

  // Timer logic for 30-minute countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const expiryTime = getExpiryTime();
    
    if (expiryTime && cartItems.length > 0 && waitingListEntry?.status === 'offered') {
      const updateTimer = () => {
        const now = Date.now();
        const difference = expiryTime - now;
        
        console.log('Timer update:', { now, expiryTime, difference, secondsLeft: Math.floor(difference / 1000) });
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
          setOfferExpired(false);
        } else {
          setTimeLeft(0);
          setOfferExpired(true);
          // Auto-clear expired cart
          clearCart();
        }
      };
      
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else {
      setTimeLeft(0);
      setOfferExpired(false);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [cartItems.length, waitingListEntry?.status, waitingListEntry?.offer_expires_at, getExpiryTime, clearCart]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  };

  const handleProceed = () => {
    if (offerExpired) {
      return;
    }
    
    if (user && waitingListEntry?.status === 'offered') {
      navigate(`/events/${id}/complete-purchase`);
    }
  };

  const handleClearExpiredCart = () => {
    clearCart(navigate);
  };

  const handleBackToEvent = () => {
    navigate(`/events/${id}`);
  };

  // Get total tickets across all items
  const getTotalTickets = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Show waiting list status with prominent timer and queue info
  const getStatusContent = () => {
    if (!waitingListEntry) return null;

    if (waitingListEntry.status === 'waiting') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-blue-800 text-lg">You're in the waiting list</h3>
          </div>
          <p className="text-blue-600 mb-4">
            You'll be notified when tickets become available. Keep this page open to be ready when your turn comes!
          </p>
          
          {/* Prominent Queue Information */}
          <div className="bg-blue-100 rounded-lg p-4 space-y-3">
            <div className="text-lg font-bold text-blue-800">
              Total tickets: {getTotalTickets()}
            </div>
            
            {queueStats.ticketTypeStats.map((typeStats, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                <div className="text-base font-medium text-blue-800">
                  {typeStats.totalInQueue}/{typeStats.totalLimit} tickets in queue for Tech Conference 2024{typeStats.ticketType !== 'General' ? ` - ${typeStats.ticketType}` : ''}
                </div>
                {typeStats.userQuantity > 0 && (
                  <div className="text-sm text-blue-600 mt-1">
                    Your {typeStats.userQuantity} ticket{typeStats.userQuantity > 1 ? 's' : ''} in this queue
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (waitingListEntry.status === 'offered' && timeLeft > 0 && !offerExpired) {
      return (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-6">
            {/* HUGE TIMER DISPLAY */}
            <div className="bg-orange-500 text-white rounded-lg p-6 text-center shadow-lg">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-medium mb-1">TIME REMAINING</div>
              <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>
              <div className="text-sm mt-2 opacity-90">Complete purchase before expiry</div>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h3 className="font-bold text-orange-800 text-xl mb-2">🎉 Tickets Reserved!</h3>
            <p className="text-orange-700">
              Complete your purchase before the timer expires or your tickets will be released to others in the queue.
            </p>
          </div>
          
          {/* Prominent Queue Information */}
          <div className="bg-orange-100 rounded-lg p-4 space-y-3">
            <div className="text-lg font-bold text-orange-800">
              Total tickets: {getTotalTickets()}
            </div>
            
            {queueStats.ticketTypeStats.map((typeStats, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-orange-500">
                <div className="text-base font-medium text-orange-800">
                  {typeStats.totalInQueue}/{typeStats.totalLimit} tickets in queue for Tech Conference 2024{typeStats.ticketType !== 'General' ? ` - ${typeStats.ticketType}` : ''}
                </div>
                {typeStats.userQuantity > 0 && (
                  <div className="text-sm text-orange-600 mt-1">
                    Your {typeStats.userQuantity} ticket{typeStats.userQuantity > 1 ? 's' : ''} reserved
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (offerExpired) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Offer Expired</h3>
          <p className="text-red-600 mb-3">
            Your ticket reservation has expired. You can try again to join the waiting list.
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
            <Button variant="ghost" onClick={handleBackToEvent}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some tickets to get started!</p>
          <Button onClick={handleBackToEvent}>
            Browse Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={handleBackToEvent}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Event
          </Button>
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
                          disabled={offerExpired || waitingListEntry?.status !== 'offered'}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={offerExpired || waitingListEntry?.status !== 'offered'}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={offerExpired || waitingListEntry?.status !== 'offered'}
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
                        disabled={offerExpired || waitingListEntry?.status !== 'offered'}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full" 
                        disabled={offerExpired || waitingListEntry?.status !== 'offered'}
                      >
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
                  
                  {waitingListEntry?.status === 'waiting' && (
                    <div className="text-center text-sm text-gray-600 mt-2">
                      You're in the queue. Please wait for your turn.
                    </div>
                  )}
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
