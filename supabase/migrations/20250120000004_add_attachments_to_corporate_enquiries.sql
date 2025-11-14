-- Add attachments field to corporate_enquiries table
-- This will store an array of file URLs (documents, images, logos, etc.)

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

