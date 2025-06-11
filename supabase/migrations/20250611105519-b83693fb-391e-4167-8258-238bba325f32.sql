
-- Create a proper queue system with background processing
-- Add position tracking to waiting_list table
ALTER TABLE waiting_list ADD COLUMN IF NOT EXISTS position INTEGER;

-- Create a function to assign positions automatically
CREATE OR REPLACE FUNCTION assign_waiting_list_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the next position for this event
  SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position
  FROM waiting_list 
  WHERE event_id = NEW.event_id 
  AND status = 'waiting';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to assign positions
DROP TRIGGER IF EXISTS trigger_assign_position ON waiting_list;
CREATE TRIGGER trigger_assign_position
  BEFORE INSERT ON waiting_list
  FOR EACH ROW
  EXECUTE FUNCTION assign_waiting_list_position();

-- Create a table for ticket reservations with expiration
CREATE TABLE IF NOT EXISTS ticket_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_type_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  reserved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '20 minutes'),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'purchased', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on ticket_reservations
ALTER TABLE ticket_reservations ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket_reservations
CREATE POLICY "Users can view their own reservations" 
  ON ticket_reservations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations" 
  ON ticket_reservations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" 
  ON ticket_reservations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to expire old reservations (for cron job)
CREATE OR REPLACE FUNCTION expire_ticket_reservations()
RETURNS void AS $$
BEGIN
  UPDATE ticket_reservations 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'reserved' 
  AND expires_at < NOW();
  
  -- Also update waiting list entries that have expired offers
  UPDATE waiting_list 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'offered' 
  AND offer_expires_at IS NOT NULL 
  AND offer_expires_at < EXTRACT(EPOCH FROM NOW()) * 1000;
END;
$$ LANGUAGE plpgsql;

-- Function to process queue and offer tickets to next person
CREATE OR REPLACE FUNCTION process_ticket_queue()
RETURNS void AS $$
DECLARE
  next_user RECORD;
BEGIN
  -- First expire old reservations
  PERFORM expire_ticket_reservations();
  
  -- Find next person in queue for events that have available spots
  FOR next_user IN 
    SELECT DISTINCT ON (wl.event_id) 
      wl.id, wl.user_id, wl.event_id, wl.position
    FROM waiting_list wl
    INNER JOIN events e ON wl.event_id = e.id
    WHERE wl.status = 'waiting'
    AND NOT EXISTS (
      SELECT 1 FROM ticket_reservations tr 
      WHERE tr.event_id = wl.event_id 
      AND tr.status = 'reserved'
      AND tr.user_id = wl.user_id
    )
    ORDER BY wl.event_id, wl.position ASC
  LOOP
    -- Offer ticket to next person in queue
    UPDATE waiting_list 
    SET 
      status = 'offered',
      offer_expires_at = EXTRACT(EPOCH FROM (NOW() + INTERVAL '20 minutes')) * 1000,
      updated_at = NOW()
    WHERE id = next_user.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
