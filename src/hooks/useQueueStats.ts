
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface QueueStats {
  totalWaiting: number;
  currentPosition: number;
  userInQueue: boolean;
  totalActiveOffers: number;
  totalInSystem: number;
  ticketTypeStats: Array<{
    ticketType: string;
    totalInQueue: number;
    totalLimit: number;
    userQuantity: number;
  }>;
}

export const useQueueStats = (eventId?: string) => {
  const { user } = useAuth();
  const [queueStats, setQueueStats] = useState<QueueStats>({
    totalWaiting: 0,
    currentPosition: 0,
    userInQueue: false,
    totalActiveOffers: 0,
    totalInSystem: 0,
    ticketTypeStats: []
  });
  const [loading, setLoading] = useState(false);

  const fetchQueueStats = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      console.log('Fetching detailed queue stats for event:', eventId);
      
      // Get current timestamp in milliseconds
      const nowMs = Date.now();
      
      // Get event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('total_tickets')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Error fetching event data:', eventError);
        return;
      }

      // Get waiting list data for this event
      const { data: waitingListData, error: waitingError } = await supabase
        .from('waiting_list')
        .select('status, offer_expires_at, ticket_type, quantity, user_id')
        .eq('event_id', eventId);

      if (waitingError) {
        console.error('Error fetching waiting list data:', waitingError);
        return;
      }

      console.log('Waiting list data:', waitingListData);

      if (waitingListData && eventData) {
        // Count people currently waiting
        const totalWaiting = waitingListData.filter(entry => entry.status === 'waiting').length;
        
        // Count active offers (not expired)
        const activeOffers = waitingListData.filter(entry => 
          entry.status === 'offered' && 
          (!entry.offer_expires_at || entry.offer_expires_at > nowMs)
        ).length;
        
        // Total people in system (waiting + active offers)
        const totalInSystem = totalWaiting + activeOffers;

        // Group by ticket type and calculate stats
        const ticketTypeMap = new Map<string, {
          totalInQueue: number;
          totalLimit: number;
          userQuantity: number;
        }>();

        waitingListData.forEach(entry => {
          const ticketType = entry.ticket_type || 'General';
          const isActiveEntry = entry.status === 'waiting' || 
            (entry.status === 'offered' && (!entry.offer_expires_at || entry.offer_expires_at > nowMs));
          
          if (isActiveEntry) {
            const current = ticketTypeMap.get(ticketType) || {
              totalInQueue: 0,
              totalLimit: eventData.total_tickets, // For now, same limit for all types
              userQuantity: 0
            };

            current.totalInQueue += entry.quantity || 1;
            
            // If this is the current user's entry
            if (user && entry.user_id === user.id) {
              current.userQuantity += entry.quantity || 1;
            }

            ticketTypeMap.set(ticketType, current);
          }
        });

        const ticketTypeStats = Array.from(ticketTypeMap.entries()).map(([ticketType, stats]) => ({
          ticketType,
          ...stats
        }));

        console.log('Queue stats calculated:', { 
          totalWaiting, 
          activeOffers, 
          totalInSystem,
          ticketTypeStats
        });

        setQueueStats({
          totalWaiting,
          currentPosition: 0, // This would need user context to calculate
          userInQueue: user ? waitingListData.some(entry => entry.user_id === user.id && entry.status !== 'expired') : false,
          totalActiveOffers: activeOffers,
          totalInSystem,
          ticketTypeStats
        });
      }
    } catch (error) {
      console.error('Error in fetchQueueStats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchQueueStats();
    }
  }, [eventId, user?.id]);

  // Set up real-time subscription for queue updates
  useEffect(() => {
    if (!eventId) return;

    console.log('Setting up real-time subscription for event:', eventId);

    const subscription = supabase
      .channel(`queue_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiting_list',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('Real-time queue update:', payload);
          fetchQueueStats();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [eventId]);

  const cancelReservation = async (reservationId: string) => {
    try {
      const { data, error } = await supabase.rpc('cancel_reservation', {
        reservation_uuid: reservationId
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error canceling reservation:', error);
      throw error;
    }
  };

  return {
    queueStats,
    loading,
    fetchQueueStats,
    cancelReservation
  };
};
