
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

interface EventOptionsSectionProps {
  eventId: string;
  ticketHolderIndex?: number;
  onOptionsChange?: (options: any) => void;
}

const EventOptionsSection: React.FC<EventOptionsSectionProps> = ({ 
  eventId, 
  ticketHolderIndex, 
  onOptionsChange 
}) => {
  const { data: products, isLoading } = useProducts();
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, any>>({});

  // Filter products for this specific event
  const eventProducts = products?.filter(product => product.event_id === eventId) || [];

  // Helper function to determine if a product is required based on category_code
  const isProductRequired = (product: any) => {
    return product.category_code === 'event-essential';
  };

  React.useEffect(() => {
    // Auto-select required products with quantity 1
    const requiredProducts = eventProducts.filter(product => isProductRequired(product));
    const initialOptions: Record<string, any> = { ...selectedOptions };
    
    requiredProducts.forEach(product => {
      if (!initialOptions[product.id]) {
        initialOptions[product.id] = { quantity: 1 };
      }
    });
    
    if (Object.keys(initialOptions).length !== Object.keys(selectedOptions).length) {
      setSelectedOptions(initialOptions);
      if (onOptionsChange) {
        onOptionsChange(initialOptions);
      }
    }
  }, [eventProducts, selectedOptions, onOptionsChange]);

  const updateProductOption = (productId: string, field: string, value: any) => {
    const newOptions = {
      ...selectedOptions,
      [productId]: {
        ...selectedOptions[productId],
        [field]: value
      }
    };
    setSelectedOptions(newOptions);
    
    // Notify parent component of changes
    if (onOptionsChange) {
      onOptionsChange(newOptions);
    }
  };

  const getProductOption = (productId: string, field: string) => {
    return selectedOptions[productId]?.[field] || '';
  };

  const getVariantTypes = (product: any) => {
    if (!product.variants?.options) return [];
    return Object.keys(product.variants.options);
  };

  const getVariantValues = (product: any, variantType: string) => {
    if (!product.variants?.options) return [];
    return product.variants.options[variantType] || [];
  };

  const getCurrentStock = (product: any) => {
    const variantTypes = getVariantTypes(product);
    if (!product.variants?.stock || variantTypes.length === 0) {
      return product.in_stock ? 999 : 0;
    }
    
    const variantKey = variantTypes.map(type => 
      getProductOption(product.id, `variant_${type}`)
    ).join('-');
    
    return product.variants.stock[variantKey] || 0;
  };

  const getPriceAdjustment = (product: any) => {
    const variantTypes = getVariantTypes(product);
    if (!product.variants?.pricing || variantTypes.length === 0) return 0;
    
    const variantKey = variantTypes.map(type => 
      getProductOption(product.id, `variant_${type}`)
    ).join('-');
    
    return product.variants.pricing[variantKey] || 0;
  };

  const calculateProductTotal = (product: any) => {
    const quantity = getProductOption(product.id, 'quantity') || (isProductRequired(product) ? 1 : 0);
    const priceAdjustment = getPriceAdjustment(product);
    return (product.price + priceAdjustment) * quantity;
  };

  const canSelectProduct = (product: any) => {
    const variantTypes = getVariantTypes(product);
    if (variantTypes.length === 0) return product.in_stock;
    
    // Check if all variant types have been selected
    const allSelected = variantTypes.every(type => 
      getProductOption(product.id, `variant_${type}`)
    );
    
    return allSelected && getCurrentStock(product) > 0;
  };

  const shouldShowStock = (product: any) => {
    const variantTypes = getVariantTypes(product);
    if (variantTypes.length === 0) return true;
    
    // Only show stock status if all variants are selected
    return variantTypes.every(type => 
      getProductOption(product.id, `variant_${type}`)
    );
  };

  const toggleProductSelection = (productId: string) => {
    const currentQuantity = getProductOption(productId, 'quantity') || 0;
    const newQuantity = currentQuantity === 0 ? 1 : 0;
    updateProductOption(productId, 'quantity', newQuantity);
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
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingBag className="w-5 h-5 mr-2" />
          Event Options
        </CardTitle>
        <p className="text-gray-600">Select merchandise and products for this ticket (1 per ticket)</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {eventProducts.map((product) => {
            const variantTypes = getVariantTypes(product);
            const currentStock = getCurrentStock(product);
            const priceAdjustment = getPriceAdjustment(product);
            const quantity = getProductOption(product.id, 'quantity') || (isProductRequired(product) ? 1 : 0);
            const productTotal = calculateProductTotal(product);
            const showStock = shouldShowStock(product);
            const isSelected = quantity > 0;
            const isRequired = isProductRequired(product);

            return (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{product.title}</h3>
                        {isRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{product.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-lg font-bold text-green-600">
                          RM {product.price.toFixed(2)}
                          {priceAdjustment > 0 && (
                            <span className="text-sm text-gray-600">
                              {' '}+ RM{priceAdjustment.toFixed(2)}
                            </span>
                          )}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        {showStock && (
                          <>
                            {currentStock > 0 ? (
                              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                {currentStock} in Stock
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Out of Stock
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Variant Selection */}
                    {variantTypes.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {variantTypes.map((variantType) => (
                          <div key={variantType}>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              {variantType}
                            </label>
                            <Select
                              value={getProductOption(product.id, `variant_${variantType}`)}
                              onValueChange={(value) => 
                                updateProductOption(product.id, `variant_${variantType}`, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${variantType.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {getVariantValues(product, variantType).map((value) => (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selection Section */}
                    {(variantTypes.length === 0 || canSelectProduct(product)) && (
                      <div className="flex items-center justify-between">
                        {isRequired ? (
                          // Required products - no toggle, always quantity 1
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-green-600">Included with ticket</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              Quantity: 1
                            </Badge>
                          </div>
                        ) : (
                          // Optional products - show add to ticket toggle
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium">Add to ticket:</span>
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleProductSelection(product.id)}
                              disabled={currentStock === 0}
                              className={isSelected ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {isSelected ? "Added (1)" : "Add"}
                            </Button>
                          </div>
                        )}
                        
                        {isSelected && (
                          <div className="text-right">
                            <span className="text-lg font-bold text-blue-600">
                              RM {productTotal.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Variant selection requirement notice */}
                    {variantTypes.length > 0 && !canSelectProduct(product) && !showStock && (
                      <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        Please select all options to continue
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventOptionsSection;
