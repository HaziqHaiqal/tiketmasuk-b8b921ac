
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Tiketmasuk</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-gray-700 hover:text-blue-600 transition-colors">
              Events
            </Link>
            <Link to="/organizers" className="text-gray-700 hover:text-blue-600 transition-colors">
              Organizers
            </Link>
          </nav>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user.email}</span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link
                  to="/events"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Events
                </Link>
                <Link
                  to="/organizers"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Organizers
                </Link>
              </nav>

              {/* Mobile User Menu */}
              <div className="pt-4 border-t">
                {user ? (
                  <div className="space-y-2">
                    <p className="px-3 py-2 text-gray-700">Welcome, {user.email}</p>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      asChild
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button 
                      className="w-full" 
                      asChild
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Link to="/register">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
