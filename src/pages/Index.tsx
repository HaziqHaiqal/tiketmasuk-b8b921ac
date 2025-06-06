
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import EventCard from '@/components/EventCard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Users } from 'lucide-react';

const Index = () => {
  // Mock featured events
  const featuredEvents = [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      description: 'Join us for an unforgettable weekend of music featuring top artists from around the world.',
      date: '2024-07-15',
      location: 'Central Park, NY',
      price: 289,
      image: '/placeholder.svg',
      category: 'Music',
      attendees: 1250,
      rating: 4.8,
      vendor: 'EventPro LLC'
    },
    {
      id: '2',
      title: 'Tech Conference 2024',
      description: 'Discover the latest innovations in technology and network with industry leaders.',
      date: '2024-08-20',
      location: 'Convention Center, SF',
      price: 899,
      image: '/placeholder.svg',
      category: 'Technology',
      attendees: 850,
      rating: 4.9,
      vendor: 'TechEvents Inc'
    },
    {
      id: '3',
      title: 'Food & Wine Expo',
      description: 'Experience culinary delights from local chefs and sample premium wines.',
      date: '2024-09-10',
      location: 'Downtown Plaza, LA',
      price: 145,
      image: '/placeholder.svg',
      category: 'Food',
      attendees: 600,
      rating: 4.6,
      vendor: 'Culinary Events'
    }
  ];

  // Mock featured products
  const featuredProducts = [
    {
      id: '1',
      name: 'Concert T-Shirt',
      price: 45,
      image: '/placeholder.svg',
      event: 'Summer Music Festival 2024'
    },
    {
      id: '2',
      name: 'Tech Conference Hoodie',
      price: 89,
      image: '/placeholder.svg',
      event: 'Tech Conference 2024'
    },
    {
      id: '3',
      name: 'Food Expo Tote Bag',
      price: 25,
      image: '/placeholder.svg',
      event: 'Food & Wine Expo'
    }
  ];

  // Mock top organizers
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
      
      {/* Featured Events Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the most popular events happening near you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get exclusive merchandise from your favorite events
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">From {product.event}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">RM {product.price}</span>
                    <Button size="sm">Add to Cart</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Organizers Section */}
      <section className="py-16 bg-white">
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
    </div>
  );
};

export default Index;
