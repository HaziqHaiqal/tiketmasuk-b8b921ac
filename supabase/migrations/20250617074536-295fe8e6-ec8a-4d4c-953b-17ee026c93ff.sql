
-- Add ticket_type column to waiting_list table to support per-ticket-category queues
ALTER TABLE public.waiting_list 
ADD COLUMN ticket_type text;

-- Add quantity column to track how many tickets of this type the user wants
ALTER TABLE public.waiting_list 
ADD COLUMN quantity integer DEFAULT 1;

-- Remove guest functionality - drop guest_id column since login is required
ALTER TABLE public.waiting_list 
DROP COLUMN guest_id;

-- Update user_type to only allow authenticated users
ALTER TABLE public.waiting_list 
ALTER COLUMN user_type SET DEFAULT 'authenticated';

-- Ensure user_id is always required (no more guest users)
ALTER TABLE public.waiting_list 
ALTER COLUMN user_id SET NOT NULL;

-- Create index for better performance on ticket-type specific queries
CREATE INDEX idx_waiting_list_event_ticket_type_status 
ON public.waiting_list(event_id, ticket_type, status, created_at);

-- Update the join_waiting_list function to support ticket types and remove guest functionality
CREATE OR REPLACE FUNCTION public.join_waiting_list(
  event_uuid uuid, 
  ticket_type_param text DEFAULT 'general',
  quantity_param integer DEFAULT 1
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_entry_count INTEGER;
  event_record RECORD;
  available_result JSON;
  offer_expires_at_ms BIGINT;
  waiting_list_id UUID;
  rate_limit_count INTEGER;
  current_user_id UUID;
BEGIN
  -- Get current authenticated user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Authentication required to join waiting list',
      'error_code', 'AUTH_REQUIRED'
    );
  END IF;
  
  -- Rate limiting: Check if user has joined too many times in last 30 minutes
  SELECT COUNT(*) INTO rate_limit_count
  FROM waiting_list 
  WHERE user_id = current_user_id::text
    AND created_at > NOW() - INTERVAL '30 minutes';
  
  IF rate_limit_count >= 3 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You''ve joined the waiting list too many times. Please wait before trying again.',
      'error_code', 'RATE_LIMITED'
    );
  END IF;
  
  -- Check if user already has an active entry for this event and ticket type
  SELECT COUNT(*) INTO existing_entry_count
  FROM waiting_list 
  WHERE event_id = event_uuid 
    AND user_id = current_user_id::text
    AND ticket_type = ticket_type_param
    AND status != 'expired';
  
  IF existing_entry_count > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Already in waiting list for this ticket type',
      'error_code', 'ALREADY_IN_QUEUE'
    );
  END IF;
  
  -- Verify event exists
  SELECT * INTO event_record FROM events WHERE id = event_uuid;
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Event not found',
      'error_code', 'EVENT_NOT_FOUND'
    );
  END IF;
  
  -- Check availability for this specific ticket type
  SELECT check_ticket_type_availability(event_uuid, ticket_type_param) INTO available_result;
  
  -- Calculate current timestamp in milliseconds for offer expiration (20 minutes)
  offer_expires_at_ms := EXTRACT(EPOCH FROM (NOW() + INTERVAL '20 minutes')) * 1000;
  
  IF (available_result->>'available')::BOOLEAN THEN
    -- Tickets available - create offer immediately
    INSERT INTO waiting_list (
      event_id,
      user_id,
      ticket_type,
      quantity,
      status,
      offer_expires_at,
      user_type
    ) VALUES (
      event_uuid,
      current_user_id::text,
      ticket_type_param,
      quantity_param,
      'offered',
      offer_expires_at_ms,
      'authenticated'
    ) RETURNING id INTO waiting_list_id;
    
    RETURN json_build_object(
      'success', true,
      'status', 'offered',
      'message', 'Ticket offered - you have 20 minutes to purchase',
      'waiting_list_id', waiting_list_id,
      'user_id', current_user_id::text,
      'ticket_type', ticket_type_param,
      'quantity', quantity_param,
      'offer_expires_at', offer_expires_at_ms
    );
  ELSE
    -- No tickets available - add to waiting list
    INSERT INTO waiting_list (
      event_id,
      user_id,
      ticket_type,
      quantity,
      status,
      user_type
    ) VALUES (
      event_uuid,
      current_user_id::text,
      ticket_type_param,
      quantity_param,
      'waiting',
      'authenticated'
    ) RETURNING id INTO waiting_list_id;
    
    RETURN json_build_object(
      'success', true,
      'status', 'waiting',
      'message', 'Added to waiting list - you''ll be notified when tickets become available',
      'waiting_list_id', waiting_list_id,
      'user_id', current_user_id::text,
      'ticket_type', ticket_type_param,
      'quantity', quantity_param
    );
  END IF;
END;
$$;

-- Create function to check ticket availability by type
CREATE OR REPLACE FUNCTION public.check_ticket_type_availability(
  event_uuid uuid, 
  ticket_type_param text DEFAULT 'general'
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  event_record RECORD;
  purchased_count INTEGER;
  active_offers INTEGER;
  available_spots INTEGER;
  now_timestamp BIGINT;
  ticket_limit INTEGER;
BEGIN
  now_timestamp := EXTRACT(EPOCH FROM NOW()) * 1000;
  
  -- Get event details
  SELECT * INTO event_record FROM events WHERE id = event_uuid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found';
  END IF;
  
  -- For now, assume each ticket type has the same limit as total_tickets
  -- In a real implementation, you'd have a ticket_types table with individual limits
  ticket_limit := event_record.total_tickets;
  
  -- Count purchased tickets for this type (placeholder - no tickets table yet)
  purchased_count := 0;
  
  -- Count active offers for this specific ticket type
  SELECT COALESCE(SUM(quantity), 0) INTO active_offers
  FROM waiting_list 
  WHERE event_id = event_uuid 
    AND ticket_type = ticket_type_param
    AND status = 'offered'
    AND (offer_expires_at IS NULL OR offer_expires_at > now_timestamp);
  
  available_spots := ticket_limit - (purchased_count + active_offers);
  
  RETURN json_build_object(
    'available', available_spots > 0,
    'availableSpots', available_spots,
    'ticketLimit', ticket_limit,
    'purchasedCount', purchased_count,
    'activeOffers', active_offers,
    'ticketType', ticket_type_param
  );
END;
$$;

-- Update process_ticket_queue to handle ticket types
CREATE OR REPLACE FUNCTION public.process_ticket_queue(event_uuid uuid DEFAULT NULL::uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_record RECORD;
  ticket_type_record RECORD;
  availability_result RECORD;
  waiting_user RECORD;
  processed_count INTEGER := 0;
  offer_expiry BIGINT;
  now_timestamp BIGINT;
BEGIN
  now_timestamp := EXTRACT(EPOCH FROM NOW()) * 1000;
  
  -- Process all events if none specified
  IF event_uuid IS NULL THEN
    FOR event_record IN 
      SELECT DISTINCT e.id FROM events e 
      JOIN waiting_list wl ON e.id = wl.event_id 
      WHERE wl.status = 'waiting' AND e.is_cancelled = FALSE
    LOOP
      processed_count := processed_count + process_ticket_queue(event_record.id);
    END LOOP;
    RETURN processed_count;
  END IF;
  
  -- Process each ticket type for the specified event
  FOR ticket_type_record IN
    SELECT DISTINCT ticket_type FROM waiting_list
    WHERE event_id = event_uuid AND status = 'waiting'
  LOOP
    -- Check availability for this ticket type
    SELECT * INTO availability_result 
    FROM check_ticket_type_availability(event_uuid, ticket_type_record.ticket_type);
    
    IF NOT availability_result.available THEN
      CONTINUE;
    END IF;
    
    -- Get next waiting users for this ticket type
    FOR waiting_user IN
      SELECT id, user_id, created_at, quantity, ticket_type
      FROM waiting_list
      WHERE event_id = event_uuid 
        AND ticket_type = ticket_type_record.ticket_type
        AND status = 'waiting'
      ORDER BY created_at ASC
      LIMIT availability_result.available_spots
    LOOP
      offer_expiry := now_timestamp + (20 * 60 * 1000); -- 20 minutes
      
      -- Update to offered status
      UPDATE waiting_list 
      SET 
        status = 'offered',
        offer_expires_at = offer_expiry,
        updated_at = NOW()
      WHERE id = waiting_user.id;
      
      processed_count := processed_count + 1;
    END LOOP;
  END LOOP;
  
  RETURN processed_count;
END;
$$;
