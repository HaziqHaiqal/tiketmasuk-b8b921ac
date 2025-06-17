
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  eventId: string;
  ticketType: string;
}

interface WaitingListResponse {
  success: boolean;
  status: 'waiting' | 'offered';
  waiting_list_id?: string;
  user_id?: string;
  offer_expires_at?: number;
  ticket_type?: string;
  quantity?: number;
  message?: string;
  error?: string;
  error_code?: string;
}

export const useWaitingListCart = (eventId: string) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [waitingListEntry, setWaitingListEntry] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage for authenticated users only
  const loadCartFromStorage = () => {
    if (!user) return false;
    
    const cartKey = `cart-${user.id}-${eventId}`;
    const savedCart = localStorage.getItem(cartKey);
    
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        console.log('Loading cart from localStorage:', cartData);
        setCartItems(cartData);
        return true;
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
    return false;
  };

  // Check current waiting list status
  const checkWaitingListStatus = async () => {
    if (!eventId || !user) return;

    try {
      console.log('Checking waiting list status for user:', user.id);

      const { data, error } = await supabase
        .from('waiting_list')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .in('status', ['waiting', 'offered'])
        .maybeSingle();

      if (error) {
        console.error('Error checking waiting list status:', error);
        return;
      }

      console.log('Waiting list entry found:', data);
      setWaitingListEntry(data);

      // If entry expired, clear cart
      if (data && data.status === 'offered' && data.offer_expires_at) {
        const now = Date.now();
        const expiryTime = data.offer_expires_at;
        
        if (expiryTime < now) {
          console.log('Offer expired, clearing cart');
          await clearCart();
        }
      }
    } catch (error) {
      console.error('Error in checkWaitingListStatus:', error);
    }
  };

  // Add to cart - now requires authentication and uses ticket types
  const addToCart = async (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    if (loading) return;
    
    if (!user) {
      toast.error('Please log in to purchase tickets');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Adding to cart for user:', user.id, 'product:', product);

      // Join waiting list with ticket type information
      const { data, error } = await supabase.rpc('join_waiting_list', {
        event_uuid: eventId,
        ticket_type_param: product.ticketType,
        quantity_param: quantity
      });

      if (error) {
        console.error('Error joining waiting list:', error);
        if (error.message.includes('Authentication required')) {
          toast.error('Please log in to purchase tickets');
        } else {
          toast.error('Failed to join waiting list: ' + error.message);
        }
        return;
      }

      console.log('Join waiting list response:', data);

      if (data && typeof data === 'object') {
        const response = data as unknown as WaitingListResponse;
        
        if (response.success) {
          // Add item to cart
          const newItem = { ...product, quantity };
          const updatedItems = [...cartItems, newItem];
          
          console.log('Adding item to cart:', newItem);
          setCartItems(updatedItems);

          // Save cart to localStorage
          localStorage.setItem(`cart-${user.id}-${eventId}`, JSON.stringify(updatedItems));
          console.log('Cart saved to localStorage');

          if (response.status === 'offered') {
            toast.success('Tickets reserved! You have 30 minutes to complete purchase.');
          } else {
            toast.success('Added to waiting list! You\'ll be notified when tickets become available.');
          }

          // Update waiting list entry
          await checkWaitingListStatus();
        } else {
          if (response.error_code === 'AUTH_REQUIRED') {
            toast.error('Please log in to purchase tickets');
          } else {
            toast.error(response.error || 'Failed to join waiting list');
          }
        }
      } else {
        console.error('Unexpected response format:', data);
        toast.error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (productId: string) => {
    if (!user) return;
    
    const updatedItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedItems);
    
    if (updatedItems.length === 0) {
      localStorage.removeItem(`cart-${user.id}-${eventId}`);
    } else {
      localStorage.setItem(`cart-${user.id}-${eventId}`, JSON.stringify(updatedItems));
    }
    
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!user) return;
    
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);

    localStorage.setItem(`cart-${user.id}-${eventId}`, JSON.stringify(updatedItems));
  };

  const clearCart = async (navigate?: (path: string) => void) => {
    if (!user) return;
    
    try {
      // Clear cart items
      setCartItems([]);
      setWaitingListEntry(null);

      localStorage.removeItem(`cart-${user.id}-${eventId}`);

      // If user has a waiting list entry, mark it as expired
      if (waitingListEntry) {
        const { error } = await supabase
          .from('waiting_list')
          .update({ status: 'expired' })
          .eq('id', waitingListEntry.id);

        if (error) {
          console.error('Error updating waiting list entry:', error);
        }
      }

      toast.success('Cart cleared');
      
      if (navigate) {
        navigate(`/events/${eventId}`);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getExpiryTime = (): number | null => {
    if (!waitingListEntry || waitingListEntry.status !== 'offered') {
      return null;
    }
    
    if (waitingListEntry.offer_expires_at) {
      // Database stores milliseconds, return as is
      return waitingListEntry.offer_expires_at;
    }
    
    return null;
  };

  // Initialize on mount - only for authenticated users
  useEffect(() => {
    const initializeCart = async () => {
      if (!user) {
        // Clear any existing cart data if user is not authenticated
        setCartItems([]);
        setWaitingListEntry(null);
        return;
      }
      
      // Load cart from localStorage for authenticated users
      const cartLoaded = loadCartFromStorage();
      console.log('Cart loaded from storage:', cartLoaded);
      
      // Then check waiting list status
      await checkWaitingListStatus();
    };
    
    if (eventId) {
      initializeCart();
    }
  }, [eventId, user?.id]);

  // Set up real-time subscription for waiting list updates (authenticated users only)
  useEffect(() => {
    if (!eventId || !user) return;

    console.log('Setting up real-time subscription for user:', user.id);

    // Create a unique channel name that includes timestamp to avoid conflicts
    const channelName = `waiting_list_${eventId}_${user.id}`.replace(/[^a-zA-Z0-9_]/g, '_');
    
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiting_list',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('Real-time waiting list update:', payload);
          // Add a small delay to ensure database consistency
          setTimeout(() => {
            checkWaitingListStatus();
          }, 100);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription:', channelName);
      supabase.removeChannel(subscription);
    };
  }, [eventId, user?.id]);

  return {
    cartItems,
    waitingListEntry,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getExpiryTime,
    checkWaitingListStatus
  };
};
