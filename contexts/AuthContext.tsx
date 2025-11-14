'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Remove localStorage admin authentication - use proper Supabase auth only

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setProfile(data);
    } else {
      // Profile doesn't exist, create one
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        // Get phone from user metadata or phone field
        const phone = userData.user.phone || userData.user.user_metadata?.phone || null;
        const email = userData.user.email || null;
        const fullName = userData.user.user_metadata?.full_name || null;

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            phone: phone,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else if (newProfile) {
          setProfile(newProfile);
        }
      }
    }
  };

  useEffect(() => {
    // Handle auth errors from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorCode = urlParams.get('error_code');
    
    if (error === 'access_denied' && errorCode === 'otp_expired') {
      // Clear any existing auth state and redirect to error page
      supabase.auth.signOut();
      window.location.href = '/auth/error?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch((error: any) => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    // Check if email already exists
    const { data: existingEmailUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingEmailUser) {
      throw new Error('An account with this email already exists. Please login or use a different email.');
    }

    // Check if phone number already exists (if provided)
    if (phone && phone.trim()) {
      const { data: existingPhoneUser } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', phone)
        .maybeSingle();

      if (existingPhoneUser) {
        throw new Error('An account with this phone number already exists. Please use a different phone number.');
      }
    }

    // Sign up with email verification enabled
    // Use production URL for email verification redirects
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : 'https://Infineight.house/auth/callback';
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone || null,
        }
      }
    });

    if (error) throw error;

    // Don't create profile here - it will be created during email verification callback
    // This prevents RLS policy violations during signup
    return;
  };


  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      }
      throw error;
    }

    // Check if email is verified
    if (data.user && !data.user.email_confirmed_at) {
      // Sign out the user immediately
      await supabase.auth.signOut();
      throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
    }
  };

  const signOut = async () => {
    // Clear any localStorage admin data (legacy cleanup)
    localStorage.removeItem('admin_user');
    
    // Regular Supabase sign out
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    router.push('/');
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
