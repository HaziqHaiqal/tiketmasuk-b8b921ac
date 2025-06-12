
-- Add category_code field to products table
ALTER TABLE public.products 
ADD COLUMN category_code TEXT;

-- Remove the is_required field we just added
ALTER TABLE public.products 
DROP COLUMN IF EXISTS is_required;

-- Update existing products with appropriate category codes
-- This is just an example - you can adjust these based on your needs
UPDATE public.products 
SET category_code = CASE 
  WHEN category LIKE '%T-Shirt%' OR category LIKE '%Merchandise%' THEN 'event-essential'
  ELSE 'optional-merchandise'
END;

-- Make category_code not null after setting default values
ALTER TABLE public.products 
ALTER COLUMN category_code SET NOT NULL;
