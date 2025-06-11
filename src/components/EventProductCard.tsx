
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, ProductVariant } from '@/hooks/useProducts';
import { ShoppingCart, Star } from 'lucide-react';

interface EventProductCardProps {
  product: Product;
  onAddToCart: (product: Product, variants: Record<string, string>, quantity: number) => void;
}

const EventProductCard = ({ product, onAddToCart }: EventProductCardProps) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Group variants by variant_name
  const groupedVariants = product.variants?.reduce((acc, variant) => {
    if (!acc[variant.variant_name]) {
      acc[variant.variant_name] = [];
    }
    acc[variant.variant_name].push(variant);
    return acc;
  }, {} as Record<string, ProductVariant[]>) || {};

  const handleVariantChange = (variantName: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: value
    }));
  };

  const calculateTotalPrice = () => {
    let total = product.price;
    Object.entries(selectedVariants).forEach(([variantName, value]) => {
      const variant = groupedVariants[variantName]?.find(v => v.variant_value === value);
      if (variant) {
        total += variant.price_adjustment;
      }
    });
    return total * quantity;
  };

  const canAddToCart = () => {
    // Check if all variant types have been selected
    const requiredVariants = Object.keys(groupedVariants);
    return requiredVariants.every(variantName => selectedVariants[variantName]);
  };

  const handleAddToCart = () => {
    if (canAddToCart()) {
      onAddToCart(product, selectedVariants, quantity);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="relative">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <Badge className="absolute top-2 left-2 bg-green-600">
          {product.category}
        </Badge>
        {product.original_price && product.original_price > product.price && (
          <Badge className="absolute top-2 right-2 bg-red-600">
            Save RM{(product.original_price - product.price).toFixed(2)}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{product.title}</CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600">
              RM{product.price.toFixed(2)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                RM{product.original_price.toFixed(2)}
              </span>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm">{product.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-gray-600 text-sm mb-4 flex-1">
          {product.description}
        </p>

        {/* Variant Selection */}
        {Object.keys(groupedVariants).length > 0 && (
          <div className="space-y-3 mb-4">
            {Object.entries(groupedVariants).map(([variantName, variants]) => (
              <div key={variantName}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {variantName}
                </label>
                <Select
                  value={selectedVariants[variantName] || ''}
                  onValueChange={(value) => handleVariantChange(variantName, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${variantName.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map((variant) => (
                      <SelectItem
                        key={variant.id}
                        value={variant.variant_value}
                        disabled={!variant.is_available || variant.stock_quantity === 0}
                      >
                        {variant.variant_value}
                        {variant.price_adjustment > 0 && (
                          <span className="text-sm text-gray-500 ml-1">
                            (+RM{variant.price_adjustment.toFixed(2)})
                          </span>
                        )}
                        {variant.stock_quantity === 0 && (
                          <span className="text-sm text-red-500 ml-1">(Out of stock)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}

        {/* Quantity Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Quantity
          </label>
          <Select
            value={quantity.toString()}
            onValueChange={(value) => setQuantity(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Total Price */}
        <div className="mb-4 p-2 bg-gray-50 rounded">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total:</span>
            <span className="text-lg font-bold text-blue-600">
              RM{calculateTotalPrice().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart() || !product.in_stock}
          className="w-full"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {!product.in_stock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventProductCard;
