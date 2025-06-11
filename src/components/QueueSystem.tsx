
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, X } from 'lucide-react';
import { useWaitingList } from '@/hooks/useWaitingList';

interface QueueSystemProps {
  eventId: string;
  onComplete: () => void;
  onLeave: () => void;
}

const QueueSystem: React.FC<QueueSystemProps> = ({ eventId, onComplete, onLeave }) => {
  const { waitingListEntry, leaveWaitingList } = useWaitingList(eventId);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (waitingListEntry?.offer_expires_at) {
      const calculateTimeLeft = () => {
        const expiryTime = new Date(waitingListEntry.offer_expires_at!).getTime();
        const now = new Date().getTime();
        const difference = expiryTime - now;
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000)); // Convert to seconds
        } else {
          setTimeLeft(0);
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(timer);
    }
  }, [waitingListEntry?.offer_expires_at]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minutes ${remainingSeconds} seconds`;
  };

  const handlePurchaseTicket = () => {
    setIsRedirecting(true);
    // Simulate redirect delay
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleReleaseTicket = async () => {
    await leaveWaitingList();
    onLeave();
  };

  if (!waitingListEntry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>No queue information available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Event Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NBA Finals 2024 - Game 1</h1>
          <div className="flex items-center justify-center text-gray-600 mb-2">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Madison Square Garden, New York
          </div>
          <div className="flex items-center justify-center text-gray-600 mb-2">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            9/11/2025
          </div>
          <div className="flex items-center justify-center text-gray-600 mb-4">
            <Ticket className="w-5 h-5 mr-2" />
            50 / 50 available <span className="text-orange-500 ml-1">(1 person trying to buy)</span>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block font-semibold">
            RM 899.99
          </div>
        </div>

        <p className="text-gray-700 text-center mb-8">
          Witness the opening game of the NBA Finals!
        </p>

        {/* Queue Status Card */}
        <Card className="border-2 border-yellow-200 bg-white shadow-lg">
          <CardContent className="p-8">
            {waitingListEntry.status === 'offered' && timeLeft !== null ? (
              <>
                {/* Ticket Reserved Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                      <Ticket className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Ticket Reserved</h2>
                      <p className="text-gray-600">
                        Expires in {timeLeft > 0 ? formatTime(timeLeft) : 'expired'}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    A ticket has been reserved for you. Complete your purchase before the timer expires to secure your spot at this event.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!isRedirecting ? (
                    <Button 
                      onClick={handlePurchaseTicket}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-lg"
                      disabled={timeLeft === 0}
                    >
                      Purchase Your Ticket Now →
                    </Button>
                  ) : (
                    <Button 
                      disabled
                      className="w-full bg-gray-400 text-white font-semibold py-3 text-lg"
                    >
                      Redirecting to checkout...
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleReleaseTicket}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 font-semibold py-3"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Release Ticket Offer
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">You're in the Queue</h2>
                <p className="text-gray-600 mb-6">
                  Position #{waitingListEntry.position || 'Unknown'}
                </p>
                <p className="text-gray-700 mb-6">
                  Please wait while we process other customers. You'll be notified when it's your turn to purchase tickets.
                </p>
                <Button 
                  onClick={handleReleaseTicket}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Leave Queue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QueueSystem;
