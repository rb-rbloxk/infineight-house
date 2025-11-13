'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AdminGuard({ children, redirectTo = '/auth/login' }: AdminGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!loading) {
        if (!user) {
          router.push(redirectTo);
          return;
        }

        if (!profile?.is_admin) {
          // Double-check admin status from database
          const { data: currentProfile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

          if (error || !currentProfile?.is_admin) {
            toast.error('Access denied. Admin privileges required.');
            await supabase.auth.signOut();
            router.push('/');
            return;
          }
        }
      }
    };

    checkAdminAccess();
  }, [user, profile, loading, router, redirectTo]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated or not admin
  if (!user || !profile?.is_admin) {
    return null;
  }

  return <>{children}</>;
}
