
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  vendor: string;
  inStock: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  description,
  price,
  originalPrice,
  image,
  category,
  rating,
  reviews,
  vendor,
  inStock
}) => {
  const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 left-3 bg-green-600">
          {category}
        </Badge>
        {discountPercentage > 0 && (
          <Badge className="absolute top-3 right-3 bg-red-500">
            -{discountPercentage}%
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
          <span className="text-gray-400 text-sm ml-1">({reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-green-600">
                ${price}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">by {vendor}</div>
          </div>
          <div className="text-right">
            {inStock ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                In Stock
              </Badge>
            ) : (
              <Badge variant="destructive">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        <Button 
          className="w-full bg-green-600 hover:bg-green-700" 
          disabled={!inStock}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
