
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import EventCard from '@/components/EventCard';
import PromotedEventsCarousel from '@/components/PromotedEventsCarousel';
import CartTimerBar from '@/components/CartTimerBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Users } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useProducts } from '@/hooks/useProducts';
import { usePromotedEvents } from '@/hooks/useSubscriptions';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: promotedEvents, isLoading: promotedLoading } = usePromotedEvents();
  const { cartItems } = useShoppingCart();

  // Get the event ID from cart items for the timer
  const cartEventId = cartItems.length > 0 ? cartItems[0].eventId : '';

  // Get regular events for display (excluding promoted ones)
  const regularEvents = events?.filter(event => 
    !promotedEvents?.some(promoted => promoted.event_id === event.id)
  ).slice(0, 6) || [];
  
  // Get featured products (first 3)
  const featuredProducts = products?.slice(0, 3) || [];

  // Mock top organizers (keeping as mock for now)
  const topOrganizers = [
    {
      id: '1',
      name: 'EventPro LLC',
      eventsCount: 45,
      rating: 4.8,
      image: '/placeholder.svg',
      location: 'Kuala Lumpur'
    },
    {
      id: '2',
      name: 'TechEvents Inc',
      eventsCount: 32,
      rating: 4.9,
      image: '/placeholder.svg',
      location: 'Selangor'
    },
    {
      id: '3',
      name: 'Culinary Events',
      eventsCount: 28,
      rating: 4.6,
      image: '/placeholder.svg',
      location: 'Penang'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      
      {/* Promoted Events Banner Carousel */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Promoted Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover premium events featured by our top vendors
            </p>
          </div>
          
          <PromotedEventsCarousel events={promotedEvents || []} loading={promotedLoading} />
        </div>
      </section>

      {/* Regular Events Section */}
      {regularEvents.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">More Events</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore more exciting events
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  id={event.id}
                  title={event.title}
                  description={event.description || ''}
                  date={event.date}
                  location={event.location}
                  price={Number(event.price)}
                  image={event.image || '/placeholder.svg'}
                  category={event.category}
                  attendees={event.attendees || 0}
                  rating={Number(event.rating || 0)}
                  vendor="Event Organizer"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get exclusive merchandise from your favorite events
            </p>
          </div>
          
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={product.image || '/placeholder.svg'} 
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">RM {product.price}</span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Add to Cart</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No products available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Organizers Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Organizers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trusted event organizers creating amazing experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topOrganizers.map((organizer) => (
              <div key={organizer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={organizer.image} 
                    alt={organizer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{organizer.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {organizer.location}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Events Organized</span>
                    <span className="font-semibold">{organizer.eventsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold ml-1">{organizer.rating}</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  View Events
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Cart Timer Bar - only show if there are items in cart */}
      {cartEventId && <CartTimerBar eventId={cartEventId} />}
    </div>
  );
};

export default Index;
