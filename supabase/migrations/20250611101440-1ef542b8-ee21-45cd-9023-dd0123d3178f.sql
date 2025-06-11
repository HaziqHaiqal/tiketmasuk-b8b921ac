
-- Remove the purchases table as it's redundant with bookings
DROP TABLE IF EXISTS public.purchases;

-- Recreate product_variants with a more flexible structure
DROP TABLE IF EXISTS public.product_variants;

CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_combination JSONB NOT NULL, -- e.g., {"Size": "M", "Color": "Red"}
  price_adjustment NUMERIC DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT, -- unique product variant identifier
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create policy for product_variants (public read access)
CREATE POLICY "Anyone can view product variants" 
  ON public.product_variants 
  FOR SELECT 
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create ticket_tiers table for different ticket types (early bird, etc.)
CREATE TABLE public.ticket_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Super Early Bird", "Early Bird", "Regular"
  price NUMERIC NOT NULL,
  description TEXT,
  total_tickets INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  sale_start_date TIMESTAMP WITH TIME ZONE,
  sale_end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on ticket_tiers
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;

-- Create policy for ticket_tiers (public read access)
CREATE POLICY "Anyone can view ticket tiers" 
  ON public.ticket_tiers 
  FOR SELECT 
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_ticket_tiers_updated_at
  BEFORE UPDATE ON public.ticket_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add event_images table for multiple images
CREATE TABLE public.event_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on event_images
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;

-- Create policy for event_images (public read access)
CREATE POLICY "Anyone can view event images" 
  ON public.event_images 
  FOR SELECT 
  USING (true);

-- Add event_faqs table
CREATE TABLE public.event_faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on event_faqs
ALTER TABLE public.event_faqs ENABLE ROW LEVEL SECURITY;

-- Create policy for event_faqs (public read access)
CREATE POLICY "Anyone can view event FAQs" 
  ON public.event_faqs 
  FOR SELECT 
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_event_faqs_updated_at
  BEFORE UPDATE ON public.event_faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for the Tech Conference event
-- First, let's add ticket tiers
INSERT INTO public.ticket_tiers (event_id, name, price, description, total_tickets, sale_start_date, sale_end_date)
SELECT 
  id,
  'Super Early Bird',
  price * 0.7, -- 30% discount
  'Limited time offer with maximum savings',
  50,
  now() - interval '30 days',
  now() + interval '30 days'
FROM public.events 
WHERE name = 'Tech Conference 2024';

INSERT INTO public.ticket_tiers (event_id, name, price, description, total_tickets, sale_start_date, sale_end_date)
SELECT 
  id,
  'Early Bird',
  price * 0.85, -- 15% discount
  'Early access with great savings',
  100,
  now() - interval '15 days',
  now() + interval '60 days'
FROM public.events 
WHERE name = 'Tech Conference 2024';

INSERT INTO public.ticket_tiers (event_id, name, price, description, total_tickets, sale_start_date, sale_end_date)
SELECT 
  id,
  'Regular',
  price, -- full price
  'Standard ticket pricing',
  200,
  now(),
  now() + interval '90 days'
FROM public.events 
WHERE name = 'Tech Conference 2024';

-- Add product variants with flexible structure
INSERT INTO public.product_variants (product_id, variant_combination, stock_quantity, sku)
SELECT 
  p.id,
  jsonb_build_object('Size', size.value, 'Color', color.value),
  20,
  'TECH-TSHIRT-' || UPPER(SUBSTRING(size.value FROM 1 FOR 1)) || '-' || UPPER(SUBSTRING(color.value FROM 1 FOR 3))
FROM public.products p
CROSS JOIN (VALUES ('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS size(value)
CROSS JOIN (VALUES ('Black'), ('Navy Blue'), ('White'), ('Red')) AS color(value)
WHERE p.title = 'Tech Conference T-Shirt';
