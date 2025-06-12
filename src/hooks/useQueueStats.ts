
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QueueStats {
  totalWaiting: number;
  currentPosition: number;
  userInQueue: boolean;
  totalActiveOffers: number;
  totalInSystem: number;
}

export const useQueueStats = (eventId?: string) => {
  const [queueStats, setQueueStats] = useState<QueueStats>({
    totalWaiting: 0,
    currentPosition: 0,
    userInQueue: false,
    totalActiveOffers: 0,
    totalInSystem: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchQueueStats = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      console.log('Fetching queue stats for event:', eventId);
      
      // Get current timestamp in milliseconds
      const nowMs = Date.now();
      
      // Get waiting list data for this event
      const { data: waitingListData, error: waitingError } = await supabase
        .from('waiting_list')
        .select('status, offer_expires_at')
        .eq('event_id', eventId);

      if (waitingError) {
        console.error('Error fetching waiting list data:', waitingError);
        return;
      }

      console.log('Waiting list data:', waitingListData);

      if (waitingListData) {
        // Count people currently waiting
        const totalWaiting = waitingListData.filter(entry => entry.status === 'waiting').length;
        
        // Count active offers (not expired)
        const activeOffers = waitingListData.filter(entry => 
          entry.status === 'offered' && 
          (!entry.offer_expires_at || entry.offer_expires_at > nowMs)
        ).length;
        
        // Total people in system (waiting + active offers)
        const totalInSystem = totalWaiting + activeOffers;

        console.log('Queue stats calculated:', { 
          totalWaiting, 
          activeOffers, 
          totalInSystem 
        });

        setQueueStats({
          totalWaiting,
          currentPosition: 0, // This would need user context to calculate
          userInQueue: false, // This would need user context to determine
          totalActiveOffers: activeOffers,
          totalInSystem
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
  }, [eventId]);

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
