# Infineight

**E-commerce platform for custom t-shirts, hoodies, and corporate gifting solutions.**

Live Site: [https://Infineight.house](https://Infineight.house)

---

## 🚀 Tech Stack

- **Framework**: Next.js 13 (App Router)
- **UI**: React, TailwindCSS, Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email verification)
- **Payments**: Stripe
- **Deployment**: Vercel

---

## 📋 Environment Variables

Create these in Vercel Dashboard (Settings → Environment Variables):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site URL
NEXT_PUBLIC_SITE_URL=https://Infineight.house

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🔧 Supabase Configuration

### 1. Enable Email Confirmation
- Dashboard → Authentication → Settings
- Enable "Confirm email" under Email Auth

### 2. Add Redirect URLs
- Dashboard → Authentication → URL Configuration
- Add: `https://Infineight.house/auth/callback`

---

## 💳 Stripe Configuration

### 1. Get API Keys
- Dashboard: https://dashboard.stripe.com/
- Developers → API keys

### 2. Create Webhook
- URL: `https://Infineight.house/api/webhooks/stripe`
- Events: `checkout.session.completed`, `payment_intent.payment_failed`

---

## 🛠️ Local Development

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd infineight-house

# Install dependencies
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local with your actual values
# Get Supabase credentials from: https://app.supabase.com/project/_/settings/api
```

**Required Environment Variables for Local Development:**

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site URL (use localhost for local dev)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe (Required for checkout)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Configure Supabase for Localhost

1. **Add Localhost to Allowed URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add `http://localhost:3000` to Site URL
   - Add `http://localhost:3000/auth/callback` to Redirect URLs

2. **Enable Email Auth (if not already enabled):**
   - Dashboard → Authentication → Providers → Email
   - Enable "Confirm email" (optional for local dev)

### 4. Run Development Server

```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

### 5. Test Locally

- ✅ Visit `http://localhost:3000`
- ✅ Test authentication (sign up/login)
- ✅ Test product browsing
- ✅ Test cart functionality
- ✅ Test admin dashboard (if you have admin access)

### 6. Build for Production

```bash
# Build for production
npm run build

# Start production server locally
npm start
```

### 7. Commit to GitHub

**Important:** Never commit `.env.local` to GitHub. It's already in `.gitignore`.

```bash
# Check what will be committed
git status

# Commit your changes
git add .
git commit -m "Your commit message"
git push
```

---

## ✨ Features

- ✅ User authentication with email verification
- ✅ Product catalog (T-shirts, Hoodies, Custom items)
- ✅ Shopping cart & wishlist
- ✅ Custom design editor
- ✅ Bulk calculator for corporate orders
- ✅ Stripe payment integration
- ✅ Order tracking
- ✅ Admin dashboard
- ✅ Responsive design (Mobile & Desktop)

---

## 📁 Project Structure

```
Infineight/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   └── ...                # Other pages
├── components/            # React components
├── contexts/              # React contexts
├── lib/                   # Utilities & configs
└── supabase/              # Database migrations
```

---

## 🧪 Testing

**Stripe Test Card:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

---

## 📝 License

© 2025 Infineight. All rights reserved.
