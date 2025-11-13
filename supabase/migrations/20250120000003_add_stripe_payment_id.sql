-- Add stripe_payment_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_id ON orders(stripe_payment_id);

-- Add comment
COMMENT ON COLUMN orders.stripe_payment_id IS 'Stripe payment intent ID for tracking payments';


