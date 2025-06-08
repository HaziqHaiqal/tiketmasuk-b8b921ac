
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Calendar, ShoppingBag } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing
            <span className="block text-blue-200">Events & Products</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Your one-stop marketplace for unforgettable experiences and unique products. 
            Connect with vendors and discover what's happening around you.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for events, products, or vendors..."
                className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-lg text-lg focus:ring-4 focus:ring-blue-300 focus:outline-none"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" asChild className="text-blue-700 bg-white hover:bg-gray-100">
              <Link to="/browse" className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Browse Events
              </Link>
            </Button>
            <Button size="lg" className="text-white bg-green-600 hover:bg-green-700 border-2 border-green-600" asChild>
              <Link to="/products" className="flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Products
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">10K+</div>
              <div className="text-blue-200">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Verified Vendors</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">2K+</div>
              <div className="text-blue-200">Events Hosted</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-blue-200">Products Sold</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
