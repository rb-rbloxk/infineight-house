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

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
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
