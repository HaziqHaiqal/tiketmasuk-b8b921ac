
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
  message?: string;
  error?: string;
}

export const useWaitingListCart = (eventId: string) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [waitingListEntry, setWaitingListEntry] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Generate or get guest session ID
  const getGuestSessionId = () => {
    let sessionId = localStorage.getItem('guest-session-id');
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guest-session-id', sessionId);
    }
    return sessionId;
  };

  const getCurrentUserId = () => {
    return user ? user.id : getGuestSessionId();
  };

  // Check current waiting list status
  const checkWaitingListStatus = async () => {
    if (!eventId) return;

    try {
      const userId = getCurrentUserId();
      console.log('Checking waiting list status for user:', userId);

      const { data, error } = await supabase
        .from('waiting_list')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .in('status', ['waiting', 'offered'])
        .maybeSingle();

      if (error) {
        console.error('Error checking waiting list status:', error);
        return;
      }

      console.log('Waiting list entry found:', data);
      setWaitingListEntry(data);

      // If user has an active entry, restore cart items from localStorage
      if (data) {
        const savedCart = localStorage.getItem(`cart-${userId}-${eventId}`);
        if (savedCart) {
          try {
            const cartData = JSON.parse(savedCart);
            console.log('Restoring cart from localStorage:', cartData);
            setCartItems(cartData);
          } catch (error) {
            console.error('Error parsing saved cart:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in checkWaitingListStatus:', error);
    }
  };

  // Add to cart - follows Convex pattern
  const addToCart = async (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      console.log('Adding to cart for user:', userId, 'product:', product);

      // Check if user already has items in cart for this event
      const existingCartKey = `cart-${userId}-${eventId}`;
      const existingCart = localStorage.getItem(existingCartKey);
      
      // Create the new item
      const newItem = { ...product, quantity };
      
      if (existingCart || waitingListEntry) {
        // If cart exists or user is already in waiting list, just add the item locally
        const existingItems = existingCart ? JSON.parse(existingCart) : cartItems;
        const updatedItems = [...existingItems, newItem];
        
        setCartItems(updatedItems);
        localStorage.setItem(existingCartKey, JSON.stringify(updatedItems));
        
        console.log('Added item to existing cart:', newItem);
        toast.success('Item added to cart');
        return;
      }

      // If no cart exists and not in waiting list, join waiting list first
      const { data, error } = await supabase.rpc('join_waiting_list', {
        event_uuid: eventId,
        user_uuid: userId
      });

      if (error) {
        console.error('Error joining waiting list:', error);
        toast.error('Failed to join waiting list: ' + error.message);
        return;
      }

      console.log('Join waiting list response:', data);

      if (data && typeof data === 'object') {
        const response = data as unknown as WaitingListResponse;
        
        if (response.success) {
          // Add item to cart
          const updatedItems = [newItem];
          
          console.log('Adding item to cart:', newItem);
          setCartItems(updatedItems);

          // Save cart to localStorage
          localStorage.setItem(`cart-${userId}-${eventId}`, JSON.stringify(updatedItems));
          console.log('Cart saved to localStorage');

          if (response.status === 'offered') {
            toast.success('Ticket offered! You have 20 minutes to complete purchase.');
          } else {
            toast.success('Added to waiting list! You\'ll be notified when tickets become available.');
          }

          // Update waiting list entry
          await checkWaitingListStatus();
        } else {
          toast.error(response.error || 'Failed to join waiting list');
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
    const updatedItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedItems);
    
    const userId = getCurrentUserId();
    if (updatedItems.length === 0) {
      localStorage.removeItem(`cart-${userId}-${eventId}`);
    } else {
      localStorage.setItem(`cart-${userId}-${eventId}`, JSON.stringify(updatedItems));
    }
    
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);

    const userId = getCurrentUserId();
    localStorage.setItem(`cart-${userId}-${eventId}`, JSON.stringify(updatedItems));
  };

  const clearCart = async (navigate?: (path: string) => void) => {
    try {
      // Clear cart items
      setCartItems([]);
      setWaitingListEntry(null);

      const userId = getCurrentUserId();
      localStorage.removeItem(`cart-${userId}-${eventId}`);

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
        navigate(`/event/${eventId}`);
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
      // If it's already in milliseconds, return as is
      if (waitingListEntry.offer_expires_at > 1000000000000) {
        return waitingListEntry.offer_expires_at;
      }
      // If it's in seconds, convert to milliseconds
      return waitingListEntry.offer_expires_at * 1000;
    }
    
    return null;
  };

  // Initialize on mount
  useEffect(() => {
    const initializeCart = async () => {
      await checkWaitingListStatus();
      
      // If no waiting list entry, try to restore from localStorage anyway (for persistence)
      if (!waitingListEntry) {
        const userId = getCurrentUserId();
        const savedCart = localStorage.getItem(`cart-${userId}-${eventId}`);
        if (savedCart && cartItems.length === 0) {
          try {
            const cartData = JSON.parse(savedCart);
            console.log('Restoring cart from localStorage on init:', cartData);
            setCartItems(cartData);
          } catch (error) {
            console.error('Error parsing saved cart on init:', error);
          }
        }
      }
    };
    
    initializeCart();
  }, [eventId, user?.id]);

  // Set up real-time subscription for waiting list updates
  useEffect(() => {
    if (!eventId) return;

    const userId = getCurrentUserId();
    console.log('Setting up real-time subscription for user:', userId);

    const channelName = `waiting_list_updates_${eventId}_${userId.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    
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
          setTimeout(() => {
            checkWaitingListStatus();
          }, 100);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription:', channelName);
      subscription.unsubscribe();
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
