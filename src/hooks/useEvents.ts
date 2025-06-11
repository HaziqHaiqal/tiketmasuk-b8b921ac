
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  price: number;
  image: string | null;
  category: string;
  attendees: number | null;
  rating: number | null;
  vendor_id: string;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      console.log('Fetching events from Supabase');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      // Map database schema to Event interface
      const mappedEvents: Event[] = data.map(event => ({
        id: event.id,
        title: event.name, // Map 'name' to 'title'
        description: event.description,
        date: new Date(event.event_date).toISOString(), // Map 'event_date' to 'date'
        location: event.location,
        price: Number(event.price),
        image: event.image_storage_id, // Map 'image_storage_id' to 'image'
        category: 'Event', // Default category since not in DB
        attendees: null, // Not in current schema
        rating: null, // Not in current schema
        vendor_id: event.user_id, // Map 'user_id' to 'vendor_id'
        created_at: event.created_at || '',
        updated_at: event.updated_at || ''
      }));

      console.log('Events fetched:', mappedEvents.length);
      return mappedEvents;
    },
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        throw error;
      }

      // Map database schema to Event interface
      const mappedEvent: Event = {
        id: data.id,
        title: data.name,
        description: data.description,
        date: new Date(data.event_date).toISOString(),
        location: data.location,
        price: Number(data.price),
        image: data.image_storage_id,
        category: 'Event',
        attendees: null,
        rating: null,
        vendor_id: data.user_id,
        created_at: data.created_at || '',
        updated_at: data.updated_at || ''
      };

      return mappedEvent;
    },
    enabled: !!id,
  });
};
