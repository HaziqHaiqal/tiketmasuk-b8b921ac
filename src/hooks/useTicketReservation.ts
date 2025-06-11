
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface TicketReservation {
  id: string;
  user_id: string;
  event_id: string;
  ticket_type_id: string;
  quantity: number;
  reserved_at: string;
  expires_at: string;
  status: 'reserved' | 'purchased' | 'expired';
  created_at: string;
  updated_at: string;
}

export const useTicketReservation = (eventId?: string) => {
  const { user } = useAuth();
  const [reservation, setReservation] = useState<TicketReservation | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user has active reservation for this event
  const checkReservation = async () => {
    if (!user || !eventId) return;

    try {
      const { data, error } = await supabase
        .from('ticket_reservations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('status', 'reserved')
        .maybeSingle();

      if (error) {
        console.error('Error checking reservation:', error);
        return;
      }

      // Type cast the data to ensure proper typing
      if (data) {
        setReservation(data as TicketReservation);
      }
    } catch (error) {
      console.error('Error in checkReservation:', error);
    }
  };

  // Create ticket reservation
  const createReservation = async (ticketTypeId: string, quantity: number) => {
    if (!user || !eventId) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ticket_reservations')
        .insert({
          user_id: user.id,
          event_id: eventId,
          ticket_type_id: ticketTypeId,
          quantity: quantity,
          status: 'reserved'
        })
        .select()
        .single();

      if (error) {
        toast.error('Failed to reserve tickets');
        return false;
      }

      // Type cast the data to ensure proper typing
      setReservation(data as TicketReservation);
      toast.success(`Tickets reserved! You have 20 minutes to complete purchase.`);
      return true;
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Failed to reserve tickets');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Release reservation
  const releaseReservation = async () => {
    if (!reservation) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ticket_reservations')
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

  // Set up real-time subscription for reservation updates
  useEffect(() => {
    if (!eventId || !user) return;

    const subscription = supabase
      .channel(`reservations_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_reservations',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('Reservation update:', payload);
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
