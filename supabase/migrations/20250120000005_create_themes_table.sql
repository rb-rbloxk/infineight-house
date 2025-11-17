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

