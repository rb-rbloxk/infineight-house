-- Migration: Create addresses table for user address management
-- Created: 2025-01-20
-- Description: Adds addresses table to support user address management functionality

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

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_addresses_updated_at 
    BEFORE UPDATE ON addresses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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
ALTER TABLE addresses ADD CONSTRAINT check_phone_format 
CHECK (phone ~ '^[+]?[0-9\s\-\(\)]{10,15}$');

-- Add check constraint for pincode format (Indian pincode)
ALTER TABLE addresses ADD CONSTRAINT check_pincode_format 
CHECK (pincode ~ '^[0-9]{6}$');

-- Add check constraint for required fields
ALTER TABLE addresses ADD CONSTRAINT check_required_fields 
CHECK (
    LENGTH(TRIM(full_name)) > 0 AND
    LENGTH(TRIM(phone)) > 0 AND
    LENGTH(TRIM(address)) > 0 AND
    LENGTH(TRIM(city)) > 0 AND
    LENGTH(TRIM(state)) > 0 AND
    LENGTH(TRIM(pincode)) > 0
);

-- Insert some sample data for testing (optional - remove in production)
-- INSERT INTO addresses (user_id, full_name, phone, address, city, state, pincode, is_default)
-- VALUES 
--     ('your-user-id-here', 'John Doe', '+91 9876543210', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', TRUE),
--     ('your-user-id-here', 'Jane Smith', '+91 9876543211', '456 Oak Avenue', 'Delhi', 'Delhi', '110001', FALSE);

-- Add comment to table
COMMENT ON TABLE addresses IS 'User address management table for shipping addresses';
COMMENT ON COLUMN addresses.user_id IS 'Reference to auth.users table';
COMMENT ON COLUMN addresses.is_default IS 'Indicates if this is the default shipping address for the user';
COMMENT ON COLUMN addresses.pincode IS 'Indian postal code (6 digits)';

