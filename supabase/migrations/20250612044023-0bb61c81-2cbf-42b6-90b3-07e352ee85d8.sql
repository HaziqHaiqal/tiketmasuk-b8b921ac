
-- Fix the join_waiting_list function to properly handle the bigint offer_expires_at column
CREATE OR REPLACE FUNCTION public.join_waiting_list(event_uuid uuid, user_uuid text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  existing_entry_count INTEGER;
  event_record RECORD;
  available_result JSON;
  offer_expires_at_ms BIGINT;
  waiting_list_id UUID;
  rate_limit_count INTEGER;
  final_user_id TEXT;
BEGIN
  -- Handle guest users by generating temp ID if needed
  IF user_uuid IS NULL THEN
    final_user_id := gen_random_uuid()::TEXT;
  ELSE
    final_user_id := user_uuid;
  END IF;
  
  -- Rate limiting: Check if user has joined too many times in last 30 minutes
  SELECT COUNT(*) INTO rate_limit_count
  FROM waiting_list 
  WHERE user_id = final_user_id 
    AND created_at > NOW() - INTERVAL '30 minutes';
  
  IF rate_limit_count >= 3 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You''ve joined the waiting list too many times. Please wait before trying again.',
      'error_code', 'RATE_LIMITED'
    );
  END IF;
  
  -- Check if user already has an active entry (not expired)
  SELECT COUNT(*) INTO existing_entry_count
  FROM waiting_list 
  WHERE event_id = event_uuid 
    AND user_id = final_user_id
    AND status != 'expired';
  
  IF existing_entry_count > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Already in waiting list for this event',
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
  
  -- Check availability using existing function
  SELECT check_ticket_availability(event_uuid) INTO available_result;
  
  -- Calculate current timestamp in milliseconds for offer expiration (20 minutes as per requirement)
  offer_expires_at_ms := EXTRACT(EPOCH FROM (NOW() + INTERVAL '20 minutes')) * 1000;
  
  IF (available_result->>'available')::BOOLEAN THEN
    -- Tickets available - create offer immediately
    INSERT INTO waiting_list (
      event_id,
      user_id,
      status,
      offer_expires_at
    ) VALUES (
      event_uuid,
      final_user_id,
      'offered',
      offer_expires_at_ms
    ) RETURNING id INTO waiting_list_id;
    
    RETURN json_build_object(
      'success', true,
      'status', 'offered',
      'message', 'Ticket offered - you have 20 minutes to purchase',
      'waiting_list_id', waiting_list_id,
      'user_id', final_user_id,
      'offer_expires_at', offer_expires_at_ms
    );
  ELSE
    -- No tickets available - add to waiting list
    INSERT INTO waiting_list (
      event_id,
      user_id,
      status
    ) VALUES (
      event_uuid,
      final_user_id,
      'waiting'
    ) RETURNING id INTO waiting_list_id;
    
    RETURN json_build_object(
      'success', true,
      'status', 'waiting',
      'message', 'Added to waiting list - you''ll be notified when a ticket becomes available',
      'waiting_list_id', waiting_list_id,
      'user_id', final_user_id
    );
  END IF;
END;
$function$
