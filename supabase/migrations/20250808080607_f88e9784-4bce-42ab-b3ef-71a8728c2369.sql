-- Create a function to get admin user ID
CREATE OR REPLACE FUNCTION public.get_admin_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin' 
  LIMIT 1;
$$;