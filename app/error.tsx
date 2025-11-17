'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mb-6 flex flex-col items-center">
              <AlertCircle className="h-16 w-16 text-destructive mb-4" />
              <h1 className="text-4xl font-bold text-foreground mb-2">Oops!</h1>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Something went wrong</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              {error.message || 'An unexpected error occurred. Please try again.'}
            </p>

            {error.digest && (
              <p className="text-xs text-muted-foreground mb-6">
                Error ID: {error.digest}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={reset}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                asChild
                variant="outline"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

