
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: any;
  max_promoted_events: number;
  promotion_duration_days: number;
  created_at: string;
}

export interface VendorSubscription {
  id: string;
  user_id: string;
  tier_id: string;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
  tier?: SubscriptionTier;
}

export interface EventPromotion {
  id: string;
  event_id: string;
  subscription_id: string;
  promoted_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export const useSubscriptionTiers = () => {
  return useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching subscription tiers:', error);
        throw error;
      }

      return data as SubscriptionTier[];
    },
  });
};

export const useVendorSubscription = (userId: string) => {
  return useQuery({
    queryKey: ['vendor-subscription', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching vendor subscription:', error);
        throw error;
      }

      return data as VendorSubscription | null;
    },
    enabled: !!userId,
  });
};

export const usePromotedEvents = () => {
  return useQuery({
    queryKey: ['promoted-events'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_promoted_events');

      if (error) {
        console.error('Error fetching promoted events:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateEventPromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, subscriptionId, durationDays }: {
      eventId: string;
      subscriptionId: string;
      durationDays: number;
    }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const { data, error } = await supabase
        .from('event_promotions')
        .insert({
          event_id: eventId,
          subscription_id: subscriptionId,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoted-events'] });
    },
  });
};
