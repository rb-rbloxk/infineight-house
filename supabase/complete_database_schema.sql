/*
  # Infineight Complete Database Schema
  This file contains the complete database setup including all tables, migrations, and configurations.
  Run this file in Supabase SQL Editor to set up the entire database.
  
  IMPORTANT: Run this file in order. If you encounter errors, check if tables already exist.
*/

-- ============================================
-- 1. MAIN SCHEMA - Core Tables
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  base_image_url text,
  available_colors jsonb DEFAULT '[]'::jsonb,
  available_sizes jsonb DEFAULT '["S","M","L","XL","XXL"]'::jsonb,
  is_customizable boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Create designs table
CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  design_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_url text,
  is_saved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own designs"
  ON designs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own designs"
  ON designs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs"
  ON designs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own designs"
  ON designs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL,
  shipping_address jsonb NOT NULL,
  payment_status text DEFAULT 'pending',
  payment_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  design_id uuid REFERENCES designs(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  size text,
  color text,
  customization_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  design_id uuid REFERENCES designs(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  size text,
  color text,
  customization_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create corporate_enquiries table
CREATE TABLE IF NOT EXISTS corporate_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  product_interest text,
  quantity integer,
  budget_range text,
  logo_url text,
  message text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE corporate_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit enquiry"
  ON corporate_enquiries FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all enquiries"
  ON corporate_enquiries FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can update enquiries"
  ON corporate_enquiries FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL,
  discount_value decimal(10,2) NOT NULL,
  min_order_amount decimal(10,2) DEFAULT 0,
  max_uses integer,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  TO authenticated, anon
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============================================
-- 2. ADD MULTIPLE IMAGES TO PRODUCTS
-- ============================================

-- Add image_urls column to products table for multiple images support
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing products to have their base_image_url in the image_urls array
UPDATE products 
SET image_urls = ARRAY[base_image_url] 
WHERE base_image_url IS NOT NULL AND base_image_url != '' AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);

-- Set default value for products without images
UPDATE products 
SET image_urls = ARRAY['/images/products/placeholder.png'] 
WHERE image_urls IS NULL OR array_length(image_urls, 1) IS NULL;

-- Add comment to the column
COMMENT ON COLUMN products.image_urls IS 'Array of image URLs for the product. First image is typically the primary image.';

-- ============================================
-- 3. CREATE WISHLIST TABLE
-- ============================================

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id) -- Prevent duplicate wishlist entries
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist"
  ON wishlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add items to their own wishlist
CREATE POLICY "Users can add to own wishlist"
  ON wishlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove items from their own wishlist
CREATE POLICY "Users can remove from own wishlist"
  ON wishlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all wishlist items
CREATE POLICY "Admins can view all wishlist items"
  ON wishlist FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- ============================================
-- 4. CREATE ADDRESSES TABLE
-- ============================================

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_addresses_created_at ON addresses(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own addresses
CREATE POLICY "Users can view own addresses" ON addresses
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own addresses
CREATE POLICY "Users can insert own addresses" ON addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own addresses
CREATE POLICY "Users can update own addresses" ON addresses
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own addresses
CREATE POLICY "Users can delete own addresses" ON addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Add constraint to ensure only one default address per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_user_default 
ON addresses(user_id) 
WHERE is_default = TRUE;

-- Add check constraint for phone number format (basic validation)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_phone_format'
    ) THEN
        ALTER TABLE addresses ADD CONSTRAINT check_phone_format 
        CHECK (phone ~ '^[+]?[0-9\s\-\(\)]{10,15}$');
    END IF;
END $$;

-- Add check constraint for pincode format (Indian pincode)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_pincode_format'
    ) THEN
        ALTER TABLE addresses ADD CONSTRAINT check_pincode_format 
        CHECK (pincode ~ '^[0-9]{6}$');
    END IF;
END $$;

-- Add comments
COMMENT ON TABLE addresses IS 'User address management table for shipping addresses';
COMMENT ON COLUMN addresses.user_id IS 'Reference to auth.users table';
COMMENT ON COLUMN addresses.is_default IS 'Indicates if this is the default shipping address for the user';
COMMENT ON COLUMN addresses.pincode IS 'Indian postal code (6 digits)';

-- ============================================
-- 5. ADD STRIPE PAYMENT ID
-- ============================================

-- Add stripe_payment_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_id ON orders(stripe_payment_id);

-- Add comment
COMMENT ON COLUMN orders.stripe_payment_id IS 'Stripe payment intent ID for tracking payments';

-- ============================================
-- 6. ADD ATTACHMENTS TO CORPORATE ENQUIRIES
-- ============================================

-- Add attachments field to corporate_enquiries table
ALTER TABLE corporate_enquiries 
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Add user_id field if it doesn't exist (for tracking who submitted)
ALTER TABLE corporate_enquiries 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Add event_date field if it doesn't exist (for bulk calculator)
ALTER TABLE corporate_enquiries 
ADD COLUMN IF NOT EXISTS event_date date;

-- Add order_details field if it doesn't exist (for bulk calculator order details)
ALTER TABLE corporate_enquiries 
ADD COLUMN IF NOT EXISTS order_details jsonb;

-- Add requirements field if it doesn't exist (for additional requirements)
ALTER TABLE corporate_enquiries 
ADD COLUMN IF NOT EXISTS requirements text;

-- Create index on attachments for better query performance
CREATE INDEX IF NOT EXISTS idx_corporate_enquiries_attachments 
ON corporate_enquiries USING GIN (attachments);

-- Update RLS policy to allow users to view their own enquiries
DROP POLICY IF EXISTS "Users can view own enquiries" ON corporate_enquiries;
CREATE POLICY "Users can view own enquiries"
  ON corporate_enquiries FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- 7. CREATE THEMES TABLE
-- ============================================

-- Create themes table for dynamic sub-categories under "Theme based"
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  parent_category text DEFAULT 'Theme based',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- Optional: for time-limited themes (events, movies, etc.)
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Add theme_id to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS theme_id uuid REFERENCES themes(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_theme_id ON products(theme_id);
CREATE INDEX IF NOT EXISTS idx_themes_is_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_parent_category ON themes(parent_category);

-- Enable RLS on themes table
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Anyone can view active themes
CREATE POLICY "Anyone can view active themes"
  ON themes FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Admins can manage all themes
CREATE POLICY "Admins can manage themes"
  ON themes FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on themes
DROP TRIGGER IF EXISTS update_themes_updated_at ON themes;
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW
  EXECUTE FUNCTION update_themes_updated_at();

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_theme_slug(theme_name text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(theme_name, '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. ADD DESIGN IMAGES AND INSTRUCTIONS
-- ============================================

-- Add fields to designs table for client instructions and image URLs
ALTER TABLE designs 
ADD COLUMN IF NOT EXISTS client_instructions TEXT,
ADD COLUMN IF NOT EXISTS png_image_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_image_url TEXT;

-- Add comments to the new columns
COMMENT ON COLUMN designs.client_instructions IS 'Instructions or notes provided by the client for the design';
COMMENT ON COLUMN designs.png_image_url IS 'URL to the PNG image of the design';
COMMENT ON COLUMN designs.pdf_image_url IS 'URL to the PDF image of the design';

-- Update RLS policies to allow admins to view all designs
DROP POLICY IF EXISTS "Admins can view all designs" ON designs;
CREATE POLICY "Admins can view all designs"
  ON designs FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- ============================================
-- 9. FUNCTIONS AND TRIGGERS
-- ============================================

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'HS' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_designs_updated_at ON designs;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. ADMIN FUNCTIONS AND POLICIES
-- ============================================

-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic admin policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create a SECURITY DEFINER function to check admin status without triggering RLS
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
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR
    public.is_user_admin()
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR
    public.is_user_admin()
  )
  WITH CHECK (
    auth.uid() = id
    OR
    public.is_user_admin()
  );

-- Create function to check if user is admin
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

-- Create function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  UPDATE profiles 
  SET is_admin = true, updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to demote admin
CREATE OR REPLACE FUNCTION demote_from_admin(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself.';
  END IF;
  
  UPDATE profiles 
  SET is_admin = false, updated_at = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create super admin by email
CREATE OR REPLACE FUNCTION create_super_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id_to_promote uuid;
BEGIN
  SELECT id INTO user_id_to_promote
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id_to_promote IS NULL THEN
    RAISE EXCEPTION 'User with email % not found. Please create the user account first.', user_email;
  END IF;
  
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

-- ============================================
-- 11. STORAGE SETUP
-- ============================================

-- Create storage bucket for corporate enquiries
INSERT INTO storage.buckets (id, name, public)
VALUES ('corporate-uploads', 'corporate-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'corporate-uploads' AND
  (storage.foldername(name))[1] = 'corporate-enquiries'
);

-- Create policy to allow public read access
DROP POLICY IF EXISTS "Public can view uploaded files" ON storage.objects;
CREATE POLICY "Public can view uploaded files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'corporate-uploads');

-- Create policy to allow users to delete their own uploads
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'corporate-uploads' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Create policy to allow admins to manage all files
DROP POLICY IF EXISTS "Admins can manage all files" ON storage.objects;
CREATE POLICY "Admins can manage all files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'corporate-uploads' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  bucket_id = 'corporate-uploads' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Create storage bucket for design images
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-images', 'design-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload design images
DROP POLICY IF EXISTS "Authenticated users can upload design images" ON storage.objects;
CREATE POLICY "Authenticated users can upload design images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-images' AND
  (storage.foldername(name))[1] = 'designs'
);

-- Create policy to allow public read access to design images
DROP POLICY IF EXISTS "Public can view design images" ON storage.objects;
CREATE POLICY "Public can view design images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'design-images');

-- Create policy to allow users to delete their own design images
DROP POLICY IF EXISTS "Users can delete their own design images" ON storage.objects;
CREATE POLICY "Users can delete their own design images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'design-images' AND
  (
    auth.uid()::text = (storage.foldername(name))[2] OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  )
);

-- Create policy to allow admins to manage all design images
DROP POLICY IF EXISTS "Admins can manage all design images" ON storage.objects;
CREATE POLICY "Admins can manage all design images"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'design-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  bucket_id = 'design-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- ============================================
-- COMPLETE!
-- ============================================
-- 
-- Next Steps:
-- 1. Create a user account through /auth/signup
-- 2. Run the create_super_admin function to promote a user to admin:
--    SELECT create_super_admin('your-email@example.com');
-- 
-- Or use the Node.js script:
--    node scripts/create-super-admin.js email@example.com password "Admin Name"
-- ============================================

