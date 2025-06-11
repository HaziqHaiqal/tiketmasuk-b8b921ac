
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

// Since subscription tables were removed, return empty data for now
export const useSubscriptionTiers = () => {
  return useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      // Return empty array since subscription_tiers table was removed
      console.log('Subscription tiers table no longer exists');
      return [] as SubscriptionTier[];
    },
  });
};

export const useVendorSubscription = (userId: string) => {
  return useQuery({
    queryKey: ['vendor-subscription', userId],
    queryFn: async () => {
      // Return null since vendor_subscriptions table was removed
      console.log('Vendor subscriptions table no longer exists');
      return null as VendorSubscription | null;
    },
    enabled: !!userId,
  });
};

export const usePromotedEvents = () => {
  return useQuery({
    queryKey: ['promoted-events'],
    queryFn: async () => {
      // Since event_promotions table was removed, get promoted events from function
      const { data, error } = await supabase.rpc('get_promoted_events');

      if (error) {
        console.error('Error fetching promoted events:', error);
        // Return empty array if function doesn't exist
        return [];
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
      // Since event_promotions table was removed, just return a placeholder
      console.log('Event promotions functionality disabled - table was removed');
      throw new Error('Event promotions functionality is currently disabled');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoted-events'] });
    },
  });
};
