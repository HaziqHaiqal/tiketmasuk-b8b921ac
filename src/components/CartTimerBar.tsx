
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, X, Users } from 'lucide-react';
import { useWaitingListCart } from '@/hooks/useWaitingListCart';
import { useQueueStats } from '@/hooks/useQueueStats';
import { useAuth } from '@/hooks/useAuth';

interface CartTimerBarProps {
  eventId: string;
}

const CartTimerBar: React.FC<CartTimerBarProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getTotalItems, clearCart, getExpiryTime, waitingListEntry } = useWaitingListCart(eventId);
  const { queueStats } = useQueueStats(eventId);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    console.log('CartTimerBar - User:', !!user);
    console.log('CartTimerBar - Waiting list entry:', waitingListEntry);
    console.log('CartTimerBar - Queue stats:', queueStats);
    
    let timer: NodeJS.Timeout;
    
    const expirationTime = getExpiryTime();
    
    if (expirationTime && getTotalItems() > 0 && waitingListEntry?.status === 'offered') {
      const updateTimer = () => {
        const now = Date.now();
        const difference = expirationTime - now;
        
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
          clearCart(navigate);
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
    waitingListEntry?.offer_expires_at, 
    waitingListEntry?.status,
    getTotalItems(), 
    getExpiryTime,
    clearCart, 
    navigate
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
    clearCart(navigate);
  };

  const handleView = () => {
    navigate(`/event/${eventId}/cart`);
  };

  const isHomePage = location.pathname === '/';

  // Don't show if no items in cart
  if (getTotalItems() === 0) return null;

  // Show different content based on waiting list status
  const getStatusInfo = () => {
    if (!waitingListEntry) return null;

    if (waitingListEntry.status === 'offered' && timeLeft > 0) {
      return (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              Reservation expires in: {formatTime(timeLeft)}
            </span>
          </div>
          
          {/* Show detailed queue info */}
          {queueStats.ticketTypeStats.length > 0 && (
            <div className="hidden md:flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                Total tickets: {getTotalItems()}, {queueStats.ticketTypeStats.map(stat => 
                  `${stat.totalInQueue}/${stat.totalLimit} in queue for ${stat.ticketType}`
                ).join(', ')}
              </span>
            </div>
          )}
        </div>
      );
    }

    if (waitingListEntry.status === 'waiting') {
      return (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">
              In waiting list
            </span>
          </div>
          
          {/* Show detailed queue info */}
          {queueStats.ticketTypeStats.length > 0 && (
            <div className="hidden md:flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
              <span className="text-sm font-medium">
                Total tickets: {getTotalItems()}, {queueStats.ticketTypeStats.map(stat => 
                  `${stat.totalInQueue}/${stat.totalLimit} in queue for ${stat.ticketType}`
                ).join(', ')}
              </span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 p-4 shadow-lg z-50 ${
        waitingListEntry?.status === 'offered' && timeLeft > 0 
          ? 'bg-orange-600 text-white' 
          : 'bg-blue-600 text-white'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {getStatusInfo()}
          </div>
          
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleView}
              className="bg-white text-blue-600 hover:bg-gray-100 border-white"
            >
              View Cart ({getTotalItems()})
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRemove}
              className="bg-transparent border-white text-white hover:bg-white/10"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
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
