
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { Skeleton } from '@/components/ui/skeleton';

const Products = () => {
  const { data: products, isLoading, error } = useProducts();

  console.log('Products page - Loading:', isLoading, 'Products count:', products?.length);

  if (error) {
    console.error('Error in Products page:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Event Products</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Discover exclusive merchandise and products from your favorite events
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading products</p>
            <p className="text-gray-500 text-sm">Please try again later</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products available yet</p>
            <p className="text-gray-500 text-sm">Check back later for new products!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                title={product.title}
                description={product.description || ''}
                price={product.price}
                originalPrice={product.original_price || undefined}
                image={product.image || '/placeholder.svg'}
                category={product.category}
                rating={product.rating || 0}
                reviews={product.reviews || 0}
                vendor="Vendor"
                inStock={product.in_stock ?? true}
                eventId={product.event_id || undefined}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
