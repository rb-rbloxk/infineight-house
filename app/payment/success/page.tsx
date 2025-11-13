'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (!orderId) {
        toast.error('Order ID not found');
        router.push('/');
        return;
      }

      try {
        // Fetch order details
        const { data: order, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();

        if (error) throw error;

        setOrderDetails(order);

        // Clear cart items from supabase (if not already cleared)
        if (order.user_id) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', order.user_id);
        }

        // Clear sessionStorage
        sessionStorage.removeItem('checkoutData');
      } catch (error) {
        console.error('Error processing payment success:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    processPaymentSuccess();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <Card className="bg-card border-border mb-6">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-primary">
                Payment Successful!
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Thank you for your order. Your payment has been processed successfully.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {orderDetails && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Order Number</span>
                    <span className="font-semibold text-foreground">{orderDetails.order_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Order Total</span>
                    <span className="font-semibold text-primary">₹{orderDetails.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-600">
                      Paid
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Order Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-600">
                      Confirmed
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  What's Next?
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>You will receive an order confirmation email shortly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>We'll send you tracking information once your order ships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Expected delivery: 3-5 business days</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/orders" className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Package className="mr-2 h-4 w-4" />
                    View Orders
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full border-border hover:bg-card">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Need help? <Link href="/contact" className="text-primary hover:underline">Contact our support team</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}


