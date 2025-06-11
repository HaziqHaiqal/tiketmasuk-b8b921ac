
-- Create subscription tiers table
CREATE TABLE public.subscription_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '{}',
  max_promoted_events INTEGER DEFAULT 0,
  promotion_duration_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, price, features, max_promoted_events, promotion_duration_days) VALUES
('Free', 0.00, '{"basic_listing": true}', 0, 0),
('Bronze', 29.99, '{"basic_listing": true, "featured_placement": true}', 2, 30),
('Silver', 59.99, '{"basic_listing": true, "featured_placement": true, "priority_support": true}', 5, 30),
('Gold', 99.99, '{"basic_listing": true, "featured_placement": true, "priority_support": true, "analytics": true}', 10, 30);

-- Create vendor subscriptions table
CREATE TABLE public.vendor_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.subscription_tiers(id),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event promotions table
CREATE TABLE public.event_promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.vendor_subscriptions(id),
  promoted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_tiers (public read)
CREATE POLICY "Anyone can view subscription tiers" 
  ON public.subscription_tiers 
  FOR SELECT 
  USING (true);

-- RLS Policies for vendor_subscriptions
CREATE POLICY "Vendors can view their own subscriptions" 
  ON public.vendor_subscriptions 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Vendors can insert their own subscriptions" 
  ON public.vendor_subscriptions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Vendors can update their own subscriptions" 
  ON public.vendor_subscriptions 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- RLS Policies for event_promotions
CREATE POLICY "Anyone can view active promotions" 
  ON public.event_promotions 
  FOR SELECT 
  USING (is_active = true AND expires_at > now());

CREATE POLICY "Event owners can manage their promotions" 
  ON public.event_promotions 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_promotions.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_vendor_subscriptions_user_id ON public.vendor_subscriptions(user_id);
CREATE INDEX idx_vendor_subscriptions_status ON public.vendor_subscriptions(status);
CREATE INDEX idx_event_promotions_event_id ON public.event_promotions(event_id);
CREATE INDEX idx_event_promotions_active ON public.event_promotions(is_active, expires_at);

-- Create function to get promoted events
CREATE OR REPLACE FUNCTION get_promoted_events()
RETURNS TABLE (
  event_id UUID,
  event_name TEXT,
  event_description TEXT,
  event_date BIGINT,
  event_location TEXT,
  event_price NUMERIC,
  event_image TEXT,
  promotion_expires_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    e.id,
    e.name,
    e.description,
    e.event_date,
    e.location,
    e.price,
    e.image_storage_id,
    ep.expires_at
  FROM public.events e
  INNER JOIN public.event_promotions ep ON e.id = ep.event_id
  WHERE ep.is_active = true 
    AND ep.expires_at > now()
    AND e.is_cancelled = false
  ORDER BY ep.promoted_at DESC;
$$;

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_subscriptions_updated_at 
  BEFORE UPDATE ON public.vendor_subscriptions 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
