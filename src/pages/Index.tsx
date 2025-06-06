
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import EventCard from '@/components/EventCard';
import Footer from '@/components/Footer';

const Index = () => {
  // Mock featured events
  const featuredEvents = [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      description: 'Join us for an unforgettable weekend of music featuring top artists from around the world.',
      date: '2024-07-15',
      location: 'Central Park, NY',
      price: 89,
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
      price: 299,
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
      price: 45,
      image: '/placeholder.svg',
      category: 'Food',
      attendees: 600,
      rating: 4.6,
      vendor: 'Culinary Events'
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

      <Footer />
    </div>
  );
};

export default Index;
