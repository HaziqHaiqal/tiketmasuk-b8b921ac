
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface WaitingListEntry {
  id: string;
  user_id: string;
  event_id: string;
  status: 'waiting' | 'offered' | 'purchased' | 'expired';
  offer_expires_at: number | null;
  quantity?: number; // Add quantity field for UI compatibility
  created_at: string;
  updated_at: string;
}

interface JoinWaitingListResponse {
  success: boolean;
  status?: string;
  error?: string;
  waiting_list_id?: string;
  user_id?: string;
  offer_expires_at?: number;
}

export const useTicketReservation = (eventId?: string) => {
  const { user } = useAuth();
  const [reservation, setReservation] = useState<WaitingListEntry | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user has active entry in waiting list for this event
  const checkReservation = async () => {
    if (!user || !eventId) return;

    try {
      console.log('Checking reservation for user:', user.id, 'event:', eventId);
      
      const { data, error } = await supabase
        .from('waiting_list')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .in('status', ['waiting', 'offered'])
        .maybeSingle();

      if (error) {
        console.error('Error checking reservation:', error);
        return;
      }

      console.log('Reservation check result:', data);

      if (data) {
        // Add default quantity for UI compatibility and ensure proper timestamp handling
        const entryWithQuantity = { 
          ...data, 
          quantity: 1,
          offer_expires_at: data.offer_expires_at 
        } as WaitingListEntry;
        setReservation(entryWithQuantity);
      } else {
        setReservation(null);
      }
    } catch (error) {
      console.error('Error in checkReservation:', error);
    }
  };

  // Create waiting list entry (join queue or get immediate offer)
  const createReservation = async (ticketTypeId: string, quantity: number) => {
    if (!user || !eventId) return false;

    setLoading(true);
    try {
      console.log('Creating reservation for user:', user.id, 'event:', eventId);
      
      // Use the join_waiting_list function that handles immediate offers or queuing
      const { data, error } = await supabase.rpc('join_waiting_list', {
        event_uuid: eventId,
        user_uuid: user.id
      });

      if (error) {
        console.error('Error joining waiting list:', error);
        toast.error('Failed to join waiting list');
        return false;
      }

      console.log('Join waiting list response:', data);

      // Safely cast the Json response to our interface
      const response = data as unknown as JoinWaitingListResponse;
      
      if (response?.success) {
        if (response.status === 'offered') {
          toast.success('Ticket offered! You have 20 minutes to complete purchase.');
        } else {
          toast.success('Added to waiting list! You\'ll be notified when tickets become available.');
        }
        
        // Refresh the reservation state
        await checkReservation();
        return true;
      } else {
        toast.error(response?.error || 'Failed to join waiting list');
        return false;
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Failed to join waiting list');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Release waiting list entry
  const releaseReservation = async () => {
    if (!reservation) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('waiting_list')
        .update({ status: 'expired' })
        .eq('id', reservation.id);

      if (error) {
        toast.error('Failed to release reservation');
        return false;
      }

      setReservation(null);
      toast.success('Reservation released');
      return true;
    } catch (error) {
      console.error('Error releasing reservation:', error);
      toast.error('Failed to release reservation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      checkReservation();
    }
  }, [user, eventId]);

  // Set up real-time subscription for waiting list updates
  useEffect(() => {
    if (!eventId || !user) return;

    console.log('Setting up real-time subscription for user reservations');

    const subscription = supabase
      .channel(`waiting_list_${eventId}_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiting_list',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('Waiting list update for user reservation:', payload);
          checkReservation();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, user]);

  return {
    reservation,
    loading,
    createReservation,
    releaseReservation,
    checkReservation
  };
};
