
-- Update ticket_reservations table to better handle multiple tickets
ALTER TABLE ticket_reservations 
ADD COLUMN ticket_details JSONB DEFAULT '[]'::jsonb;

-- Create a table for individual ticket holders
CREATE TABLE IF NOT EXISTS ticket_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES ticket_reservations(id) ON DELETE CASCADE,
  ticket_number TEXT UNIQUE NOT NULL DEFAULT generate_ticket_number(),
  holder_name TEXT NOT NULL,
  holder_email TEXT NOT NULL,
  holder_phone TEXT,
  holder_ic_passport TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on ticket_holders
ALTER TABLE ticket_holders ENABLE ROW LEVEL SECURITY;

-- Create policies for ticket_holders
CREATE POLICY "Users can view ticket holders for their reservations" 
  ON ticket_holders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM ticket_reservations tr 
      WHERE tr.id = ticket_holders.reservation_id 
      AND tr.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ticket holders for their reservations" 
  ON ticket_holders 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ticket_reservations tr 
      WHERE tr.id = ticket_holders.reservation_id 
      AND tr.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ticket holders for their reservations" 
  ON ticket_holders 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM ticket_reservations tr 
      WHERE tr.id = ticket_holders.reservation_id 
      AND tr.user_id = auth.uid()
    )
  );

-- Update waiting list to track queue position in real-time
CREATE OR REPLACE FUNCTION get_queue_stats(event_uuid UUID)
RETURNS TABLE(
  total_waiting INTEGER,
  current_position INTEGER,
  user_in_queue BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_waiting,
    COALESCE((
      SELECT position 
      FROM waiting_list 
      WHERE event_id = event_uuid 
      AND user_id = auth.uid() 
      AND status = 'waiting'
    ), 0)::INTEGER as current_position,
    EXISTS(
      SELECT 1 
      FROM waiting_list 
      WHERE event_id = event_uuid 
      AND user_id = auth.uid() 
      AND status IN ('waiting', 'offered')
    ) as user_in_queue
  FROM waiting_list 
  WHERE event_id = event_uuid 
  AND status = 'waiting';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel reservation and update queue
CREATE OR REPLACE FUNCTION cancel_reservation(reservation_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  reservation_record RECORD;
BEGIN
  -- Get reservation details
  SELECT * INTO reservation_record 
  FROM ticket_reservations 
  WHERE id = reservation_uuid 
  AND user_id = auth.uid()
  AND status = 'reserved';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update reservation status
  UPDATE ticket_reservations 
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = reservation_uuid;
  
  -- Remove from waiting list if exists
  UPDATE waiting_list 
  SET status = 'cancelled', updated_at = NOW()
  WHERE event_id = reservation_record.event_id 
  AND user_id = auth.uid()
  AND status IN ('waiting', 'offered');
  
  -- Process next person in queue
  PERFORM process_ticket_queue();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
