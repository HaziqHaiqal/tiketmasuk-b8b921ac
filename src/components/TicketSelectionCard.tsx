
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Clock } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  maxPerPerson: number;
  soldOut?: boolean;
}

interface TicketSelectionCardProps {
  ticketTypes: TicketType[];
  onBuyTickets: (selectedTickets: Record<string, number>) => void;
  loading?: boolean;
  waitingListEntry?: any;
  isHighDemand?: boolean;
}

const TicketSelectionCard: React.FC<TicketSelectionCardProps> = ({
  ticketTypes,
  onBuyTickets,
  loading,
  waitingListEntry,
  isHighDemand
}) => {
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});

  const updateTicketQuantity = (ticketId: string, change: number) => {
    setSelectedTickets(prev => {
      const currentQuantity = prev[ticketId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      const ticket = ticketTypes.find(t => t.id === ticketId);
      
      if (ticket && newQuantity <= ticket.maxPerPerson && newQuantity <= ticket.available) {
        return { ...prev, [ticketId]: newQuantity };
      }
      return prev;
    });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === ticketId);
      return total + (ticket?.price || 0) * quantity;
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const hasSelectedTickets = getTotalTickets() > 0;

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Get Your Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Ticket Types */}
          <div className="space-y-3">
            {ticketTypes.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">{ticket.name}</h4>
                      {ticket.soldOut && <Badge variant="destructive" className="text-xs">Sold Out</Badge>}
                      {ticket.available < 10 && !ticket.soldOut && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                          {ticket.available} left
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{ticket.description}</p>
                    <p className="font-bold text-blue-600">RM{ticket.price}</p>
                  </div>
                  
                  {!ticket.soldOut && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => updateTicketQuantity(ticket.id, -1)}
                        disabled={(selectedTickets[ticket.id] || 0) === 0}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {selectedTickets[ticket.id] || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => updateTicketQuantity(ticket.id, 1)}
                        disabled={
                          (selectedTickets[ticket.id] || 0) >= ticket.maxPerPerson ||
                          (selectedTickets[ticket.id] || 0) >= ticket.available
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {!ticket.soldOut && (
                  <p className="text-xs text-gray-500">
                    Max {ticket.maxPerPerson} per person
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Total and Buy Button */}
          {hasSelectedTickets && (
            <div className="border-t pt-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">RM{getTotalPrice()}</span>
              </div>
              <p className="text-xs text-gray-600">
                {getTotalTickets()} ticket{getTotalTickets() !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <Button 
            onClick={() => onBuyTickets(selectedTickets)}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
            disabled={loading || !hasSelectedTickets}
          >
            {loading ? 'Processing...' : 
             waitingListEntry ? `Queue Position #${waitingListEntry.position}` : 
             'Buy Tickets Now'}
          </Button>

          {waitingListEntry && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800 font-medium">
                  You're in the queue
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Position #{waitingListEntry.position} - you'll be notified when it's your turn
              </p>
            </div>
          )}

          {isHighDemand && !waitingListEntry && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-orange-600 mr-2" />
                <span className="text-sm text-orange-800 font-medium">High Demand Event</span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                You may be placed in a queue during checkout
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketSelectionCard;
