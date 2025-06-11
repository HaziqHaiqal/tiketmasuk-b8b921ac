
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
        .from('management_profiles') // Use correct table name
        .select('*')
        .eq('approval_status', 'approved') // Only get approved organizers
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map management_profiles to Organizer interface
      const mappedOrganizers: Organizer[] = (data || []).map(profile => ({
        id: profile.id,
        business_name: profile.business_name,
        business_description: profile.business_description || '',
        business_address: profile.business_address || '',
        business_phone: profile.business_phone || '',
        events_count: profile.events_count || 0,
        rating: Number(profile.rating || 0),
        image: profile.image || '',
        location: profile.location || profile.business_address || '',
        created_at: profile.created_at || ''
      }));
      
      setOrganizers(mappedOrganizers);
    } catch (err) {
      console.error('Error fetching organizers:', err);
      setError('Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  return { organizers, loading, error, refetch: fetchOrganizers };
};
