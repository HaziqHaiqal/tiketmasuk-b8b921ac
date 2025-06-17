
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useWaitingListCart } from '@/hooks/useWaitingListCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  ticketTypes: TicketType[];
}

interface EventTicketTabProps {
  event: Event;
}

const EventTicketTab: React.FC<EventTicketTabProps> = ({ event }) => {
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const { user } = useAuth();
  const { addToCart, loading } = useWaitingListCart(eventId!);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

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

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please log in to purchase tickets');
      navigate('/login');
      return;
    }

    const totalTickets = getTotalTickets();
    if (totalTickets === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    console.log('Processing cart addition:', { selectedTickets, eventId });

    try {
      // Add each ticket type with its quantity to the cart
      for (const [ticketId, quantity] of Object.entries(selectedTickets)) {
        if (quantity > 0) {
          const ticket = event.ticketTypes.find(t => t.id === ticketId);
          if (ticket) {
            console.log(`Adding ticket: ${ticket.name}, quantity: ${quantity}`);
            
            // Create a cart item for the waiting list system
            const cartItem = {
              id: `${eventId}-${ticketId}-${Date.now()}`,
              title: `${event.title} - ${ticket.name}`,
              price: ticket.price,
              image: '/placeholder.svg',
              eventId: eventId || '',
              ticketType: ticket.name
            };
            
            console.log('About to add to waiting list cart:', cartItem, 'with quantity:', quantity);
            await addToCart(cartItem, quantity);
          }
        }
      }

      // Clear selections after successful addition
      setSelectedTickets({});
      
      // Always navigate to cart page after adding tickets
      console.log('Navigating to cart page:', `/event/${eventId}/cart`);
      setTimeout(() => {
        navigate(`/event/${eventId}/cart`);
      }, 1000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add tickets to cart');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Your Tickets</CardTitle>
          <p className="text-gray-600">Choose your preferred ticket type and quantity</p>
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                Please log in to purchase tickets
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="mt-2"
                size="sm"
              >
                Log In
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {event.ticketTypes.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{ticket.name}</h3>
                      {ticket.soldOut && <Badge variant="destructive">Sold Out</Badge>}
                      {ticket.available < 10 && !ticket.soldOut && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Only {ticket.available} left
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{ticket.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-blue-600">RM{ticket.price}</p>
                      {!ticket.soldOut && user && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
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
                            size="sm"
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
                      <p className="text-sm text-gray-500 mt-2">
                        Max {ticket.maxPerPerson} per person • {ticket.available} available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {getTotalTickets() > 0 && user && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-semibold">Total: RM{getTotalPrice()}</p>
                    <p className="text-sm text-gray-600">
                      {getTotalTickets()} ticket{getTotalTickets() !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                  <Button 
                    onClick={handleAddToCart}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {loading ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventTicketTab;
