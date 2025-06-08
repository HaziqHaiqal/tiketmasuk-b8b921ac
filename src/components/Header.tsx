
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  User, 
  ShoppingCart, 
  Menu,
  LogOut,
  Settings,
  BarChart3,
  X,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const Header = () => {
  const { user, profile, logout, isVendor, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isApprovedVendor = isVendor && profile?.approval_status === 'approved';
  const isPendingVendor = isVendor && profile?.approval_status === 'pending';

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">T</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">Tiketmasuk</span>
            <span className="text-lg font-bold text-gray-900 sm:hidden">TM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/browse" className="text-gray-700 hover:text-blue-600 font-medium text-sm">
              Browse
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium text-sm">
              Products
            </Link>
            <Link to="/organizers" className="text-gray-700 hover:text-blue-600 font-medium text-sm">
              Organizers
            </Link>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </Button>

            {/* User Menu */}
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:block">{profile.name}</span>
                    {isPendingVendor && (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  {isPendingVendor && (
                    <DropdownMenuItem disabled>
                      <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="text-yellow-600">Approval Pending</span>
                    </DropdownMenuItem>
                  )}
                  
                  {isApprovedVendor && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/vendor/dashboard" className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Vendor Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                0
              </span>
            </Button>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white py-4 space-y-2">
            <Link 
              to="/browse" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Events
            </Link>
            <Link 
              to="/products" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/organizers" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Organizers
            </Link>
            
            {loading ? (
              <div className="px-4 py-2">
                <Skeleton className="h-8 w-full" />
              </div>
            ) : user && profile ? (
              <div className="border-t pt-2 mt-2">
                <div className="px-4 py-2 text-sm font-medium text-gray-900 flex items-center">
                  {profile.name}
                  {isPendingVendor && (
                    <Clock className="w-4 h-4 ml-2 text-yellow-500" />
                  )}
                </div>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                {isPendingVendor && (
                  <div className="px-4 py-2 text-yellow-600 text-sm">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Approval Pending
                  </div>
                )}
                {isApprovedVendor && (
                  <Link 
                    to="/vendor/dashboard" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Vendor Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t pt-2 mt-2 space-y-2">
                <Link 
                  to="/login" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded mx-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
