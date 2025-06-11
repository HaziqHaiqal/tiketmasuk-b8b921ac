
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EventImage {
  id: string;
  event_id: string;
  image_url: string;
  description: string;
  display_order: number;
  created_at: string;
}

export const useEventImages = (eventId: string) => {
  return useQuery({
    queryKey: ['event-images', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_images')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching event images:', error);
        throw error;
      }

      return data as EventImage[];
    },
    enabled: !!eventId,
  });
};

export const useAddEventImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, imageUrl, description, displayOrder }: {
      eventId: string;
      imageUrl: string;
      description: string;
      displayOrder: number;
    }) => {
      const { data, error } = await supabase
        .from('event_images')
        .insert({
          event_id: eventId,
          image_url: imageUrl,
          description,
          display_order: displayOrder
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-images', data.event_id] });
    },
  });
};

export const useDeleteEventImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from('event_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
    },
    onSuccess: (_, imageId) => {
      queryClient.invalidateQueries({ queryKey: ['event-images'] });
    },
  });
};
