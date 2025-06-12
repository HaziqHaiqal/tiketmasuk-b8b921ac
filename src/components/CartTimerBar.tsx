
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, X, Users } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useTicketReservation } from '@/hooks/useTicketReservation';
import { useQueueStats } from '@/hooks/useQueueStats';
import { useAuth } from '@/hooks/useAuth';

interface CartTimerBarProps {
  eventId: string;
}

const CartTimerBar: React.FC<CartTimerBarProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getTotalItems, clearCart, getSessionExpiryTime } = useShoppingCart();
  const { reservation } = useTicketReservation(eventId);
  const { queueStats } = useQueueStats(eventId);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    console.log('CartTimerBar - User:', !!user);
    console.log('CartTimerBar - Reservation:', reservation);
    console.log('CartTimerBar - Queue stats:', queueStats);
    
    let timer: NodeJS.Timeout;
    let expirationTime: number | null = null;
    
    if (user && reservation?.offer_expires_at && reservation.status === 'offered') {
      // Authenticated user with active reservation
      expirationTime = reservation.offer_expires_at;
      console.log('Using reservation expiry time:', expirationTime);
    } else if (!user && getTotalItems() > 0) {
      // Guest user with items in cart
      expirationTime = getSessionExpiryTime();
      console.log('Using session expiry time:', expirationTime);
    }
    
    if (expirationTime && getTotalItems() > 0) {
      const updateTimer = () => {
        const now = Date.now();
        const difference = expirationTime! - now;
        
        console.log('Timer update:', { 
          now, 
          expirationTime, 
          difference, 
          timeLeft: Math.floor(difference / 1000) 
        });
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
        } else {
          console.log('Timer expired, clearing cart and redirecting');
          setTimeLeft(0);
          clearCart(eventId, navigate);
        }
      };

      // Update immediately
      updateTimer();

      // Set up interval to update every second
      timer = setInterval(updateTimer, 1000);
    } else {
      setTimeLeft(0);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [
    user, 
    reservation?.offer_expires_at, 
    reservation?.status, 
    getTotalItems(), 
    getSessionExpiryTime(),
    clearCart, 
    navigate, 
    eventId
  ]);

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

  // Don't show if no items in cart
  if (getTotalItems() === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-orange-600 text-white p-4 shadow-lg z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                Time remaining: {formatTime(timeLeft)}
              </span>
            </div>
            {!user && (
              <div className="flex items-center space-x-2 bg-blue-600 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">Guest Session</span>
              </div>
            )}
            {queueStats.totalInSystem > 0 && (
              <div className="flex items-center space-x-2 bg-orange-700 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {queueStats.totalInSystem} people in system
                </span>
              </div>
            )}
            {queueStats.totalWaiting > 0 && (
              <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {queueStats.totalWaiting} waiting in queue
                </span>
              </div>
            )}
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
      {!isHomePage && (
        <div className="h-20"></div>
      )}
    </>
  );
};

export default CartTimerBar;
