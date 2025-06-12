
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import EventTicketTab from '@/components/EventTicketTab';
import EventDetailsTab from '@/components/EventDetailsTab';
import EventOrganizerTab from '@/components/EventOrganizerTab';
import CartTimerBar from '@/components/CartTimerBar';
import { useEvent } from '@/hooks/useEvents';
import { useShoppingCart } from '@/hooks/useShoppingCart';

const EventDetailsTabbed = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: eventData, isLoading, error } = useEvent(id || '');
  const { getTotalItems } = useShoppingCart();
  const [activeTab, setActiveTab] = useState('ticket');

  const hasCartItems = getTotalItems() > 0;

  // Mock event data - in real app this would come from eventData
  const event = {
    id: id || '1',
    title: eventData?.title || 'Summer Music Festival 2024',
    description: eventData?.description || 'Join us for an unforgettable weekend of music featuring top artists from around the world.',
    fullDescription: 'This three-day festival brings together the best artists from various genres including rock, pop, electronic, and indie music. With multiple stages, art installations, and local food vendors, this is more than just a concert - it\'s a cultural experience.',
    date: eventData?.date || '2024-07-15',
    endDate: '2024-07-17',
    time: '18:00',
    location: eventData?.location || 'Central Park, New York, NY',
    venue: 'Great Lawn Amphitheater',
    price: eventData?.price || 89,
    image: eventData?.image || '/placeholder.svg',
    category: 'Music',
    attendees: 1250,
    maxCapacity: 5000,
    rating: 4.8,
    reviews: 324,
    vendor: 'EventPro LLC',
    isHighDemand: true,
    ticketTypes: [
      {
        id: 'general',
        name: 'General Admission',
        price: eventData?.price || 89,
        description: 'Access to all stages and general areas',
        available: 1200,
        maxPerPerson: 4
      },
      {
        id: 'vip',
        name: 'VIP Experience',
        price: 299,
        description: 'Premium viewing area, complimentary drinks, VIP restrooms',
        available: 50,
        maxPerPerson: 2
      }
    ],
    organizer: {
      name: 'EventPro LLC',
      description: 'Leading event management company specializing in music festivals and cultural events.',
      logo: '/placeholder.svg',
      rating: 4.8,
      eventsCount: 156,
      yearsActive: 8,
      contact: {
        email: 'info@eventpro.com',
        phone: '+1 (555) 123-4567',
        website: 'www.eventpro.com'
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading event details</p>
          <Button onClick={() => navigate('/browse')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate('/browse')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 lg:h-96 object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • {event.time}
              </p>
              <p className="text-lg text-gray-600 mb-6">{event.location}</p>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold text-blue-600">
                  From RM{event.price}
                </span>
                <span className="text-gray-500">{event.attendees} attending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="ticket" className="text-base">Ticket</TabsTrigger>
              <TabsTrigger value="details" className="text-base">Details</TabsTrigger>
              <TabsTrigger value="organizer" className="text-base">Organizer</TabsTrigger>
            </TabsList>
            
            <div className="py-8">
              <TabsContent value="ticket" className="mt-0">
                <EventTicketTab event={event} />
              </TabsContent>
              
              <TabsContent value="details" className="mt-0">
                <EventDetailsTab event={event} />
              </TabsContent>
              
              <TabsContent value="organizer" className="mt-0">
                <EventOrganizerTab organizer={event.organizer} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Cart Timer Bar - shown when items in cart */}
      {hasCartItems && <CartTimerBar eventId={id!} />}
    </div>
  );
};

export default EventDetailsTabbed;
