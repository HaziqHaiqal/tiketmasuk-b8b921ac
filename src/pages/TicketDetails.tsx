
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { useTicketReservation } from '@/hooks/useTicketReservation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const TicketDetails = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reservation } = useTicketReservation(eventId);
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [ticketHolders, setTicketHolders] = useState<Array<{
    holder_name: string;
    holder_email: string;
    holder_phone: string;
    holder_ic_passport: string;
  }>>([]);

  // Initialize ticket holders array based on reservation quantity
  useEffect(() => {
    const quantity = reservation?.quantity || 1;
    if (quantity > 0) {
      const holders = Array.from({ length: quantity }, () => ({
        holder_name: '',
        holder_email: '',
        holder_phone: '',
        holder_ic_passport: ''
      }));
      setTicketHolders(holders);
    }
  }, [reservation]);

  // Countdown timer
  useEffect(() => {
    if (reservation && reservation.offer_expires_at) {
      const expirationTime = reservation.offer_expires_at;
      
      const timer = setInterval(() => {
        const now = Date.now();
        const difference = expirationTime - now;
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
        } else {
          setTimeLeft(0);
          clearInterval(timer);
          navigate(`/event/${eventId}`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [reservation, navigate, eventId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateTicketHolder = (index: number, field: string, value: string) => {
    const updated = [...ticketHolders];
    updated[index] = { ...updated[index], [field]: value };
    setTicketHolders(updated);
  };

  const validateForm = () => {
    for (let i = 0; i < ticketHolders.length; i++) {
      const holder = ticketHolders[i];
      if (!holder.holder_name || !holder.holder_email) {
        toast({
          title: "Missing Information",
          description: `Please complete all required fields for Ticket ${i + 1}`,
          variant: "destructive",
        });
        return false;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(holder.holder_email)) {
        toast({
          title: "Invalid Email",
          description: `Please enter a valid email for Ticket ${i + 1}`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      // Store ticket holder data in localStorage for the payment page
      localStorage.setItem('ticketHolders', JSON.stringify(ticketHolders));
      navigate(`/event/${eventId}/payment`);
    }
  };

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-gray-600 mb-4">No active reservation found</p>
            <Button asChild>
              <Link to={`/event/${eventId}`}>Back to Event</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" asChild>
              <Link to={`/event/${eventId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event
              </Link>
            </Button>
            <div className="flex items-center space-x-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Time remaining: {formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Ticket Holder Details
            </CardTitle>
            <p className="text-gray-600">
              Please provide the details for each ticket holder. Each ticket is personalized and non-transferable.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {ticketHolders.map((holder, index) => (
              <Card key={index} className="border border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ticket {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${index}`}>Full Name *</Label>
                      <Input
                        id={`name-${index}`}
                        value={holder.holder_name}
                        onChange={(e) => updateTicketHolder(index, 'holder_name', e.target.value)}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`email-${index}`}>Email Address *</Label>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        value={holder.holder_email}
                        onChange={(e) => updateTicketHolder(index, 'holder_email', e.target.value)}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                      <Input
                        id={`phone-${index}`}
                        type="tel"
                        value={holder.holder_phone}
                        onChange={(e) => updateTicketHolder(index, 'holder_phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`ic-${index}`}>IC/Passport Number</Label>
                      <Input
                        id={`ic-${index}`}
                        value={holder.holder_ic_passport}
                        onChange={(e) => updateTicketHolder(index, 'holder_ic_passport', e.target.value)}
                        placeholder="Enter IC or Passport number"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleContinue}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
                disabled={timeLeft <= 0}
              >
                Continue to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketDetails;
