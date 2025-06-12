
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';

interface CartTimerBarProps {
  eventId: string;
}

const CartTimerBar: React.FC<CartTimerBarProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const { getTotalItems, clearCart } = useShoppingCart();
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearCart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clearCart]);

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
    clearCart();
  };

  const handleView = () => {
    navigate(`/event/${eventId}/cart`);
  };

  if (getTotalItems() === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-orange-600 text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5" />
          <span className="font-medium">
            There are items in your cart. Time remaining {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleView}
            className="bg-white text-orange-600 hover:bg-gray-100"
          >
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRemove}
            className="bg-transparent border-white text-white hover:bg-orange-700"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartTimerBar;
