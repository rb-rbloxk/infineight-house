-- ============================================
-- Supabase Storage Setup for Corporate Uploads
-- ============================================
-- Run this SQL in your Supabase SQL Editor to set up the storage bucket
-- ============================================

-- Create storage bucket for corporate enquiries
INSERT INTO storage.buckets (id, name, public)
VALUES ('corporate-uploads', 'corporate-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'corporate-uploads' AND
  (storage.foldername(name))[1] = 'corporate-enquiries'
);

-- Create policy to allow public read access
CREATE POLICY "Public can view uploaded files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'corporate-uploads');

-- Create policy to allow users to delete their own uploads (optional)
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'corporate-uploads' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Create policy to allow admins to manage all files
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

