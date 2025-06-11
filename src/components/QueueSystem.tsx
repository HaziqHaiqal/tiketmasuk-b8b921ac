
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, X, Calendar, MapPin, Clock } from 'lucide-react';
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
          setTimeLeft(Math.floor(difference / 1000));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Event Title Card */}
        <Card className="mb-6 bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">NBA Finals 2024 - Game 1</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center justify-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                  Madison Square Garden, New York
                </div>
                <div className="flex items-center justify-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  9/11/2025
                </div>
                <div className="flex items-center justify-center">
                  <Ticket className="w-4 h-4 mr-2 text-blue-600" />
                  50 / 50 available
                </div>
              </div>
              
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-lg">
                RM 899.99
              </div>
              
              <p className="text-gray-600 mt-4">
                <span className="text-orange-600 font-medium">(1 person trying to buy)</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-gray-700 text-center mb-6 text-lg">
          Witness the opening game of the NBA Finals!
        </p>

        {/* Queue Status Card */}
        <Card className="bg-white shadow-xl border-0 overflow-hidden">
          <CardContent className="p-0">
            {waitingListEntry.status === 'offered' && timeLeft !== null ? (
              <>
                {/* Ticket Reserved Header */}
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                        <Ticket className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Ticket Reserved</h2>
                        <p className="text-white/90">
                          Expires in {timeLeft > 0 ? formatTime(timeLeft) : 'expired'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{timeLeft > 0 ? formatTime(timeLeft) : '00:00'}</div>
                      <div className="text-sm text-white/80">Time remaining</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <p className="text-amber-800 text-center">
                      A ticket has been reserved for you. Complete your purchase before the timer expires to secure your spot at this event.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {!isRedirecting ? (
                      <Button 
                        onClick={handlePurchaseTicket}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 text-lg rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                        disabled={timeLeft === 0}
                      >
                        Purchase Your Ticket Now →
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        className="w-full bg-gray-400 text-white font-semibold py-4 text-lg rounded-lg"
                      >
                        Redirecting to checkout...
                      </Button>
                    )}
                    
                    <Button 
                      onClick={handleReleaseTicket}
                      variant="outline"
                      className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold py-4 rounded-lg transition-all duration-200"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Release Ticket Offer
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Waiting Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">You're in the Queue</h2>
                  <div className="text-4xl font-bold mb-2">#{waitingListEntry.position || 'Unknown'}</div>
                  <p className="text-white/90">Your position in line</p>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-semibold text-blue-800">Please wait</span>
                    </div>
                    <p className="text-blue-700">
                      We're processing other customers ahead of you. You'll be notified when it's your turn to purchase tickets.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleReleaseTicket}
                    variant="outline"
                    className="border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Leave Queue
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QueueSystem;
