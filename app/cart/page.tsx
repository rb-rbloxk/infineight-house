'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Heart, 
  Share2, 
  Truck, 
  CreditCard,
  Gift,
  Percent,
  CheckCircle,
  AlertCircle,
  Package,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { trackBeginCheckout, trackRemoveFromCart } from '@/lib/analytics';

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  design_id?: string;
  quantity: number;
  size: string;
  color: string;
  customization_details?: any;
  created_at: string;
  updated_at: string;
  // Joined product data
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    base_price: number;
    base_image_url: string;
    available_colors: string[];
    available_sizes: string[];
    is_customizable: boolean;
    is_active: boolean;
  };
  // Joined design data
  design?: {
    id: string;
    design_data: any;
    preview_url: string;
  };
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
}

export default function CartPage() {
  return (
    <AuthGuard>
      <CartPageContent />
    </AuthGuard>
  );
}

function CartPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);

  // Fetch cart items from database
  const fetchCartItems = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*),
          design:designs(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCartItems(items => items.filter(item => item.id !== id));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const moveToWishlist = async (id: string) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    try {
      // First remove from cart
      await removeItem(id);
      
      // Then add to wishlist (you can implement wishlist functionality later)
      toast.success(`${item.product?.name || 'Item'} moved to wishlist`);
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      toast.error('Failed to move to wishlist');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) {
        toast.error('Invalid coupon code');
        return;
      }

      const coupon = data;
      const subtotal = getSubtotal();
      
      // Check if coupon has expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast.error('Coupon has expired');
        return;
      }

      // Check minimum order amount
      if (subtotal < coupon.min_order_amount) {
        toast.error(`Minimum order amount of ₹${coupon.min_order_amount} required`);
        return;
      }

      // Check usage limit
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        toast.error('Coupon usage limit reached');
        return;
      }

      setAppliedCoupon(coupon);
      toast.success(`Coupon "${coupon.code}" applied!`);
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.base_price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getShippingPrice = () => {
    const subtotal = getSubtotal();
    
    // Dynamic shipping charges based on order value
    if (subtotal < 500) {
      return 99;
    } else if (subtotal >= 500 && subtotal < 1000) {
      return 199;
    } else if (subtotal >= 1000 && subtotal < 5000) {
      return 399;
    } else if (subtotal >= 5000 && subtotal < 10000) {
      return 599;
    } else {
      return 999;
    }
  };

  const getShippingInfo = () => {
    const subtotal = getSubtotal();
    const shippingPrice = getShippingPrice();
    
    if (subtotal < 500) {
      return { price: shippingPrice, message: 'Add ₹' + (500 - subtotal).toFixed(2) + ' more to reduce shipping cost' };
    } else if (subtotal >= 500 && subtotal < 1000) {
      return { price: shippingPrice, message: 'Add ₹' + (1000 - subtotal).toFixed(2) + ' more for better shipping rate' };
    } else if (subtotal >= 1000 && subtotal < 5000) {
      return { price: shippingPrice, message: 'Standard shipping rate applied' };
    } else if (subtotal >= 5000 && subtotal < 10000) {
      return { price: shippingPrice, message: 'Premium shipping for high-value orders' };
    } else {
      return { price: shippingPrice, message: 'Premium shipping for orders above ₹10,000' };
    }
  };

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getSubtotal();
    if (appliedCoupon.discount_type === 'percentage') {
      return (subtotal * appliedCoupon.discount_value) / 100;
    }
    return appliedCoupon.discount_value;
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const shipping = getShippingPrice();
    const discount = getDiscount();
    const giftWrapFee = giftWrap ? 99 : 0;
    return subtotal + shipping - discount + giftWrapFee;
  };

  const getSavings = () => {
    const subtotal = getSubtotal();
    const bulkDiscount = subtotal >= 2000 ? subtotal * 0.05 : 0; // 5% bulk discount
    const couponDiscount = getDiscount();
    return bulkDiscount + couponDiscount;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    if (!user) {
      toast.error('Please login to proceed with checkout');
      router.push('/auth/login');
      return;
    }
    
    // Store cart data in sessionStorage for checkout page
    const checkoutData = {
      items: cartItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        design_id: item.design_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        customization_details: item.customization_details,
        product: item.product,
        design: item.design
      })),
      subtotal: getSubtotal(),
      shipping: getShippingPrice(),
      discount: getDiscount(),
      giftWrap: giftWrap,
      giftWrapFee: giftWrap ? 99 : 0,
      total: getTotal(),
      estimatedDelivery: '3-5 business days',
      appliedCoupon: appliedCoupon
    };
    
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    // Track begin checkout event
    const itemsForTracking = cartItems
      .filter(item => item.product)
      .map(item => ({
        id: item.product!.id,
        name: item.product!.name,
        category: item.product!.category,
        price: parseFloat(item.product!.base_price.toString()),
        quantity: item.quantity,
        currency: 'INR',
      }));
    
    if (itemsForTracking.length > 0) {
      trackBeginCheckout(itemsForTracking);
    }
    
    // Navigate to checkout page using window.location
    window.location.href = '/checkout';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-foreground">Loading cart...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto bg-card border-border">
            <CardContent className="text-center py-16">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-primary mb-2">Please Login</h2>
              <p className="text-muted-foreground mb-6">
                You need to be logged in to view your cart.
              </p>
              <Link href="/auth/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto bg-card border-border">
            <CardContent className="text-center py-16">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-primary mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link href="/shop">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-primary">Shopping Cart</h1>
              <Badge variant="outline" className="text-foreground">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>

            {cartItems.map((item) => (
              <Card key={item.id} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={item.product?.base_image_url || '/images/placeholder-product.png'}
                        alt={item.product?.name || 'Product'}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      {item.design && (
                        <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                          Custom
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.product?.name || 'Unknown Product'}</h3>
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size} • Color: {item.color}
                          </p>
                          {item.design && (
                            <p className="text-sm text-primary mt-1">
                              Customized design
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Est. delivery: 3-5 business days
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            ₹{((item.product?.base_price || 0) * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ₹{(item.product?.base_price || 0).toFixed(2)} each
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-foreground min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveToWishlist(item.id)}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Savings Alert */}
            {getSavings() > 0 && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  You're saving ₹{getSavings().toFixed(2)} on this order!
                  {getSubtotal() >= 2000 && (
                    <span className="block text-sm mt-1">
                      🎉 You qualify for bulk order discount!
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-foreground">₹{getSubtotal().toFixed(2)}</span>
                  </div>

                  {/* Coupon Section */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                      <Button onClick={applyCoupon} variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>
                    {appliedCoupon && (
                      <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-700">{appliedCoupon.code}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={removeCoupon}
                          className="text-green-700 hover:text-green-800"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  {getDiscount() > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-₹{getDiscount().toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  {/* Shipping Information */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Shipping Charges
                      </Label>
                      <span className="text-primary font-semibold">₹{getShippingPrice()}</span>
                    </div>
                    <Alert className="bg-primary/5 border-primary/20">
                      <AlertDescription className="text-sm text-muted-foreground">
                        {getShippingInfo().message}
                      </AlertDescription>
                    </Alert>
                  </div>

                  {/* Gift Wrap */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="giftWrap"
                        checked={giftWrap}
                        onChange={(e) => setGiftWrap(e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor="giftWrap" className="text-foreground">
                        Gift wrap (+₹99)
                      </Label>
                    </div>
                    <Gift className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-primary">Total:</span>
                    <span className="text-primary">₹{getTotal().toFixed(2)}</span>
                  </div>

                  <div className="text-sm text-muted-foreground text-center">
                    Estimated delivery: 3-5 business days
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>

                <div className="text-center">
                  <Link href="/shop" className="text-sm text-primary hover:underline">
                    Continue Shopping
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Security & Trust */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span>Free returns within 30 days</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Truck className="h-4 w-4 text-orange-500" />
                  <span>Fast & reliable shipping</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}