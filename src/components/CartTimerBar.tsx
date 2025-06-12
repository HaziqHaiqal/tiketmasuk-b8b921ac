
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useTicketReservation } from '@/hooks/useTicketReservation';

interface CartTimerBarProps {
  eventId: string;
}

const CartTimerBar: React.FC<CartTimerBarProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems, clearCart } = useShoppingCart();
  const { reservation } = useTicketReservation(eventId);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (reservation && reservation.offer_expires_at) {
      const updateTimer = () => {
        const now = Date.now();
        const difference = reservation.offer_expires_at - now;
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
        } else {
          setTimeLeft(0);
          clearCart(eventId, navigate);
        }
      };

      // Update immediately
      updateTimer();

      // Set up interval
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    } else {
      // Fallback to 20 minute timer if no reservation data
      setTimeLeft(20 * 60);
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
    }
  }, [reservation, clearCart, navigate, eventId]);

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

  const isHomePage = location.pathname === '/';

  if (getTotalItems() === 0) return null;

  return (
    <>
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
      {/* Add margin bottom to body content when cart timer is visible and not on home page */}
      {!isHomePage && (
        <div className="h-20"></div>
      )}
    </>
  );
};

export default CartTimerBar;
