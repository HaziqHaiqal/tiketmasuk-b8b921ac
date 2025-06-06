
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Plus, Trash2, Package, DollarSign, Clock, Users } from 'lucide-react';

interface PriceTier {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  availableTickets: number;
  startDate?: string;
  endDate?: string;
  description: string;
}

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  options: { [key: string]: string[] }; // e.g., { size: ['S', 'M', 'L'], color: ['Red', 'Blue'] }
}

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image?: string;
  category: string;
  variants: ProductVariant[];
}

const EventForm = () => {
  const [basicInfo, setBasicInfo] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    capacity: 100
  });

  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([
    {
      id: '1',
      name: 'Super Early Bird',
      price: 50,
      originalPrice: 100,
      availableTickets: 25,
      startDate: '',
      endDate: '',
      description: 'Limited time offer - 50% off!'
    }
  ]);

  const [products, setProducts] = useState<Product[]>([]);

  const addPriceTier = () => {
    const newTier: PriceTier = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      availableTickets: 0,
      description: ''
    };
    setPriceTiers([...priceTiers, newTier]);
  };

  const updatePriceTier = (id: string, field: keyof PriceTier, value: any) => {
    setPriceTiers(priceTiers.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const removePriceTier = (id: string) => {
    setPriceTiers(priceTiers.filter(tier => tier.id !== id));
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      description: '',
      basePrice: 0,
      category: 'merchandise',
      variants: [{
        id: '1',
        name: 'Default',
        price: 0,
        options: {}
      }]
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const addVariantToProduct = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? {
            ...product,
            variants: [...product.variants, {
              id: Date.now().toString(),
              name: '',
              price: 0,
              options: {}
            }]
          }
        : product
    ));
  };

  const updateProductVariant = (productId: string, variantId: string, field: string, value: any) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? {
            ...product,
            variants: product.variants.map(variant =>
              variant.id === variantId ? { ...variant, [field]: value } : variant
            )
          }
        : product
    ));
  };

  const handleSubmit = () => {
    console.log('Event Data:', { basicInfo, priceTiers, products });
    alert('Event saved successfully! (This would integrate with your backend)');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-gray-600">Set up your event with custom pricing and products</p>
        </div>
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
          Save Event
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Tiers</TabsTrigger>
          <TabsTrigger value="products">Products & Add-ons</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})}
                    placeholder="Summer Music Festival"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setBasicInfo({...basicInfo, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="food">Food & Drink</SelectItem>
                      <SelectItem value="art">Art & Culture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                  placeholder="Describe your event..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={basicInfo.date}
                    onChange={(e) => setBasicInfo({...basicInfo, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={basicInfo.time}
                    onChange={(e) => setBasicInfo({...basicInfo, time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={basicInfo.capacity}
                    onChange={(e) => setBasicInfo({...basicInfo, capacity: Number(e.target.value)})}
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={basicInfo.location}
                  onChange={(e) => setBasicInfo({...basicInfo, location: e.target.value})}
                  placeholder="Convention Center, Jakarta"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing Tiers
                </CardTitle>
                <Button onClick={addPriceTier} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {priceTiers.map((tier, index) => (
                <div key={tier.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">Tier {index + 1}</Badge>
                    {priceTiers.length > 1 && (
                      <Button
                        onClick={() => removePriceTier(tier.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tier Name</Label>
                      <Input
                        value={tier.name}
                        onChange={(e) => updatePriceTier(tier.id, 'name', e.target.value)}
                        placeholder="Early Bird"
                      />
                    </div>
                    <div>
                      <Label>Available Tickets</Label>
                      <Input
                        type="number"
                        value={tier.availableTickets}
                        onChange={(e) => updatePriceTier(tier.id, 'availableTickets', Number(e.target.value))}
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Price (IDR)</Label>
                      <Input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updatePriceTier(tier.id, 'price', Number(e.target.value))}
                        placeholder="150000"
                      />
                    </div>
                    <div>
                      <Label>Original Price (optional)</Label>
                      <Input
                        type="number"
                        value={tier.originalPrice || ''}
                        onChange={(e) => updatePriceTier(tier.id, 'originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="200000"
                      />
                    </div>
                    <div className="flex items-end">
                      {tier.originalPrice && tier.originalPrice > tier.price && (
                        <Badge className="bg-red-500">
                          {Math.round(((tier.originalPrice - tier.price) / tier.originalPrice) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date (optional)</Label>
                      <Input
                        type="date"
                        value={tier.startDate || ''}
                        onChange={(e) => updatePriceTier(tier.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Date (optional)</Label>
                      <Input
                        type="date"
                        value={tier.endDate || ''}
                        onChange={(e) => updatePriceTier(tier.id, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={tier.description}
                      onChange={(e) => updatePriceTier(tier.id, 'description', e.target.value)}
                      placeholder="Limited time offer!"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Products & Add-ons
                </CardTitle>
                <Button onClick={addProduct} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No products added yet</p>
                  <p className="text-sm">Add merchandise, food, or other add-ons for your event</p>
                </div>
              ) : (
                products.map((product, index) => (
                  <div key={product.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Product {index + 1}</Badge>
                      <Button
                        onClick={() => removeProduct(product.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Product Name</Label>
                        <Input
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                          placeholder="Event T-Shirt"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select onValueChange={(value) => updateProduct(product.id, 'category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="merchandise">Merchandise</SelectItem>
                            <SelectItem value="food">Food & Beverage</SelectItem>
                            <SelectItem value="parking">Parking</SelectItem>
                            <SelectItem value="vip">VIP Add-ons</SelectItem>
                            <SelectItem value="photo">Photo Package</SelectItem>
                            <SelectItem value="transport">Transportation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={product.description}
                        onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                        placeholder="High-quality cotton t-shirt with event logo"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Base Price (IDR)</Label>
                      <Input
                        type="number"
                        value={product.basePrice}
                        onChange={(e) => updateProduct(product.id, 'basePrice', Number(e.target.value))}
                        placeholder="75000"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Variants</Label>
                        <Button
                          onClick={() => addVariantToProduct(product.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Variant
                        </Button>
                      </div>
                      
                      {product.variants.map((variant, variantIndex) => (
                        <div key={variant.id} className="border rounded p-3 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input
                              value={variant.name}
                              onChange={(e) => updateProductVariant(product.id, variant.id, 'name', e.target.value)}
                              placeholder="Size S - Black"
                            />
                            <Input
                              type="number"
                              value={variant.price}
                              onChange={(e) => updateProductVariant(product.id, variant.id, 'price', Number(e.target.value))}
                              placeholder="Additional price"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {products.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips for Products:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• T-shirts/Merchandise: Add size variants (S, M, L, XL) and color options</li>
                    <li>• Food packages: Create combo deals with different price points</li>
                    <li>• VIP add-ons: Include meet & greet, priority seating, or exclusive access</li>
                    <li>• Photo packages: Offer professional photos or instant prints</li>
                    <li>• Transportation: Provide shuttle services from key locations</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventForm;
