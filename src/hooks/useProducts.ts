
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string | null;
  category: string;
  rating: number | null;
  reviews: number | null;
  in_stock: boolean | null;
  vendor_id: string;
  event_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useProducts = (eventId?: string) => {
  return useQuery({
    queryKey: ['products', eventId],
    queryFn: async () => {
      console.log('Fetching products from Supabase', eventId ? `for event ${eventId}` : '');
      
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If eventId is provided, filter by event
      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Products fetched:', data?.length);
      return data as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      return data as Product;
    },
    enabled: !!id,
  });
};
