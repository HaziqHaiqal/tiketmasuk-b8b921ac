
-- Create a product_variants table to handle different sizes/options for products
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL, -- e.g., "Size", "Color"
  variant_value TEXT NOT NULL, -- e.g., "S", "M", "L", "Red", "Blue"
  price_adjustment NUMERIC DEFAULT 0, -- additional cost for this variant
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, variant_name, variant_value)
);

-- Enable RLS on product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create policy for product_variants (public read access since products are public)
CREATE POLICY "Anyone can view product variants" 
  ON public.product_variants 
  FOR SELECT 
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert T-shirt variants for the existing Tech Conference T-Shirt
INSERT INTO public.product_variants (product_id, variant_name, variant_value, stock_quantity) 
SELECT 
  id as product_id,
  'Size' as variant_name,
  size as variant_value,
  50 as stock_quantity
FROM public.products 
CROSS JOIN (VALUES ('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS sizes(size)
WHERE title = 'Tech Conference T-Shirt';

-- Add color variants for the T-shirt
INSERT INTO public.product_variants (product_id, variant_name, variant_value, stock_quantity) 
SELECT 
  id as product_id,
  'Color' as variant_name,
  color as variant_value,
  100 as stock_quantity
FROM public.products 
CROSS JOIN (VALUES ('Black'), ('Navy Blue'), ('White')) AS colors(color)
WHERE title = 'Tech Conference T-Shirt';
