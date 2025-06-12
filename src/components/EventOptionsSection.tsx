
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useShoppingCart } from '@/hooks/useShoppingCart';

interface EventOptionsSectionProps {
  eventId: string;
}

const EventOptionsSection: React.FC<EventOptionsSectionProps> = ({ eventId }) => {
  const { data: products, isLoading } = useProducts();
  const { addToCart } = useShoppingCart();
  const [selectedProducts, setSelectedProducts] = React.useState<Record<string, number>>({});

  // Filter products for this specific event
  const eventProducts = products?.filter(product => product.event_id === eventId) || [];

  const updateProductQuantity = (productId: string, change: number) => {
    setSelectedProducts(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleAddToCart = (product: any) => {
    const quantity = selectedProducts[product.id] || 1;
    addToCart({
      id: `product-${product.id}-${Date.now()}`,
      title: product.title,
      price: product.price,
      image: product.image || '/placeholder.svg',
      eventId: eventId,
      ticketType: 'product'
    }, quantity);
    
    // Reset quantity after adding
    setSelectedProducts(prev => ({ ...prev, [product.id]: 0 }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Event Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Loading event products...</p>
        </CardContent>
      </Card>
    );
  }

  if (eventProducts.length === 0) {
    return null; // Don't show the section if no products
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingBag className="w-5 h-5 mr-2" />
          Event Options
        </CardTitle>
        <p className="text-gray-600">Add merchandise and products to your order</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eventProducts.map((product) => (
            <div key={product.id} className="border rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <img
                  src={product.image || '/placeholder.svg'}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="text-gray-600 text-sm">{product.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-lg font-bold text-green-600">
                          RM {product.price}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        {product.in_stock ? (
                          <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                            In Stock
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateProductQuantity(product.id, -1)}
                        disabled={!product.in_stock || (selectedProducts[product.id] || 0) === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {selectedProducts[product.id] || 0}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateProductQuantity(product.id, 1)}
                        disabled={!product.in_stock}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.in_stock || (selectedProducts[product.id] || 0) === 0}
                        size="sm"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventOptionsSection;
