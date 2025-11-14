-- ============================================
-- Create Super Admin User
-- ============================================
-- This script promotes an existing user to super admin
-- OR creates an admin profile for a user that will be created via Supabase Auth
--
-- INSTRUCTIONS:
-- 1. First, create a user account through the normal signup process at /auth/signup
-- 2. Then run this script, replacing 'YOUR_EMAIL@example.com' with the actual email
-- 3. The user will now have admin privileges
-- ============================================

-- Option 1: Promote existing user to admin by email
-- Replace 'YOUR_EMAIL@example.com' with the actual email address
DO $$
DECLARE
  user_id_to_promote uuid;
  user_email text := 'admin@infineight.house'; -- CHANGE THIS EMAIL
BEGIN
  -- Find user by email from auth.users
  SELECT id INTO user_id_to_promote
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id_to_promote IS NULL THEN
    RAISE EXCEPTION 'User with email % not found. Please create the user account first through /auth/signup', user_email;
  END IF;
  
  -- Ensure profile exists
  INSERT INTO profiles (
    id,
    email,
    full_name,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    user_id_to_promote,
    user_email,
    'Super Admin',
    true,
    now(),
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    is_admin = true,
    updated_at = now(),
    email = user_email;
  
  RAISE NOTICE 'User % has been promoted to Super Admin!', user_email;
END $$;

-- Option 2: Create a function to promote any user to admin (for future use)
-- This function can be called by existing admins to promote other users
CREATE OR REPLACE FUNCTION create_super_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id_to_promote uuid;
BEGIN
  -- Find user by email from auth.users
  SELECT id INTO user_id_to_promote
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id_to_promote IS NULL THEN
    RAISE EXCEPTION 'User with email % not found. Please create the user account first.', user_email;
  END IF;
  
  -- Ensure profile exists and set as admin
  INSERT INTO profiles (
    id,
    email,
    full_name,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    user_id_to_promote,
    user_email,
    COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = user_id_to_promote), 'Admin User'),
    true,
    now(),
    now()
  ) ON CONFLICT (id) DO UPDATE SET
    is_admin = true,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- Verify the admin was created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.is_admin,
  p.created_at
FROM profiles p
WHERE p.is_admin = true
ORDER BY p.created_at DESC;

