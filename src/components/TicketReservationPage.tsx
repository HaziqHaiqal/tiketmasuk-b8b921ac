
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTicketReservation } from '@/hooks/useTicketReservation';
import { useAuth } from '@/hooks/useAuth';

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

  const handleContinueToCheckout = () => {
    // Navigate to billing details page
    navigate(`/event/${eventId}/checkout`);
  };

  const handleCancelReservation = () => {
    // Navigate back to event details
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
                onClick={handleContinueToCheckout}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={timeLeft <= 0}
              >
                Continue to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketReservationPage;
