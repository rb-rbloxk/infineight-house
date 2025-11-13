'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ShoppingCart, Home, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Cancel Card */}
          <Card className="bg-card border-border mb-6">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-yellow-500" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Payment Cancelled
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Your payment was cancelled and no charges were made.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-yellow-500/10 border-yellow-500/20">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm text-muted-foreground ml-2">
                  Your order has been saved but payment was not completed. You can return to checkout to complete your purchase.
                </AlertDescription>
              </Alert>

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-4">What would you like to do?</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Return to checkout to complete your purchase</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Continue shopping and add more items to your cart</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Contact our support team if you need assistance</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Return to Checkout
                  </Button>
                </Link>
                <Link href="/shop" className="flex-1">
                  <Button variant="outline" className="w-full border-border hover:bg-card">
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Support Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Having trouble? <Link href="/contact" className="text-primary hover:underline">Contact our support team</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}


