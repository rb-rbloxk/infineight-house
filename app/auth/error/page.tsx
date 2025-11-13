'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  Mail, 
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isResolving, setIsResolving] = useState(false);

  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    // Clear any existing auth state
    supabase.auth.signOut();
    
    // Show appropriate error message
    if (error === 'access_denied') {
      if (errorCode === 'otp_expired') {
        toast.error('Email verification link has expired. Please request a new one.');
      } else {
        toast.error('Access denied. Please try logging in again.');
      }
    }
  }, [error, errorCode]);

  const handleRetryAuth = async () => {
    setIsResolving(true);
    try {
      // Clear any existing sessions
      await supabase.auth.signOut();
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Error clearing auth state:', error);
      toast.error('Error clearing authentication state');
    } finally {
      setIsResolving(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const getErrorMessage = () => {
    switch (errorCode) {
      case 'otp_expired':
        return {
          title: 'Email Verification Expired',
          description: 'The email verification link has expired. This usually happens when the link is older than 24 hours.',
          solution: 'Please request a new verification email or try logging in with your password.'
        };
      case 'invalid_request':
        return {
          title: 'Invalid Request',
          description: 'The authentication request was invalid or malformed.',
          solution: 'Please try logging in again or contact support if the issue persists.'
        };
      default:
        return {
          title: 'Authentication Error',
          description: errorDescription || 'An error occurred during authentication.',
          solution: 'Please try logging in again or contact support for assistance.'
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-3xl font-bold text-primary">Authentication Error</h1>
          <p className="text-muted-foreground mt-2">
            There was an issue with your authentication request
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary text-center">{errorInfo.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                <strong>Error Details:</strong><br />
                {errorInfo.description}
              </AlertDescription>
            </Alert>

            <Alert className="bg-blue-500/10 border-blue-500/20">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700">
                <strong>Solution:</strong><br />
                {errorInfo.solution}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={handleRetryAuth}
                disabled={isResolving}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isResolving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Clearing Session...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>

              <Button
                onClick={handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>If you continue to experience issues, please contact support:</p>
              <p className="font-medium">hello@Infineight.house</p>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-secondary border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p><strong>Error:</strong> {error}</p>
              <p><strong>Error Code:</strong> {errorCode}</p>
              <p><strong>Error Description:</strong> {errorDescription}</p>
              <p><strong>URL:</strong> {window.location.href}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

