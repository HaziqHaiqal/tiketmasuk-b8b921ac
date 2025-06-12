
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

// Create a singleton-like state manager to prevent multiple instances
let globalCartState: CartItem[] = [];
let isInitialized = false;

export const useShoppingCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Only load from localStorage once
    if (!isInitialized) {
      const savedCart = localStorage.getItem('shopping-cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('Initial load from localStorage:', parsedCart);
          globalCartState = parsedCart;
          isInitialized = true;
          return parsedCart;
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          localStorage.removeItem('shopping-cart');
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
      console.log('Saving cart to localStorage:', cartItems);
      localStorage.setItem('shopping-cart', JSON.stringify(cartItems));
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

  const clearCart = () => {
    setCartItems([]);
    globalCartState = [];
    localStorage.removeItem('shopping-cart');
    console.log('Cart cleared');
    toast.success('Cart cleared');
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart
  };
};
