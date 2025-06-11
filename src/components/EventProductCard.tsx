
import React, { useState, useMemo } from 'react';
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

  // Extract unique variant types from all variants
  const variantTypes = useMemo(() => {
    if (!product.variants) return [];
    
    const types = new Set<string>();
    product.variants.forEach(variant => {
      Object.keys(variant.variant_combination).forEach(key => {
        types.add(key);
      });
    });
    
    return Array.from(types);
  }, [product.variants]);

  // Get available values for each variant type
  const getVariantValues = (variantType: string) => {
    if (!product.variants) return [];
    
    const values = new Set<string>();
    product.variants.forEach(variant => {
      if (variant.variant_combination[variantType]) {
        values.add(variant.variant_combination[variantType]);
      }
    });
    
    return Array.from(values);
  };

  // Find the current variant based on selected options
  const currentVariant = useMemo(() => {
    if (!product.variants || variantTypes.length === 0) return null;
    
    return product.variants.find(variant => {
      return variantTypes.every(type => 
        variant.variant_combination[type] === selectedVariants[type]
      );
    });
  }, [product.variants, selectedVariants, variantTypes]);

  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantType]: value
    }));
  };

  const calculateTotalPrice = () => {
    let total = product.price;
    if (currentVariant) {
      total += currentVariant.price_adjustment;
    }
    return total * quantity;
  };

  const canAddToCart = () => {
    // If no variants, can add to cart
    if (variantTypes.length === 0) return true;
    
    // Check if all variant types have been selected
    return variantTypes.every(type => selectedVariants[type]);
  };

  const handleAddToCart = () => {
    if (canAddToCart()) {
      onAddToCart(product, selectedVariants, quantity);
    }
  };

  const isInStock = currentVariant ? 
    currentVariant.is_available && currentVariant.stock_quantity > 0 : 
    product.in_stock;

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
              {currentVariant && currentVariant.price_adjustment > 0 && (
                <span className="text-sm text-gray-600">
                  {' '}+ RM{currentVariant.price_adjustment.toFixed(2)}
                </span>
              )}
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
        {variantTypes.length > 0 && (
          <div className="space-y-3 mb-4">
            {variantTypes.map((variantType) => (
              <div key={variantType}>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {variantType}
                </label>
                <Select
                  value={selectedVariants[variantType] || ''}
                  onValueChange={(value) => handleVariantChange(variantType, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${variantType.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {getVariantValues(variantType).map((value) => {
                      // Find if this specific combination is available
                      const testVariant = product.variants?.find(v => 
                        v.variant_combination[variantType] === value
                      );
                      const isAvailable = testVariant?.is_available && testVariant.stock_quantity > 0;
                      
                      return (
                        <SelectItem
                          key={value}
                          value={value}
                          disabled={!isAvailable}
                        >
                          {value}
                          {!isAvailable && (
                            <span className="text-sm text-red-500 ml-1">(Out of stock)</span>
                          )}
                        </SelectItem>
                      );
                    })}
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

        {/* Stock Information */}
        {currentVariant && (
          <div className="mb-2 text-sm text-gray-600">
            Stock: {currentVariant.stock_quantity} available
            {currentVariant.sku && (
              <span className="block text-xs text-gray-500">SKU: {currentVariant.sku}</span>
            )}
          </div>
        )}

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
          disabled={!canAddToCart() || !isInStock}
          className="w-full"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {!isInStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventProductCard;
