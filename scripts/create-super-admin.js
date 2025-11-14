/**
 * Create Super Admin User Script
 * 
 * This script creates a super admin user in Supabase.
 * 
 * Usage:
 *   node scripts/create-super-admin.js <email> <password> <fullName>
 * 
 * Example:
 *   node scripts/create-super-admin.js admin@infineight.house Admin123! "Super Admin"
 * 
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 *   - The service role key bypasses RLS policies
 */

const { createClient } = require('@supabase/supabase-js');

// Try to load .env.local if dotenv is available
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not installed, use environment variables directly
  console.log('ℹ️  dotenv not found, using environment variables directly\n');
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  console.error('\nOption 1: Add to .env.local file:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('\nOption 2: Set as environment variables:');
  console.error('  export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('  export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('\nOption 3: Pass inline:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=url SUPABASE_SERVICE_ROLE_KEY=key node scripts/create-super-admin.js ...');
  console.error('\nGet your service role key from: Supabase Dashboard → Settings → API');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperAdmin(email, password, fullName = 'Super Admin') {
  try {
    console.log('🚀 Creating super admin user...\n');
    console.log(`Email: ${email}`);
    console.log(`Full Name: ${fullName}\n`);

    // Step 1: Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
    
    if (checkError) {
      throw checkError;
    }

    const existingUser = existingUsers.users.find(u => u.email === email);
    
    let userId;
    
    if (existingUser) {
      console.log('⚠️  User already exists. Updating to admin...');
      userId = existingUser.id;
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            full_name: fullName
          }
        }
      );
      
      if (updateError) {
        throw updateError;
      }
    } else {
      // Step 2: Create new user
      console.log('📝 Creating new user...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName
        }
      });

      if (createError) {
        throw createError;
      }

      userId = newUser.user.id;
      console.log('✅ User created successfully!');
    }

    // Step 3: Create or update profile with admin privileges
    console.log('👑 Setting admin privileges...');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: fullName,
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      throw profileError;
    }

    console.log('✅ Profile created/updated with admin privileges!');

    // Step 4: Verify admin status
    const { data: profile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (verifyError) {
      throw verifyError;
    }

    console.log('\n🎉 Super Admin created successfully!\n');
    console.log('📋 Admin Details:');
    console.log(`   ID: ${profile.id}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Full Name: ${profile.full_name}`);
    console.log(`   Is Admin: ${profile.is_admin}`);
    console.log(`   Created At: ${profile.created_at}\n`);
    console.log('🔐 You can now login at: /admin/login');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Error: Missing required arguments\n');
  console.error('Usage: node scripts/create-super-admin.js <email> <password> [fullName]');
  console.error('\nExample:');
  console.error('  node scripts/create-super-admin.js admin@infineight.house Admin123! "Super Admin"');
  process.exit(1);
}

const [email, password, fullName] = args;

if (password.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters long');
  process.exit(1);
}

createSuperAdmin(email, password, fullName || 'Super Admin');

