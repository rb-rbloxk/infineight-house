# Supabase Database Setup

This directory contains the complete database schema for the Infineight e-commerce platform.

## Quick Setup

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the Complete Schema**
   - Copy the contents of `complete_database_schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Create Admin User**
   After running the schema, create your first admin user:
   
   **Option A: Using SQL Function**
   ```sql
   -- First, create a user account through /auth/signup
   -- Then run:
   SELECT create_super_admin('your-email@example.com');
   ```
   
   **Option B: Using Node.js Script**
   ```bash
   node scripts/create-super-admin.js admin@example.com password123 "Admin Name"
   ```

## What's Included

The `complete_database_schema.sql` file includes:

- ✅ Core tables (profiles, products, orders, cart, etc.)
- ✅ Multiple product images support
- ✅ Wishlist functionality
- ✅ Address management
- ✅ Stripe payment integration
- ✅ Corporate enquiries with attachments
- ✅ Theme-based product categories
- ✅ Design images and instructions
- ✅ Row Level Security (RLS) policies
- ✅ Admin functions and policies
- ✅ Storage buckets for file uploads
- ✅ All triggers and functions

## File Structure

```
supabase/
└── complete_database_schema.sql  # Single file with everything
```

## Important Notes

- **Run the schema only once** - It uses `IF NOT EXISTS` clauses to prevent errors on re-runs
- **Backup your database** before running if you have existing data
- **Test in a development environment** first
- The schema includes all migrations in the correct order

## Troubleshooting

If you encounter errors:

1. **"relation already exists"** - Some tables may already exist. The schema uses `IF NOT EXISTS` to handle this.
2. **"policy already exists"** - Policies are dropped and recreated, so this shouldn't occur.
3. **"function already exists"** - Functions use `CREATE OR REPLACE`, so they'll be updated.

## Next Steps

After running the schema:

1. ✅ Verify tables were created (check Supabase Table Editor)
2. ✅ Create your first admin user
3. ✅ Configure storage buckets (already set up in the schema)
4. ✅ Test authentication flow
5. ✅ Add your first products

## Support

For issues or questions, refer to the main project README or documentation.

