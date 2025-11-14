-- ============================================
-- Supabase Storage Setup for Design Images
-- ============================================
-- Run this SQL in your Supabase SQL Editor to set up the storage bucket
-- ============================================

-- Create storage bucket for design images
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-images', 'design-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload design images
CREATE POLICY "Authenticated users can upload design images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-images' AND
  (storage.foldername(name))[1] = 'designs'
);

-- Create policy to allow public read access to design images
CREATE POLICY "Public can view design images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'design-images');

-- Create policy to allow users to delete their own design images
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

