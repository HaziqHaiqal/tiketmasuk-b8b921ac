
-- First, let's add missing columns to the tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS ticket_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create an index for ticket numbers
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON public.tickets(ticket_number);

-- Update the purchases table to better track payment details
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS bill_code TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'toyyibpay';

-- Create a proper event_purchases table to track event ticket purchases specifically
CREATE TABLE IF NOT EXISTS public.event_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_id UUID NOT NULL REFERENCES public.events(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  bill_code TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'toyyibpay',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_purchases
ALTER TABLE public.event_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event_purchases
CREATE POLICY "Users can view their own event purchases" 
  ON public.event_purchases 
  FOR SELECT 
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can create event purchases" 
  ON public.event_purchases 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update event purchases" 
  ON public.event_purchases 
  FOR UPDATE 
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_purchases_user_id ON public.event_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_event_purchases_event_id ON public.event_purchases(event_id);
CREATE INDEX IF NOT EXISTS idx_event_purchases_bill_code ON public.event_purchases(bill_code);

-- Update the events table to use proper UUID format (the current mock data uses simple strings)
-- We'll need to handle this in the application code since we can't easily convert existing data
