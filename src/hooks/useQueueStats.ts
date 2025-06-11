
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QueueStats {
  totalWaiting: number;
  currentPosition: number;
  userInQueue: boolean;
}

export const useQueueStats = (eventId?: string) => {
  const [queueStats, setQueueStats] = useState<QueueStats>({
    totalWaiting: 0,
    currentPosition: 0,
    userInQueue: false
  });
  const [loading, setLoading] = useState(false);

  const fetchQueueStats = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_queue_stats', {
        event_uuid: eventId
      });

      if (error) {
        console.error('Error fetching queue stats:', error);
        return;
      }

      if (data && data.length > 0) {
        const stats = data[0];
        setQueueStats({
          totalWaiting: stats.total_waiting,
          currentPosition: stats.current_position,
          userInQueue: stats.user_in_queue
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
        () => {
          fetchQueueStats();
        }
      )
      .subscribe();

    return () => {
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
