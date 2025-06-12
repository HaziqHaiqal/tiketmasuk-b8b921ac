
-- Drop the UUID version of join_waiting_list function to resolve overload conflict
DROP FUNCTION IF EXISTS public.join_waiting_list(uuid, uuid);

-- Keep only the text version which handles both authenticated and guest users
-- The existing join_waiting_list(uuid, text) function should remain
