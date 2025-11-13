-- Fix infinite recursion in profiles RLS policies
-- The issue: Admin policies query the profiles table, which triggers the same policies, causing infinite recursion

-- Drop the problematic admin policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create a SECURITY DEFINER function to check admin status without triggering RLS
-- This function bypasses RLS to check if a user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = check_user_id 
    AND is_admin = true
  );
END;
$$;

-- Recreate admin policies using the SECURITY DEFINER function
-- This avoids recursion because the function bypasses RLS
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    -- Users can always view their own profile
    auth.uid() = id
    OR
    -- Admins can view all profiles (using function that bypasses RLS)
    public.is_user_admin()
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    -- Users can update their own profile
    auth.uid() = id
    OR
    -- Admins can update all profiles (using function that bypasses RLS)
    public.is_user_admin()
  )
  WITH CHECK (
    -- Users can update their own profile
    auth.uid() = id
    OR
    -- Admins can update all profiles (using function that bypasses RLS)
    public.is_user_admin()
  );

-- Update the existing is_admin function to use SECURITY DEFINER as well
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND is_admin = true
  );
END;
$$;

