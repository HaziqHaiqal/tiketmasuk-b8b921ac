
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
      
      // Get comprehensive queue statistics
      const { data, error } = await supabase.rpc('get_queue_stats', {
        event_uuid: eventId
      });

      if (error) {
        console.error('Error fetching queue stats:', error);
        return;
      }

      console.log('Queue stats response:', data);

      if (data && data.length > 0) {
        const stats = data[0];
        
        // Also get additional stats for active offers and total people in system
        const { data: waitingListData, error: waitingError } = await supabase
          .from('waiting_list')
          .select('status')
          .eq('event_id', eventId);

        if (!waitingError && waitingListData) {
          const activeOffers = waitingListData.filter(entry => entry.status === 'offered').length;
          const totalInSystem = waitingListData.filter(entry => 
            entry.status === 'waiting' || entry.status === 'offered'
          ).length;

          console.log('Additional stats:', { activeOffers, totalInSystem });

          setQueueStats({
            totalWaiting: stats.total_waiting || 0,
            currentPosition: stats.current_position || 0,
            userInQueue: stats.user_in_queue || false,
            totalActiveOffers: activeOffers,
            totalInSystem: totalInSystem
          });
        } else {
          setQueueStats({
            totalWaiting: stats.total_waiting || 0,
            currentPosition: stats.current_position || 0,
            userInQueue: stats.user_in_queue || false,
            totalActiveOffers: 0,
            totalInSystem: stats.total_waiting || 0
          });
        }
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
