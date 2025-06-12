
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
  quantity?: number;
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

  const checkReservation = async () => {
    if (!user || !eventId) {
      console.log('No user or eventId for reservation check:', { user: !!user, eventId });
      setReservation(null);
      return;
    }

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
        setReservation(null);
        return;
      }

      console.log('Reservation check result:', data);

      if (data) {
        // Handle timestamp conversion properly
        let expiresAt = data.offer_expires_at;
        
        // If it's a string timestamp, convert to milliseconds
        if (typeof expiresAt === 'string') {
          expiresAt = new Date(expiresAt).getTime();
        }
        // If it's a number but looks like seconds (less than year 2000), convert to milliseconds
        else if (typeof expiresAt === 'number' && expiresAt < 946684800000) {
          expiresAt = expiresAt * 1000;
        }
        
        const entryWithQuantity = { 
          ...data, 
          quantity: 1,
          offer_expires_at: expiresAt
        } as WaitingListEntry;
        
        console.log('Setting reservation with processed expires_at:', entryWithQuantity);
        setReservation(entryWithQuantity);
      } else {
        console.log('No active reservation found');
        setReservation(null);
      }
    } catch (error) {
      console.error('Error in checkReservation:', error);
      setReservation(null);
    }
  };

  const createReservation = async (ticketTypeId: string, quantity: number) => {
    if (!user || !eventId) return false;

    setLoading(true);
    try {
      console.log('Creating reservation for user:', user.id, 'event:', eventId);
      
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

  // Check reservation when hook mounts or dependencies change
  useEffect(() => {
    if (eventId && user) {
      checkReservation();
    }
  }, [user?.id, eventId]);

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
          // Small delay to ensure DB consistency
          setTimeout(() => {
            checkReservation();
          }, 100);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, user?.id]);

  return {
    reservation,
    loading,
    createReservation,
    releaseReservation,
    checkReservation
  };
};
