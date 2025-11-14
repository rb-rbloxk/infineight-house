'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // Update document title
    document.title = '404 - Page Not Found | Infineight';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mb-6 flex flex-col items-center">
              <Image
                src="/images/logo.png"
                alt="Infineight"
                width={120}
                height={60}
                className="mb-4"
              />
              <p className="text-sm text-muted-foreground mb-4">Wear moments, Beyond time!</p>
            </div>
            
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
              >
                <Link href="/shop">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Shop
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.history.back();
                  }
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
