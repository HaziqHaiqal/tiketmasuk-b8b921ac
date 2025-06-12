
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, X, ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';

interface CartTimerBarProps {
  eventId: string;
}

const CartTimerBar: React.FC<CartTimerBarProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems, clearCart } = useShoppingCart();
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [isMinimized, setIsMinimized] = useState(false);

  // Show timer on all pages except order-summary (final step)
  const hideTimer = location.pathname.includes('/order-summary');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearCart(eventId, navigate);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clearCart, navigate, eventId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h:${minutes.toString().padStart(2, '0')}m:${remainingSeconds.toString().padStart(2, '0')}s`;
    }
    return `${minutes}m:${remainingSeconds.toString().padStart(2, '0')}s`;
  };

  const handleRemove = () => {
    clearCart(eventId, navigate);
  };

  const handleView = () => {
    navigate(`/event/${eventId}/cart`);
  };

  if (getTotalItems() === 0 || hideTimer) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 ${
        isMinimized ? 'w-12 h-12' : 'w-80'
      }`}>
        {isMinimized ? (
          <div className="flex items-center justify-center h-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="w-full h-full rounded-lg"
            >
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">
                  {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in cart
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 font-medium">
                Time remaining: {formatTime(timeLeft)}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleView}
                className="flex-1 text-xs"
              >
                View Cart
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRemove}
                className="px-2"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartTimerBar;
