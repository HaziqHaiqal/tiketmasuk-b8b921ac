
import { useState, useEffect } from 'react';
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

interface CartSession {
  sessionId: string;
  cartItems: CartItem[];
  createdAt: number;
  expiresAt: number;
}

// Generate a unique session ID for guest users
const generateSessionId = () => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('cart-session-id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('cart-session-id', sessionId);
  }
  return sessionId;
};

// Create a singleton-like state manager to prevent multiple instances
let globalCartState: CartItem[] = [];
let globalSessionData: CartSession | null = null;
let isInitialized = false;

export const useShoppingCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Only load from localStorage once
    if (!isInitialized) {
      const sessionId = getSessionId();
      const savedSession = localStorage.getItem(`cart-session-${sessionId}`);
      
      if (savedSession) {
        try {
          const sessionData: CartSession = JSON.parse(savedSession);
          
          // Check if session hasn't expired
          if (sessionData.expiresAt > Date.now()) {
            console.log('Loading cart from session:', sessionData);
            globalCartState = sessionData.cartItems;
            globalSessionData = sessionData;
            isInitialized = true;
            return sessionData.cartItems;
          } else {
            // Session expired, clear it
            console.log('Cart session expired, clearing');
            localStorage.removeItem(`cart-session-${sessionId}`);
          }
        } catch (error) {
          console.error('Error parsing cart session:', error);
          localStorage.removeItem(`cart-session-${sessionId}`);
        }
      }
      isInitialized = true;
    }
    return globalCartState;
  });

  // Save to localStorage whenever cartItems changes
  useEffect(() => {
    if (cartItems !== globalCartState) {
      globalCartState = cartItems;
      const sessionId = getSessionId();
      
      if (cartItems.length > 0) {
        const sessionData: CartSession = {
          sessionId,
          cartItems,
          createdAt: globalSessionData?.createdAt || Date.now(),
          expiresAt: globalSessionData?.expiresAt || (Date.now() + 20 * 60 * 1000) // 20 minutes
        };
        
        globalSessionData = sessionData;
        console.log('Saving cart session:', sessionData);
        localStorage.setItem(`cart-session-${sessionId}`, JSON.stringify(sessionData));
      } else {
        // Clear session when cart is empty
        localStorage.removeItem(`cart-session-${sessionId}`);
        globalSessionData = null;
      }
    }
  }, [cartItems]);

  const addToCart = (product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    console.log('Adding to cart:', product, 'quantity:', quantity);
    
    const newItem = { ...product, quantity };
    
    setCartItems(prevItems => {
      const updatedItems = [...prevItems, newItem];
      console.log('Cart updated with new item:', updatedItems);
      return updatedItems;
    });
    
    toast.success(`${product.title} added to cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== productId);
      console.log('Removed item from cart:', updatedItems);
      return updatedItems;
    });
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
      console.log('Updated quantity:', updatedItems);
      return updatedItems;
    });
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getSessionExpiryTime = (): number | null => {
    return globalSessionData?.expiresAt || null;
  };

  const clearCart = (eventId?: string, navigate?: (path: string) => void) => {
    setCartItems([]);
    globalCartState = [];
    globalSessionData = null;
    
    const sessionId = getSessionId();
    localStorage.removeItem(`cart-session-${sessionId}`);
    
    console.log('Cart cleared');
    toast.success('Cart cleared');
    
    // Navigate to event page if eventId and navigate function are provided
    if (eventId && navigate) {
      navigate(`/event/${eventId}`);
    }
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart,
    getSessionExpiryTime
  };
};
