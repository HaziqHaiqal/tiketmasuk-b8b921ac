
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Organizer {
  id: string;
  business_name: string;
  business_description: string;
  business_address: string;
  business_phone: string;
  events_count: number;
  rating: number;
  image: string;
  location: string;
  created_at: string;
}

export const useOrganizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizers(data || []);
    } catch (err) {
      console.error('Error fetching organizers:', err);
      setError('Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  return { organizers, loading, error, refetch: fetchOrganizers };
};
