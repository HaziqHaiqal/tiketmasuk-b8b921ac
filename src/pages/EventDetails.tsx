
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar, MapPin, Users, Star, ArrowLeft, Package, HelpCircle } from 'lucide-react';
import QueueSystem from '@/components/QueueSystem';
import EventProductCard from '@/components/EventProductCard';
import TicketSelectionCard from '@/components/TicketSelectionCard';
import TicketReservationPage from '@/components/TicketReservationPage';
import AuthModal from '@/components/AuthModal';
import { useWaitingList } from '@/hooks/useWaitingList';
import { useEvent } from '@/hooks/useEvents';
import { useProducts, Product } from '@/hooks/useProducts';
import { useTicketReservation } from '@/hooks/useTicketReservation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [showReservationPage, setShowReservationPage] = useState(false);
  const { waitingListEntry, joinWaitingList, loading } = useWaitingList(id);
  const { reservation, createReservation } = useTicketReservation(id);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch real event data
  const { data: eventData, isLoading: eventLoading, error } = useEvent(id || '');
  
  // Fetch products for this event
  const { data: products, isLoading: productsLoading } = useProducts(id);

  // Mock event data with real ID - in a real app, this would come from the database
  const event = {
    id: id || '1',
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
    // Mock FAQs data - in real app this would come from eventData
    faqs: [
      {
        question: "What time does the event start?",
        answer: "The event starts at 6:00 PM. Gates open at 5:00 PM."
      },
      {
        question: "Is parking available?",
        answer: "Yes, parking is available on-site for $15. We recommend arriving early as spaces are limited."
      },
      {
        question: "Can I bring my own food and drinks?",
        answer: "Outside food and beverages are not permitted. We have a variety of food vendors on-site."
      },
      {
        question: "What should I bring?",
        answer: "Bring a valid ID, your ticket (digital or printed), and comfortable shoes. Blankets and low-back chairs are welcome."
      }
    ],
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

  // Check if user has active reservation
  useEffect(() => {
    if (reservation && reservation.status === 'reserved') {
      setShowReservationPage(true);
    }
  }, [reservation]);

  const handleBuyTickets = async (tickets: Record<string, number>) => {
    setSelectedTickets(tickets);
    
    // Show auth modal first
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    
    // Create reservation for the first selected ticket type
    const firstTicketType = Object.keys(selectedTickets)[0];
    const quantity = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    
    if (firstTicketType && quantity > 0) {
      const success = await createReservation(firstTicketType, quantity);
      if (success) {
        setShowReservationPage(true);
      }
    }
  };

  const handleGuestContinue = async () => {
    setShowAuthModal(false);
    
    // For guest users, create reservation without user authentication
    const firstTicketType = Object.keys(selectedTickets)[0];
    const quantity = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    
    if (firstTicketType && quantity > 0) {
      // For guests, we might need different handling or just proceed to checkout
      setShowReservationPage(true);
    }
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

  // Show reservation page if user has reserved tickets
  if (showReservationPage && selectedTickets) {
    return (
      <TicketReservationPage
        selectedTickets={selectedTickets}
        ticketTypes={event.ticketTypes}
        eventTitle={event.title}
      />
    );
  }

  // Show queue system if user is in waiting list
  if (waitingListEntry && ['waiting', 'offered'].includes(waitingListEntry.status)) {
    return (
      <QueueSystem 
        eventId={id!} 
        onComplete={() => setShowReservationPage(true)}
        onLeave={() => {}}
      />
    );
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
                    Event Merchandise
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    Enhance your event experience with merchandise and add-ons
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
                    <div className={`grid gap-6 ${products.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 md:grid-cols-2'}`}>
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

            {/* FAQs - moved to bottom */}
            {event.faqs && event.faqs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {event.faqs.map((faq: any, index: number) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Get Your Tickets moved to top */}
          <div>
            <TicketSelectionCard
              ticketTypes={event.ticketTypes}
              onBuyTickets={handleBuyTickets}
              loading={loading}
              waitingListEntry={waitingListEntry}
              isHighDemand={event.isHighDemand}
            />

            {products && products.length > 0 && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Package className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800 font-medium">
                    Merchandise Available
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Check out the merchandise section for event souvenirs and extras
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestContinue={handleGuestContinue}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default EventDetails;
