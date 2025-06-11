
-- Create a simplified bookings table that handles everything
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  booking_type TEXT NOT NULL CHECK (booking_type IN ('event', 'product', 'mixed')),
  
  -- Customer Information
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  
  -- Payment Information
  total_amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'toyyibpay',
  payment_reference TEXT, -- ToyyibPay bill code or other payment reference
  
  -- Booking Details (stored as JSONB for flexibility)
  booking_details JSONB NOT NULL DEFAULT '{}',
  -- Example structure:
  -- For events: {"event_id": "uuid", "event_name": "Event Name", "quantity": 2, "unit_price": 50.00}
  -- For products: {"items": [{"product_id": "uuid", "product_name": "Product", "quantity": 1, "unit_price": 25.00}]}
  -- For mixed: {"event": {...}, "products": [...]}
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anyone can create bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_reference ON public.bookings(payment_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON public.bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(payment_status);

-- Update tickets table to reference bookings
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id);
CREATE INDEX IF NOT EXISTS idx_tickets_booking_id ON public.tickets(booking_id);

-- Drop unnecessary tables (we'll keep the core ones and simplify)
DROP TABLE IF EXISTS public.event_purchases CASCADE;
DROP TABLE IF EXISTS public.product_orders CASCADE;
DROP TABLE IF EXISTS public.event_bookings CASCADE;
