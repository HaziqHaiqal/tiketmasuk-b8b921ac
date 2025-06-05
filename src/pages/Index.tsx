
import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import EventCard from '@/components/EventCard';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Shield, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  // Mock data for featured events
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

  // Mock data for featured products
  const featuredProducts = [
    {
      id: '1',
      title: 'Premium Concert T-Shirt',
      description: 'High-quality cotton t-shirt featuring exclusive festival artwork.',
      price: 29,
      originalPrice: 39,
      image: '/placeholder.svg',
      category: 'Merchandise',
      rating: 4.7,
      reviews: 124,
      vendor: 'MerchStore',
      inStock: true
    },
    {
      id: '2',
      title: 'Artisan Coffee Blend',
      description: 'Specially crafted coffee blend from local roasters.',
      price: 24,
      image: '/placeholder.svg',
      category: 'Food & Beverage',
      rating: 4.9,
      reviews: 89,
      vendor: 'LocalBrewer',
      inStock: true
    }
  ];

  const features = [
    {
      icon: Star,
      title: 'Verified Vendors',
      description: 'All vendors are thoroughly vetted to ensure quality and reliability.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Your transactions are protected with bank-level security.'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our dedicated support team.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      
      {/* Featured Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Events</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the most popular events happening in your area
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
          
          <div className="text-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/browse">
                View All Events
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Shop unique products from our trusted vendors
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link to="/products">
                Browse All Products
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Marketplace?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a safe, reliable, and enjoyable experience for everyone
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of vendors who are already growing their business on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Become a Vendor</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-700">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold">Marketplace</span>
              </div>
              <p className="text-gray-400">
                Your trusted marketplace for events and products.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Customers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/browse" className="hover:text-white">Browse Events</Link></li>
                <li><Link to="/products" className="hover:text-white">Shop Products</Link></li>
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Vendors</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white">Become a Vendor</Link></li>
                <li><Link to="/vendor/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/vendor/guide" className="hover:text-white">Seller Guide</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
