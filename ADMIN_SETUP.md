# Super Admin Setup Guide

This guide explains how to create a super admin user for the Infineight House admin dashboard.

## Method 1: Using SQL Script (Recommended for existing users)

If you already have a user account, you can promote them to admin using SQL.

### Steps:

1. **Create a user account** (if you don't have one):
   - Go to `/auth/signup` and create a regular user account
   - Verify your email address

2. **Run the SQL script**:
   - Open your Supabase Dashboard
   - Go to SQL Editor
   - Open the file `supabase/create_super_admin.sql`
   - **IMPORTANT**: Change the email on line 12 from `'admin@infineight.house'` to your actual email
   - Run the script

3. **Verify admin status**:
   - The script will show all admin users at the end
   - You should see your email listed with `is_admin = true`

4. **Login**:
   - Go to `/admin/login`
   - Use your email and password
   - You should now have access to the admin dashboard

## Method 2: Using Node.js Script (Recommended for new setup)

This method creates a new user and sets them as admin in one step.

### Prerequisites:

1. **Get your Supabase Service Role Key**:
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (NOT the anon key)
   - ⚠️ **Keep this key secret!** It bypasses all security policies

2. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Install dependencies** (if not already installed):
   ```bash
   npm install dotenv
   ```

### Steps:

1. **Run the script**:
   ```bash
   node scripts/create-super-admin.js <email> <password> [fullName]
   ```

   Example:
   ```bash
   node scripts/create-super-admin.js admin@infineight.house Admin123! "Super Admin"
   ```

2. **Login**:
   - Go to `/admin/login`
   - Use the email and password you provided
   - You should now have access to the admin dashboard

## Method 3: Manual SQL (For advanced users)

If you prefer to do it manually:

1. **Create user via Supabase Auth** (or use existing user)
2. **Get the user ID** from `auth.users` table
3. **Run this SQL**:

```sql
-- Replace 'user-id-here' with actual UUID and 'email@example.com' with actual email
INSERT INTO profiles (
  id,
  email,
  full_name,
  is_admin,
  created_at,
  updated_at
) VALUES (
  'user-id-here',
  'email@example.com',
  'Super Admin',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  updated_at = now();
```

## Security Notes

- ⚠️ **Service Role Key**: The service role key has full access to your database. Never commit it to version control or expose it publicly.
- 🔒 **Admin Access**: Admin users have full access to all data. Only create admin accounts for trusted users.
- 🔐 **Password**: Use a strong password for admin accounts (minimum 8 characters, mix of letters, numbers, and symbols).

## Troubleshooting

### "User not found" error
- Make sure you've created the user account first through `/auth/signup`
- Verify the email address is correct
- Check that email verification is complete

### "Access denied" error when logging in
- Verify that `is_admin = true` in the profiles table
- Check that you're using the correct email and password
- Make sure you're logging in at `/admin/login` (not `/auth/login`)

### Service role key not working
- Verify the key is correct (no extra spaces)
- Make sure it's the `service_role` key, not the `anon` key
- Check that `.env.local` is in the project root

## Admin Functions

Once you're an admin, you can:

- **Promote other users to admin**: Use the `promote_to_admin(user_id)` function
- **Demote admins**: Use the `demote_from_admin(user_id)` function
- **Manage all data**: View and edit all products, orders, users, etc.

## Need Help?

If you encounter issues:
1. Check the Supabase logs in the Dashboard
2. Verify your database schema is up to date
3. Check that RLS policies are correctly set up
4. Review the error messages in the browser console

