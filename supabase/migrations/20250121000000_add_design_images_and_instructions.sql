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
CREATE POLICY IF NOT EXISTS "Admins can view all designs"
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

