# Payment Gateways Setup Guide

This guide explains how to set up Razorpay, PhonePe, and Stripe payment gateways for the Infineight e-commerce platform.

## Environment Variables

Add the following environment variables to your `.env.local` file:

### Razorpay Configuration

```env
# Razorpay API Keys (Get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### PhonePe Configuration

```env
# PhonePe API Credentials (Get from PhonePe Merchant Dashboard)
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
```

**Note:** For testing, use the sandbox URL:
```env
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

### Stripe Configuration (Already configured)

```env
# Stripe API Keys (Get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## Setup Instructions

### 1. Razorpay Setup

1. **Create a Razorpay Account**
   - Go to https://razorpay.com/
   - Sign up for a merchant account
   - Complete KYC verification

2. **Get API Keys**
   - Navigate to Dashboard → Settings → API Keys
   - Generate Test/Live keys
   - Copy `Key ID` and `Key Secret`

3. **Configure Webhooks (Optional but Recommended)**
   - Go to Dashboard → Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payments/razorpay/webhook`
   - Select events: `payment.captured`, `payment.failed`

4. **Add Environment Variables**
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```

### 2. PhonePe Setup

1. **Create a PhonePe Account**
   - Go to https://merchant.phonepe.com/
   - Sign up for a merchant account
   - Complete business verification

2. **Get API Credentials**
   - Navigate to Settings → API Credentials
   - Copy `Merchant ID`, `Salt Key`, and `Salt Index`

3. **Configure Callback URL**
   - Set callback URL in PhonePe dashboard: `https://yourdomain.com/api/payments/phonepe/callback`
   - This URL will receive payment status updates

4. **Add Environment Variables**
   ```env
   PHONEPE_MERCHANT_ID=PGTESTPAYUAT
   PHONEPE_SALT_KEY=your_salt_key
   PHONEPE_SALT_INDEX=1
   ```

5. **Test Mode**
   - For testing, use PhonePe's sandbox environment
   - Test credentials are provided in the PhonePe dashboard
   - Use test UPI IDs and cards provided by PhonePe

### 3. Stripe Setup (Already Configured)

1. **Create a Stripe Account**
   - Go to https://stripe.com/
   - Sign up and complete account setup

2. **Get API Keys**
   - Navigate to Developers → API Keys
   - Copy `Publishable key` and `Secret key`

3. **Configure Webhooks**
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.payment_failed`

4. **Add Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## Testing

### Razorpay Test Cards

- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### PhonePe Test Mode

- Use test UPI IDs provided in PhonePe dashboard
- Use test cards: 4111 1111 1111 1111
- All test transactions will be in sandbox mode

### Stripe Test Cards

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

## Payment Flow

### Razorpay Flow

1. User selects Razorpay as payment method
2. System creates Razorpay order via `/api/payments/razorpay/create-order`
3. Razorpay checkout modal opens
4. User completes payment
5. Payment is verified via `/api/payments/razorpay/verify`
6. Order status updated in database
7. User redirected to success page

### PhonePe Flow

1. User selects PhonePe as payment method
2. System creates payment link via `/api/payments/phonepe/create-payment`
3. User redirected to PhonePe payment page
4. User completes payment
5. PhonePe sends callback to `/api/payments/phonepe/callback`
6. Order status updated in database
7. User redirected to success page

### Stripe Flow

1. User selects Stripe as payment method
2. System creates checkout session via `/api/create-checkout-session`
3. User redirected to Stripe checkout page
4. User completes payment
5. Stripe sends webhook to `/api/webhooks/stripe`
6. Order status updated in database
7. User redirected to success page

## API Routes

### Razorpay

- `POST /api/payments/razorpay/create-order` - Create Razorpay order
- `POST /api/payments/razorpay/verify` - Verify payment signature

### PhonePe

- `POST /api/payments/phonepe/create-payment` - Create payment link
- `POST /api/payments/phonepe/callback` - Handle payment callback
- `GET /api/payments/phonepe/callback` - Check payment status

### Stripe

- `POST /api/create-checkout-session` - Create checkout session
- `POST /api/webhooks/stripe` - Handle webhook events

## Troubleshooting

### Razorpay Issues

- **Modal not opening:** Check if Razorpay script is loaded
- **Payment verification fails:** Verify signature calculation
- **Order not found:** Check order ID mapping

### PhonePe Issues

- **Payment link not generated:** Verify merchant ID and salt key
- **Callback not received:** Check callback URL configuration
- **Signature verification fails:** Verify salt key and index

### Stripe Issues

- **Checkout session fails:** Verify API keys
- **Webhook not received:** Check webhook URL and secret
- **Payment not updating:** Verify webhook event handling

## Security Notes

1. **Never commit API keys to version control**
2. **Use environment variables for all sensitive data**
3. **Always verify payment signatures on the server**
4. **Use HTTPS for all payment-related endpoints**
5. **Implement rate limiting on payment endpoints**
6. **Log all payment transactions for audit**

## Support

For issues or questions:
- Razorpay: https://razorpay.com/support/
- PhonePe: https://merchant.phonepe.com/support
- Stripe: https://support.stripe.com/

