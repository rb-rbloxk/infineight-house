# Local Development Setup Guide

This guide will help you set up the Infineight project for local development.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account and project
- Git installed

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd infineight-house
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
# Copy the example file
cp .env.local.example .env.local
```

### 4. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 5. Configure Supabase for Localhost

#### A. Add Localhost URLs

1. Go to **Authentication** → **URL Configuration**
2. Add to **Site URL**: `http://localhost:3000`
3. Add to **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**` (wildcard for all routes)

#### B. Configure Email Provider (Optional)

1. Go to **Authentication** → **Providers** → **Email**
2. For local development, you can disable "Confirm email" to test faster
3. Or use Supabase's built-in email service (limited to 3 emails/hour)

### 6. Update .env.local

Open `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site URL (localhost for local dev)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PhonePe (Test Mode - get from https://merchant.phonepe.com/)
PHONEPE_MERCHANT_ID=M23Q4F7ZCO112_2511172039
PHONEPE_SALT_KEY=ZjE4ZDYwZWUtMDkwMy00NDAzLThkN21tM2Q3YjAxZmViZjQ3
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

### 7. Run Database Migrations

If you have database migrations, run them in Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run the migration files from `supabase/migrations/` in order:
   - `20250120000000_*.sql`
   - `20250120000001_*.sql`
   - `20250120000002_*.sql`
   - etc.

### 8. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Testing Locally

### Test Authentication

1. Go to `http://localhost:3000/auth/signup`
2. Create a test account
3. Check Supabase Dashboard → **Authentication** → **Users** to see the new user

### Test Admin Access

1. Create an admin user using the script:
   ```bash
   node scripts/create-super-admin.js admin@test.com password123 "Admin User"
   ```
2. Log in with the admin credentials
3. Access admin dashboard at `http://localhost:3000/admin`

### Test Products

1. Log in as admin
2. Go to Admin Dashboard → Products
3. Create a test product
4. View it on the shop page

## Troubleshooting

### Issue: "Supabase not configured" error

**Solution:** Make sure `.env.local` exists and has correct values. Restart the dev server after creating/updating `.env.local`.

### Issue: Authentication redirects not working

**Solution:** 
- Check that `http://localhost:3000/auth/callback` is added to Supabase Redirect URLs
- Verify `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env.local`

### Issue: CORS errors

**Solution:** 
- Make sure your Supabase project allows requests from `http://localhost:3000`
- Check Supabase Dashboard → Settings → API → CORS settings

### Issue: Database connection errors

**Solution:**
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is active (not paused)
- Ensure RLS policies are set up correctly

### Issue: Build errors

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building again
npm run build
```

## Environment Variables Reference

| Variable | Required | Description | Where to Get It |
|----------|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | Your site URL | `http://localhost:3000` for local |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ Yes | Stripe publishable key | Stripe Dashboard → Developers → API keys |
| `STRIPE_SECRET_KEY` | ✅ Yes | Stripe secret key | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ Optional | Stripe webhook secret | Stripe Dashboard → Webhooks |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⚠️ Optional | Google Analytics ID | Google Analytics |
| `NEXT_PUBLIC_GTM_ID` | ⚠️ Optional | Google Tag Manager ID | Google Tag Manager |

## Git Workflow

### Before Committing

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. Check what you're committing:
   ```bash
   git status
   ```
3. If you see `.env.local` in the list, it means `.gitignore` isn't working. Check your `.gitignore` file.

### Safe to Commit

- ✅ Code changes (`.tsx`, `.ts`, `.js`, etc.)
- ✅ Configuration files (`.json`, `.config.js`, etc.)
- ✅ Documentation (`.md` files)
- ✅ `.env.local.example` (template file)

### Never Commit

- ❌ `.env.local` (contains secrets)
- ❌ `.env` (contains secrets)
- ❌ `node_modules/` (dependencies)
- ❌ `.next/` (build output)

## Next Steps

- ✅ Set up your local environment
- ✅ Test authentication
- ✅ Create test products
- ✅ Test the checkout flow
- ✅ Set up admin user
- ✅ Start developing!

For production deployment, see the main [README.md](./README.md) file.

