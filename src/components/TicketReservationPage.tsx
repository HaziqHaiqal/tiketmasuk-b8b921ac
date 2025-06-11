
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { useTicketReservation } from '@/hooks/useTicketReservation';
import { useQueueStats } from '@/hooks/useQueueStats';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TicketReservationPageProps {
  selectedTickets: Record<string, number>;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
  }>;
  eventTitle: string;
}

const TicketReservationPage: React.FC<TicketReservationPageProps> = ({
  selectedTickets,
  ticketTypes,
  eventTitle
}) => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reservation } = useTicketReservation(eventId);
  const { queueStats, cancelReservation } = useQueueStats(eventId);
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<number>(20 * 60); // 20 minutes in seconds

  // Calculate total price
  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === ticketId);
      return total + (ticket?.price || 0) * quantity;
    }, 0);
  };

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Countdown timer
  useEffect(() => {
    if (reservation && reservation.expires_at) {
      const expirationTime = new Date(reservation.expires_at).getTime();
      
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const difference = expirationTime - now;
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
        } else {
          setTimeLeft(0);
          clearInterval(timer);
          // Redirect back to event details when time expires
          navigate(`/event/${eventId}`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [reservation, navigate, eventId]);

  const handleContinueToTicketDetails = () => {
    // Navigate to ticket details page
    navigate(`/event/${eventId}/tickets`);
  };

  const handleCancelReservation = async () => {
    if (!reservation) return;
    
    try {
      await cancelReservation(reservation.id);
      toast({
        title: "Reservation Cancelled",
        description: "Your reservation has been cancelled and the queue has been updated.",
      });
      navigate(`/event/${eventId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel reservation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer and Queue Info */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-orange-600">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Time remaining: {formatTime(timeLeft)}</span>
              </div>
              {queueStats.totalWaiting > 0 && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{queueStats.totalWaiting} people in queue</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pt-8">
        <Card>
          <CardHeader className="text-center border-b">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Tickets Reserved!</CardTitle>
            <p className="text-gray-600">Your tickets for {eventTitle} have been reserved</p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Queue Status */}
            {queueStats.userInQueue && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Queue Status</span>
                </div>
                <div className="text-center mt-2">
                  <p className="text-blue-700">
                    {queueStats.currentPosition > 0 
                      ? `You are position #${queueStats.currentPosition} in the queue`
                      : 'You have been offered tickets!'
                    }
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Total people waiting: {queueStats.totalWaiting}
                  </p>
                </div>
              </div>
            )}

            {/* Timer */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-medium">Time remaining to complete purchase:</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-3xl font-bold text-orange-600">
                  {formatTime(timeLeft)}
                </span>
              </div>
              {timeLeft <= 300 && ( // Show warning when less than 5 minutes
                <div className="flex items-center justify-center mt-2 text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Hurry up! Your reservation will expire soon.</span>
                </div>
              )}
            </div>

            {/* Ticket Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Ticket Summary</h3>
              <div className="space-y-3">
                {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                  const ticket = ticketTypes.find(t => t.id === ticketId);
                  if (!ticket || quantity === 0) return null;
                  
                  return (
                    <div key={ticketId} className="flex justify-between items-center py-3 border-b">
                      <div>
                        <h4 className="font-medium">{ticket.name}</h4>
                        <p className="text-sm text-gray-600">{ticket.description}</p>
                        <p className="text-sm text-gray-500">Quantity: {quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">RM{(ticket.price * quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">RM{ticket.price} each</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    RM{getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Important Notice:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your tickets are temporarily reserved for 20 minutes</li>
                <li>• Complete your purchase before the timer expires</li>
                <li>• If time expires, you'll need to start over</li>
                <li>• Each ticket requires individual holder information</li>
                <li>• Prices and availability are guaranteed during this reservation</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleCancelReservation}
                variant="outline"
                className="flex-1"
              >
                Cancel Reservation
              </Button>
              <Button
                onClick={handleContinueToTicketDetails}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={timeLeft <= 0}
              >
                Continue to Ticket Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketReservationPage;
