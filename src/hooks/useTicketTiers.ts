
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TicketTier {
  id: string;
  event_id: string;
  name: string;
  price: number;
  description: string | null;
  total_tickets: number | null;
  tickets_sold: number;
  sale_start_date: string | null;
  sale_end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTicketTiers = (eventId: string) => {
  return useQuery({
    queryKey: ['ticketTiers', eventId],
    queryFn: async () => {
      console.log('Fetching ticket tiers for event:', eventId);
      
      const { data, error } = await supabase
        .from('ticket_tiers')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching ticket tiers:', error);
        throw error;
      }

      console.log('Ticket tiers fetched:', data?.length);
      return data as TicketTier[];
    },
    enabled: !!eventId,
  });
};
