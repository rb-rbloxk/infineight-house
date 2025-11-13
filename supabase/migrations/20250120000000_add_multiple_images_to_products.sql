-- Add image_urls column to products table for multiple images support
ALTER TABLE products 
ADD COLUMN image_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing products to have their base_image_url in the image_urls array
UPDATE products 
SET image_urls = ARRAY[base_image_url] 
WHERE base_image_url IS NOT NULL AND base_image_url != '';

-- Set default value for products without images
UPDATE products 
SET image_urls = ARRAY['/images/products/placeholder.png'] 
WHERE image_urls IS NULL OR array_length(image_urls, 1) IS NULL;

-- Add comment to the column
COMMENT ON COLUMN products.image_urls IS 'Array of image URLs for the product. First image is typically the primary image.';

