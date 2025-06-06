
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

const Products = () => {
  // Mock products data
  const products = [
    {
      id: '1',
      title: 'Concert T-Shirt',
      description: 'Official merchandise from Summer Music Festival 2024. High quality cotton blend.',
      price: 45,
      originalPrice: 60,
      image: '/placeholder.svg',
      category: 'Apparel',
      rating: 4.5,
      reviews: 23,
      vendor: 'EventPro LLC',
      inStock: true
    },
    {
      id: '2',
      title: 'Tech Conference Hoodie',
      description: 'Premium hoodie with conference logo. Perfect for tech enthusiasts.',
      price: 89,
      image: '/placeholder.svg',
      category: 'Apparel',
      rating: 4.8,
      reviews: 15,
      vendor: 'TechEvents Inc',
      inStock: true
    },
    {
      id: '3',
      title: 'Food Expo Tote Bag',
      description: 'Eco-friendly tote bag from Food & Wine Expo. Reusable and stylish.',
      price: 25,
      originalPrice: 35,
      image: '/placeholder.svg',
      category: 'Accessories',
      rating: 4.2,
      reviews: 31,
      vendor: 'Culinary Events',
      inStock: true
    },
    {
      id: '4',
      title: 'Festival Wristband',
      description: 'Limited edition commemorative wristband. Collectible item.',
      price: 15,
      image: '/placeholder.svg',
      category: 'Accessories',
      rating: 4.0,
      reviews: 8,
      vendor: 'EventPro LLC',
      inStock: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Products</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover exclusive merchandise and products from your favorite events
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
