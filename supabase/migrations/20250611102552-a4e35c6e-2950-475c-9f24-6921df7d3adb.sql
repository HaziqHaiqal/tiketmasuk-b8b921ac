
-- Simplify the structure by adding variants and faqs as JSONB columns to existing tables

-- Add variants column to products table
ALTER TABLE public.products 
ADD COLUMN variants JSONB DEFAULT '{}';

-- Add faqs column to events table
ALTER TABLE public.events 
ADD COLUMN faqs JSONB DEFAULT '[]';

-- Drop the complex tables we don't need
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.event_faqs CASCADE;
DROP TABLE IF EXISTS public.event_images CASCADE;
DROP TABLE IF EXISTS public.ticket_tiers CASCADE;

-- Update the existing Tech Conference T-Shirt with variant data
UPDATE public.products 
SET variants = jsonb_build_object(
  'options', jsonb_build_object(
    'Size', jsonb_build_array('XS', 'S', 'M', 'L', 'XL', 'XXL'),
    'Color', jsonb_build_array('Black', 'Navy Blue', 'White', 'Red')
  ),
  'stock', jsonb_build_object(
    'XS-Black', 15, 'XS-Navy Blue', 12, 'XS-White', 10, 'XS-Red', 8,
    'S-Black', 20, 'S-Navy Blue', 18, 'S-White', 15, 'S-Red', 12,
    'M-Black', 25, 'M-Navy Blue', 22, 'M-White', 20, 'M-Red', 18,
    'L-Black', 20, 'L-Navy Blue', 18, 'L-White', 15, 'L-Red', 12,
    'XL-Black', 15, 'XL-Navy Blue', 12, 'XL-White', 10, 'XL-Red', 8,
    'XXL-Black', 10, 'XXL-Navy Blue', 8, 'XXL-White', 6, 'XXL-Red', 5
  ),
  'pricing', jsonb_build_object()
)
WHERE title = 'Tech Conference T-Shirt';

-- Add sample FAQs to the Tech Conference event
UPDATE public.events 
SET faqs = jsonb_build_array(
  jsonb_build_object(
    'question', 'What time does the conference start?',
    'answer', 'The conference starts at 9:00 AM and runs until 6:00 PM each day.'
  ),
  jsonb_build_object(
    'question', 'Is food provided?',
    'answer', 'Yes, lunch and coffee breaks are included in your ticket price.'
  ),
  jsonb_build_object(
    'question', 'What should I bring?',
    'answer', 'Just bring yourself and a notebook if you want to take notes. We will provide all materials.'
  ),
  jsonb_build_object(
    'question', 'Is there parking available?',
    'answer', 'Yes, free parking is available on-site. Please arrive early as spaces are limited.'
  )
)
WHERE name = 'Tech Conference 2024';
