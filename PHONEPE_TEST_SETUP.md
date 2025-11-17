# PhonePe Payment Gateway - Test Mode Setup

This guide will help you set up PhonePe payment gateway in test mode for local development.

## Test Credentials

Based on your PhonePe dashboard, use these test credentials:

```
Client Id: M23Q4F7ZCO112_2511172039
Client Secret: ZjE4ZDYwZWUtMDkwMy00NDAzLThkN21tM2Q3YjAxZmViZjQ3
Client Version: 1
```

## Environment Variables Setup

Add the following to your `.env.local` file:

```env
# PhonePe Configuration (Test Mode)
PHONEPE_MERCHANT_ID=M23Q4F7ZCO112_2511172039
PHONEPE_SALT_KEY=ZjE4ZDYwZWUtMDkwMy00NDAzLThkN21tM2Q3YjAxZmViZjQ3
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

## Mapping PhonePe Credentials

- **Client Id** → `PHONEPE_MERCHANT_ID`
- **Client Secret** → `PHONEPE_SALT_KEY`
- **Client Version** → `PHONEPE_SALT_INDEX`
- **Test URL** → `PHONEPE_BASE_URL` (for test mode)

## Setup Steps

1. **Open your `.env.local` file** (create it if it doesn't exist in the root directory)

2. **Add the PhonePe test credentials** as shown above

3. **Set the callback URL** in PhonePe Dashboard:
   - Go to PhonePe Merchant Dashboard
   - Navigate to Settings → Webhooks/Callbacks
   - Set callback URL to: `http://localhost:3000/api/payments/phonepe/callback`
   - For production, use: `https://yourdomain.com/api/payments/phonepe/callback`

4. **Restart your development server**:
   ```bash
   npm run dev
   ```

## Testing

1. Go to the checkout page
2. Select PhonePe as the payment method
3. Complete a test transaction using PhonePe's test credentials

## Test Payment Methods

PhonePe provides test payment methods in their sandbox:
- Test UPI IDs
- Test card numbers
- Test wallets

Check your PhonePe dashboard for the complete list of test payment methods.

## Production Setup

When moving to production:

1. Get production credentials from PhonePe
2. Update `.env.local` (or production environment variables):
   ```env
   PHONEPE_MERCHANT_ID=your_production_merchant_id
   PHONEPE_SALT_KEY=your_production_salt_key
   PHONEPE_SALT_INDEX=1
   PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
   ```

3. Update callback URL in PhonePe dashboard to your production domain

## Troubleshooting

- **Error: Invalid Merchant ID**: Check that `PHONEPE_MERCHANT_ID` matches your Client Id exactly
- **Error: Invalid Signature**: Verify that `PHONEPE_SALT_KEY` matches your Client Secret exactly
- **Error: API endpoint not found**: Ensure `PHONEPE_BASE_URL` is set to the sandbox URL for testing

## Support

For PhonePe API issues, refer to:
- PhonePe Developer Documentation: https://developer.phonepe.com/
- PhonePe Merchant Dashboard: https://merchant.phonepe.com/

