
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface WaitingListEntry {
  id: string;
  user_id: string;
  event_id: string;
  position: number;
  status: 'waiting' | 'offered' | 'purchased' | 'expired' | 'cancelled';
  offer_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useWaitingList = (eventId?: string) => {
  const { user } = useAuth();
  const [waitingListEntry, setWaitingListEntry] = useState<WaitingListEntry | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user is in waiting list for this event
  const checkWaitingListStatus = async () => {
    if (!user || !eventId) return;

    try {
      const { data, error } = await supabase
        .from('waiting_list')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking waiting list status:', error);
        return;
      }

      // Type cast the data to match our interface
      setWaitingListEntry(data as WaitingListEntry);
    } catch (error) {
      console.error('Error in checkWaitingListStatus:', error);
    }
  };

  // Join waiting list
  const joinWaitingList = async () => {
    if (!user || !eventId) return false;

    setLoading(true);
    try {
      // Let the database trigger handle position assignment
      const { data, error } = await supabase
        .from('waiting_list')
        .insert({
          user_id: user.id,
          event_id: eventId,
          status: 'waiting',
          position: 0 // This will be overridden by the trigger
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('You are already in the waiting list for this event');
        } else {
          toast.error('Failed to join waiting list');
        }
        return false;
      }

      // Type cast the data to match our interface
      setWaitingListEntry(data as WaitingListEntry);
      toast.success('Successfully joined the waiting list!');
      return true;
    } catch (error) {
      console.error('Error joining waiting list:', error);
      toast.error('Failed to join waiting list');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Leave waiting list
  const leaveWaitingList = async () => {
    if (!waitingListEntry) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('waiting_list')
        .update({ status: 'cancelled' })
        .eq('id', waitingListEntry.id);

      if (error) {
        toast.error('Failed to leave waiting list');
        return false;
      }

      setWaitingListEntry(null);
      toast.success('Successfully left the waiting list');
      return true;
    } catch (error) {
      console.error('Error leaving waiting list:', error);
      toast.error('Failed to leave waiting list');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      checkWaitingListStatus();
    }
  }, [user, eventId]);

  // Set up real-time subscription for position updates
  useEffect(() => {
    if (!eventId || !user) return;

    const subscription = supabase
      .channel(`waiting_list_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiting_list',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('Waiting list update:', payload);
          checkWaitingListStatus();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, user]);

  return {
    waitingListEntry,
    loading,
    joinWaitingList,
    leaveWaitingList,
    checkWaitingListStatus
  };
};
