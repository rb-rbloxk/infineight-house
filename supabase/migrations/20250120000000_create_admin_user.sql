-- Create admin user in Supabase
-- Run this SQL in your Supabase SQL Editor

-- First, create the admin user in auth.users (this would normally be done through Supabase Auth)
-- For demo purposes, we'll create a profile entry that references a real user ID
-- You'll need to replace 'your-admin-user-id' with the actual UUID from auth.users

-- Create admin profile (replace with actual user ID from auth.users)
INSERT INTO profiles (
  id,
  email,
  full_name,
  phone,
  is_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual admin user ID
  'admin@Infineight.house',
  'Admin User',
  '+1 (555) 123-4567',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  updated_at = now();

-- Create additional admin policies for better security
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to promote user to admin (only existing admins can use this)
CREATE OR REPLACE FUNCTION promote_to_admin(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Update target user to admin
  UPDATE profiles 
  SET is_admin = true, updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to demote admin (only existing admins can use this)
CREATE OR REPLACE FUNCTION demote_from_admin(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Prevent demoting yourself
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself.';
  END IF;
  
  -- Update target user to non-admin
  UPDATE profiles 
  SET is_admin = false, updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

