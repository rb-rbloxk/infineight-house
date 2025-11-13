'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          toast.error('Authentication failed');
          
          // Redirect to error page after a delay
          setTimeout(() => {
            router.push('/auth/error?error=access_denied&error_description=Authentication failed');
          }, 2000);
          return;
        }

        if (data.session) {
          // Ensure profile exists (create if not exists, especially for email verification)
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (!existingProfile) {
            // Create profile if it doesn't exist
            const fullName = data.session.user.user_metadata?.full_name || '';
            const phone = data.session.user.user_metadata?.phone || null;
            
            await supabase
              .from('profiles')
              .insert([
                {
                  id: data.session.user.id,
                  email: data.session.user.email!,
                  full_name: fullName,
                  phone: phone,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ]);
          }
          
          setStatus('success');
          setMessage('Email verified successfully! Redirecting...');
          toast.success('Email verified! You can now login.');
          
          // Redirect to appropriate page based on user role
          setTimeout(async () => {
            // Check if user is admin
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', data.session.user.id)
              .single();
            
            if (profile?.is_admin) {
              router.push('/admin');
            } else {
              router.push('/shop');
            }
          }, 1500);
        } else {
          setStatus('error');
          setMessage('No session found. Please try logging in again.');
          toast.error('No session found');
          
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        toast.error('Authentication error');
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary text-center">Authentication</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <RefreshCw className="h-12 w-12 mx-auto animate-spin text-primary" />
                <p className="text-muted-foreground">{message}</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <p className="text-green-700 font-medium">{message}</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                <p className="text-red-700 font-medium">{message}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

