
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Star, Clock, ArrowLeft, Package } from 'lucide-react';
import TicketSelection from '@/components/TicketSelection';
import QueueSystem from '@/components/QueueSystem';
import EventProductCard from '@/components/EventProductCard';
import { useWaitingList } from '@/hooks/useWaitingList';
import { useEvent } from '@/hooks/useEvents';
import { useProducts, Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

const EventDetails = () => {
  const { id } = useParams();
  const [showTicketSelection, setShowTicketSelection] = useState(false);
  const { waitingListEntry, joinWaitingList, loading } = useWaitingList(id);
  const { toast } = useToast();
  
  // Fetch real event data
  const { data: eventData, isLoading: eventLoading, error } = useEvent(id || '');
  
  // Fetch products for this event
  const { data: products, isLoading: productsLoading } = useProducts(id);

  // Mock event data with real ID - in a real app, this would come from the database
  const event = {
    id: id || '1', // Use the actual ID from the URL
    title: eventData?.title || 'Summer Music Festival 2024',
    description: eventData?.description || 'Join us for an unforgettable weekend of music featuring top artists from around the world. Experience live performances, food trucks, and an amazing atmosphere in the heart of Central Park.',
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
      },
      {
        id: 'early-bird',
        name: 'Early Bird Special',
        price: 69,
        description: 'Limited time offer - same as general admission',
        available: 0,
        maxPerPerson: 4,
        soldOut: true
      }
    ]
  };

  const handleBuyTickets = async () => {
    if (event.isHighDemand && event.ticketTypes.some(t => t.available < 100)) {
      // Check if user is already in queue
      if (waitingListEntry) {
        // User is already in queue, show queue system
        return;
      }
      
      // Join the waiting list
      const success = await joinWaitingList();
      if (!success) {
        // If joining failed, still allow direct purchase
        setShowTicketSelection(true);
      }
    } else {
      setShowTicketSelection(true);
    }
  };

  const handleQueueComplete = () => {
    setShowTicketSelection(true);
  };

  const handleLeaveQueue = () => {
    // User left the queue, go back to event details
  };

  const handleAddToCart = (product: Product, variants: Record<string, string>, quantity: number) => {
    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart.`,
    });
    console.log('Added to cart:', { product, variants, quantity });
  };

  if (eventLoading) {
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
          <Button asChild>
            <Link to="/browse">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show queue system if user is in waiting list
  if (waitingListEntry && ['waiting', 'offered'].includes(waitingListEntry.status)) {
    return (
      <QueueSystem 
        eventId={id!} 
        onComplete={handleQueueComplete}
        onLeave={handleLeaveQueue}
      />
    );
  }

  if (showTicketSelection) {
    return <TicketSelection event={event} onBack={() => setShowTicketSelection(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/browse">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
              <Badge className="absolute top-4 left-4 bg-blue-600">
                {event.category}
              </Badge>
              {event.isHighDemand && (
                <Badge className="absolute top-4 right-4 bg-red-600">
                  High Demand
                </Badge>
              )}
            </div>

            {/* Event Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl mb-2">{event.title}</CardTitle>
                    <p className="text-gray-600">by {event.vendor}</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="font-semibold">{event.rating}</span>
                    <span className="text-gray-600 ml-1">({event.reviews} reviews)</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3" />
                    <div>
                      <p className="font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {event.endDate && event.endDate !== event.date && (
                          <span> - {new Date(event.endDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        )}
                      </p>
                      <p className="text-sm">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3" />
                    <div>
                      <p className="font-medium">{event.venue}</p>
                      <p className="text-sm">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3" />
                    <p>{event.attendees} attending • {event.maxCapacity - event.attendees} spots left</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{event.description}</p>
                <p className="text-gray-700">{event.fullDescription}</p>
              </CardContent>
            </Card>

            {/* Event Products */}
            {products && products.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Event Merchandise (Optional)
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Enhance your event experience with optional merchandise and add-ons
                  </p>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                          <div className="bg-gray-200 h-4 rounded mb-2"></div>
                          <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {products.map((product) => (
                        <EventProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Get Your Tickets</CardTitle>
                <p className="text-sm text-gray-600">
                  <span className="text-red-600 font-medium">*Required</span> - You must purchase at least one ticket to attend this event
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">From RM{event.price}</p>
                    <p className="text-sm text-gray-600">per person</p>
                  </div>
                  
                  {/* Ticket availability indicator */}
                  <div className="space-y-2">
                    {event.ticketTypes.map((ticket) => (
                      <div key={ticket.id} className="flex justify-between items-center text-sm">
                        <span>{ticket.name}</span>
                        <span className={`font-medium ${ticket.soldOut ? 'text-red-600' : ticket.available < 50 ? 'text-orange-600' : 'text-green-600'}`}>
                          {ticket.soldOut ? 'Sold Out' : `${ticket.available} left`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={handleBuyTickets}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? 'Joining Queue...' : 
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
                        Position #{waitingListEntry.position} - click to view queue status
                      </p>
                    </div>
                  )}

                  {event.isHighDemand && !waitingListEntry && (
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

                  {products && products.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-800 font-medium">
                          Optional Add-ons Available
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Check out the merchandise section below for event souvenirs and extras
                      </p>
                    </div>
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

export default EventDetails;
