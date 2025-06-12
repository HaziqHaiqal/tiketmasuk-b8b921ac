
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShirtIcon, Coffee, Utensils } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { toast } from 'sonner';

interface EventOptionsSectionProps {
  eventId: string;
}

// Mock data for event options/products
const eventProducts = [
  {
    id: 'tshirt-001',
    name: 'Event T-Shirt',
    description: 'Official event merchandise',
    basePrice: 35,
    image: '/placeholder.svg',
    icon: ShirtIcon,
    variants: [
      { id: 'tshirt-s', name: 'Small', price: 0, stock: 10 },
      { id: 'tshirt-m', name: 'Medium', price: 0, stock: 15 },
      { id: 'tshirt-l', name: 'Large', price: 0, stock: 8 },
      { id: 'tshirt-xl', name: 'X-Large', price: 5, stock: 5 },
    ]
  },
  {
    id: 'coffee-001',
    name: 'Premium Coffee',
    description: 'Freshly brewed coffee during the event',
    basePrice: 12,
    image: '/placeholder.svg',
    icon: Coffee,
    variants: [
      { id: 'coffee-regular', name: 'Regular', price: 0, stock: 20 },
      { id: 'coffee-large', name: 'Large', price: 3, stock: 15 },
    ]
  },
  {
    id: 'meal-001',
    name: 'Event Meal',
    description: 'Catered lunch during the event',
    basePrice: 25,
    image: '/placeholder.svg',
    icon: Utensils,
    variants: [
      { id: 'meal-veg', name: 'Vegetarian', price: 0, stock: 12 },
      { id: 'meal-chicken', name: 'Chicken', price: 0, stock: 18 },
      { id: 'meal-fish', name: 'Fish', price: 5, stock: 8 },
    ]
  }
];

const EventOptionsSection: React.FC<EventOptionsSectionProps> = ({ eventId }) => {
  const { addToCart } = useShoppingCart();
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: any }>({});
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleVariantChange = (productId: string, variantId: string) => {
    const product = eventProducts.find(p => p.id === productId);
    const variant = product?.variants.find(v => v.id === variantId);
    
    if (variant) {
      setSelectedVariants(prev => ({
        ...prev,
        [productId]: variant
      }));
      // Reset quantity when variant changes
      setQuantities(prev => ({
        ...prev,
        [productId]: 0
      }));
    }
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const currentQty = quantities[productId] || 0;
    const newQty = Math.max(0, Math.min(1, currentQty + delta)); // Limit to max 1 per ticket
    
    setQuantities(prev => ({
      ...prev,
      [productId]: newQty
    }));
  };

  const addProductToCart = (product: any) => {
    const selectedVariant = selectedVariants[product.id];
    const quantity = quantities[product.id] || 0;

    if (!selectedVariant) {
      toast.error('Please select a variant first');
      return;
    }

    if (quantity === 0) {
      toast.error('Please select quantity');
      return;
    }

    const cartItem = {
      id: `${product.id}-${selectedVariant.id}-${Date.now()}`,
      title: `${product.name} (${selectedVariant.name})`,
      price: product.basePrice + selectedVariant.price,
      image: product.image,
      eventId,
      ticketType: 'product',
      selectedOptions: {
        variant: selectedVariant
      }
    };

    addToCart(cartItem, quantity);
    
    // Reset selections after adding to cart
    setQuantities(prev => ({ ...prev, [product.id]: 0 }));
  };

  const getSelectedVariant = (productId: string) => {
    return selectedVariants[productId];
  };

  const getVariantStock = (productId: string) => {
    const variant = getSelectedVariant(productId);
    return variant ? variant.stock : 0;
  };

  const getTotalPrice = (product: any) => {
    const variant = getSelectedVariant(product.id);
    const quantity = quantities[product.id] || 0;
    const basePrice = product.basePrice;
    const variantPrice = variant ? variant.price : 0;
    return (basePrice + variantPrice) * quantity;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Event Add-ons & Merchandise</h3>
        <p className="text-sm text-gray-600">Enhance your event experience (max 1 per ticket)</p>
      </div>

      {eventProducts.map((product) => {
        const Icon = product.icon;
        const selectedVariant = getSelectedVariant(product.id);
        const quantity = quantities[product.id] || 0;
        const stock = getVariantStock(product.id);
        const totalPrice = getTotalPrice(product);

        return (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  <div className="mt-2">
                    <span className="text-lg font-semibold text-blue-600">
                      RM {product.basePrice}
                    </span>
                    {selectedVariant && selectedVariant.price > 0 && (
                      <span className="text-sm text-gray-500 ml-1">
                        + RM {selectedVariant.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Variant Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Option:</label>
                  <Select 
                    value={selectedVariant?.id || ''} 
                    onValueChange={(value) => handleVariantChange(product.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{variant.name}</span>
                            <div className="flex items-center space-x-2 ml-4">
                              {variant.price > 0 && (
                                <span className="text-sm text-blue-600">+RM {variant.price}</span>
                              )}
                              <Badge variant={variant.stock > 0 ? "secondary" : "destructive"}>
                                {variant.stock > 0 ? `${variant.stock} left` : 'Out of Stock'}
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Display and Quantity Controls */}
                {selectedVariant && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={stock > 0 ? "secondary" : "destructive"}>
                        {stock > 0 ? `${stock} available` : 'Out of Stock'}
                      </Badge>
                      <span className="text-xs text-gray-500">(max 1 per ticket)</span>
                    </div>

                    {stock > 0 && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            disabled={quantity === 0}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            disabled={quantity >= 1} // Limit to 1
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        {quantity > 0 && (
                          <div className="text-right">
                            <div className="text-sm font-semibold">RM {totalPrice}</div>
                            <Button
                              size="sm"
                              onClick={() => addProductToCart(product)}
                              className="mt-1"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EventOptionsSection;
