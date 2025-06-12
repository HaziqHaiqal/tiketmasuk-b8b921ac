
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, MapPin, Clock, Users } from 'lucide-react';
import EventTicketTab from '@/components/EventTicketTab';
import EventDetailsTab from '@/components/EventDetailsTab';
import EventOrganizerTab from '@/components/EventOrganizerTab';
import CartTimerBar from '@/components/CartTimerBar';
import { useShoppingCart } from '@/hooks/useShoppingCart';

const EventDetailsTabbed = () => {
  const { id } = useParams();
  const { getTotalItems } = useShoppingCart();

  // Mock event data - replace with actual data fetching
  const event = {
    id: id || '',
    title: 'Tech Conference 2024',
    date: '2024-03-15',
    time: '09:00 AM',
    location: 'Kuala Lumpur Convention Centre',
    image: '/placeholder.svg',
    description: 'Join us for the biggest tech conference of the year featuring industry leaders, innovative workshops, and networking opportunities.',
    category: 'Technology',
    organizer: 'Tech Events Malaysia',
    ticketTypes: [
      {
        id: 'early-bird',
        name: 'Early Bird',
        price: 299,
        description: 'Limited time offer with full access to all sessions',
        available: 50,
        maxPerPerson: 2,
      },
      {
        id: 'regular',
        name: 'Regular',
        price: 399,
        description: 'Standard admission with access to all sessions',
        available: 200,
        maxPerPerson: 5,
      },
      {
        id: 'vip',
        name: 'VIP Package',
        price: 699,
        description: 'Premium access with exclusive networking session and lunch',
        available: 25,
        maxPerPerson: 2,
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>

      {/* Event Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{event.category}</Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Ticket Selection - Mobile/Desktop */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Book</h3>
                  <div className="space-y-3">
                    {event.ticketTypes.slice(0, 2).map((ticket) => (
                      <div key={ticket.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{ticket.name}</h4>
                          <span className="font-bold text-blue-600">RM{ticket.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{ticket.available} available</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    Select quantities in the Tickets tab below
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="tickets" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="organizer">Organizer</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <EventTicketTab event={event} />
          </TabsContent>

          <TabsContent value="details">
            <EventDetailsTab event={event} />
          </TabsContent>

          <TabsContent value="organizer">
            <EventOrganizerTab event={event} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Cart Timer Bar - Only show when items are in cart */}
      {getTotalItems() > 0 && (
        <CartTimerBar eventId={id!} />
      )}
    </div>
  );
};

export default EventDetailsTabbed;
