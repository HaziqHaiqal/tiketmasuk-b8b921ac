
-- Remove the redundant tickets table since we're using bookings now
DROP TABLE IF EXISTS public.tickets CASCADE;

-- Add a test product for Tech Conference 2024
INSERT INTO public.products (
  title,
  description,
  price,
  original_price,
  category,
  vendor_id,
  event_id,
  in_stock,
  image
) VALUES (
  'Tech Conference 2024 - VIP Package',
  'VIP package includes priority seating, networking lunch, and conference materials',
  299.00,
  399.00,
  'Event Packages',
  '68b326dc-025d-4996-95be-57166a801c33',
  '4d3ba5ca-bc44-4da3-826a-6731b2a0463c',
  true,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500'
);

-- Add another test product
INSERT INTO public.products (
  title,
  description,
  price,
  category,
  vendor_id,
  event_id,
  in_stock,
  image
) VALUES (
  'Tech Conference T-Shirt',
  'Official Tech Conference 2024 commemorative t-shirt',
  45.00,
  'Merchandise',
  '68b326dc-025d-4996-95be-57166a801c33',
  '4d3ba5ca-bc44-4da3-826a-6731b2a0463c',
  true,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
);
