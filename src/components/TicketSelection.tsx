import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useToyyibPay } from '@/hooks/useToyyibPay';
import { useToast } from '@/hooks/use-toast';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  maxPerPerson: number;
  soldOut?: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  ticketTypes: TicketType[];
}

interface TicketSelectionProps {
  event: Event;
  onBack: () => void;
}

const TicketSelection: React.FC<TicketSelectionProps> = ({ event, onBack }) => {
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [promoCode, setPromoCode] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const { createPayment, loading, error } = useToyyibPay();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired - redirect back
          onBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onBack]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const updateTicketQuantity = (ticketId: string, change: number) => {
    setSelectedTickets(prev => {
      const currentQuantity = prev[ticketId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      const ticket = event.ticketTypes.find(t => t.id === ticketId);
      
      if (ticket && newQuantity <= ticket.maxPerPerson && newQuantity <= ticket.available) {
        return { ...prev, [ticketId]: newQuantity };
      }
      return prev;
    });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = event.ticketTypes.find(t => t.id === ticketId);
      return total + (ticket?.price || 0) * quantity;
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const handleCheckout = async () => {
    const totalTickets = getTotalTickets();
    const totalPrice = getTotalPrice();
    
    if (totalTickets === 0) {
      toast({
        title: "No tickets selected",
        description: "Please select at least one ticket to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!customerEmail || !customerPhone) {
      toast({
        title: "Missing information",
        description: "Please provide your email and phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPayment({
        eventId: event.id,
        eventName: event.title,
        totalAmount: totalPrice,
        customerEmail,
        customerPhone,
      });
      
      toast({
        title: "Redirecting to payment",
        description: "You will be redirected to ToyyibPay shortly.",
      });
    } catch (err) {
      toast({
        title: "Payment failed",
        description: error || "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2 text-orange-600">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Time remaining: {formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Tickets</CardTitle>
                <p className="text-gray-600">{event.title}</p>
                <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Customer Information */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold mb-3">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <Input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone Number *</label>
                        <Input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+60123456789"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ticket Types */}
                  {event.ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{ticket.name}</h3>
                            {ticket.soldOut && <Badge variant="destructive">Sold Out</Badge>}
                            {ticket.available < 10 && !ticket.soldOut && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Only {ticket.available} left
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                          <p className="text-lg font-bold text-blue-600 mt-2">RM{ticket.price}</p>
                        </div>
                        
                        {!ticket.soldOut && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateTicketQuantity(ticket.id, -1)}
                              disabled={(selectedTickets[ticket.id] || 0) === 0}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {selectedTickets[ticket.id] || 0}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateTicketQuantity(ticket.id, 1)}
                              disabled={
                                (selectedTickets[ticket.id] || 0) >= ticket.maxPerPerson ||
                                (selectedTickets[ticket.id] || 0) >= ticket.available
                              }
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {!ticket.soldOut && (
                        <p className="text-xs text-gray-500">
                          Max {ticket.maxPerPerson} per person • {ticket.available} available
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(selectedTickets).filter(([_, quantity]) => quantity > 0).map(([ticketId, quantity]) => {
                    const ticket = event.ticketTypes.find(t => t.id === ticketId);
                    if (!ticket) return null;
                    
                    return (
                      <div key={ticketId} className="flex justify-between">
                        <div>
                          <p className="font-medium">{ticket.name}</p>
                          <p className="text-sm text-gray-600">Qty: {quantity}</p>
                        </div>
                        <p className="font-medium">RM{ticket.price * quantity}</p>
                      </div>
                    );
                  })}
                  
                  {getTotalTickets() === 0 ? (
                    <p className="text-gray-500 text-center py-4">No tickets selected</p>
                  ) : (
                    <>
                      <div className="border-t pt-4">
                        <Input
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="mb-2"
                        />
                        <Button variant="outline" size="sm" className="w-full">
                          Apply Code
                        </Button>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>RM{getTotalPrice()}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getTotalTickets()} ticket{getTotalTickets() !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <Button 
                        onClick={handleCheckout}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                        disabled={loading || !customerEmail || !customerPhone}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketSelection;
