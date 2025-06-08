
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useShoppingCart } from '@/hooks/useShoppingCart';

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
  id,
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
  const { addToCart } = useShoppingCart();
  const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    
    addToCart({
      id,
      title,
      price,
      image
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-36 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-2 left-2 bg-green-600 text-xs">
          {category}
        </Badge>
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-xs">
            -{discountPercentage}%
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white h-8 w-8"
        >
          <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>
      
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm sm:text-lg mb-2 line-clamp-2 leading-tight">{title}</h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 flex-1">{description}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1" />
            <span className="text-xs sm:text-sm font-medium">{rating}</span>
          </div>
          <span className="text-gray-400 text-xs sm:text-sm ml-1">({reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-lg font-bold text-green-600">
                RM {price}
              </span>
              {originalPrice && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">
                  RM {originalPrice}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">by {vendor}</div>
          </div>
          <div className="text-right">
            {inStock ? (
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

        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2" 
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
