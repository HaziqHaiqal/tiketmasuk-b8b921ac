
-- Create a table to store ticket holder information for each ticket
CREATE TABLE IF NOT EXISTS public.ticket_holders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id),
  ticket_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  ic_passport TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Malaysia',
  state TEXT NOT NULL,
  address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for ticket_holders
ALTER TABLE public.ticket_holders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ticket holders" 
  ON public.ticket_holders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = ticket_holders.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ticket holders for their bookings" 
  ON public.ticket_holders 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = ticket_holders.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own ticket holders" 
  ON public.ticket_holders 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = ticket_holders.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER update_ticket_holders_updated_at 
  BEFORE UPDATE ON public.ticket_holders 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
