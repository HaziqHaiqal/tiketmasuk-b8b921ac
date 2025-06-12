
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Minus, Plus, Trash2 } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';

const EventCart = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useShoppingCart();
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes
  const [promoCode, setPromoCode] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearCart();
          navigate(`/event/${id}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clearCart, navigate, id]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleProceed = () => {
    if (user) {
      navigate(`/event/${id}/complete-purchase`);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleGuestContinue = () => {
    setShowAuthModal(false);
    navigate(`/event/${id}/complete-purchase`);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    navigate(`/event/${id}/complete-purchase`);
  };

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
            <div className="flex items-center space-x-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Time remaining: {formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        <p className="text-lg font-bold text-blue-600">RM{item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
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
                      />
                      <Button variant="outline" size="sm" className="w-full">
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
                  >
                    {user ? 'Proceed to Checkout' : 'Continue as Guest or Login'}
                  </Button>

                  {!user && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Have an account? Sign in for faster checkout
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestContinue={handleGuestContinue}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default EventCart;
