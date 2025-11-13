'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, MapPin, Package, Shield, Truck, ArrowLeft, Home, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutPageContent />
    </AuthGuard>
  );
}

function CheckoutPageContent() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    // Try to get checkout data from sessionStorage first
    const storedCheckoutData = sessionStorage.getItem('checkoutData');
    if (storedCheckoutData) {
      try {
        const data = JSON.parse(storedCheckoutData);
        setCheckoutData(data);
        setCartItems(data.items || []);
      } catch (error) {
        console.error('Error parsing checkout data:', error);
        fetchCart();
      }
    } else {
      fetchCart();
    }
    
    // Fetch user's saved addresses
    fetchAddresses();
    
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.full_name || '',
        phone: profile.phone || '',
      }));
    }
    setLoading(false);
  }, [user, profile]);

  const fetchCart = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        size,
        color,
        design_id,
        customization_details,
        product:products (
          id,
          name,
          base_price
        )
      `)
      .eq('user_id', user.id);

    if (data && data.length > 0) {
      setCartItems(data);
    } else {
      router.push('/cart');
    }
    setLoading(false);
  };

  const fetchAddresses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setAddresses(data);
      // Auto-select the default address or the first address
      const defaultAddress = data.find((addr: Address) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        populateFormWithAddress(defaultAddress);
      } else {
        setSelectedAddressId(data[0].id);
        populateFormWithAddress(data[0]);
      }
    } else {
      setShowNewAddressForm(true);
    }
  };

  const populateFormWithAddress = (address: Address) => {
    setFormData({
      fullName: address.full_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      notes: formData.notes,
    });
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      populateFormWithAddress(selectedAddress);
      setShowNewAddressForm(false);
    }
  };

  const handleNewAddressClick = () => {
    setSelectedAddressId('');
    setShowNewAddressForm(true);
    setFormData({
      fullName: profile?.full_name || '',
      phone: profile?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      notes: formData.notes,
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.base_price * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    if (checkoutData) {
      return checkoutData.total;
    }
    return calculateSubtotal();
  };

  const getShippingCost = () => {
    if (checkoutData) {
      return checkoutData.shipping;
    }
    return 0;
  };

  const getDiscount = () => {
    if (checkoutData) {
      return checkoutData.discount || 0;
    }
    return 0;
  };

  const getGiftWrapFee = () => {
    if (checkoutData) {
      return checkoutData.giftWrapFee || 0;
    }
    return 0;
  };

  const generateOrderNumber = () => {
    return 'HS' + new Date().toISOString().split('T')[0].replace(/-/g, '') +
           Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate address
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    setSubmitting(true);

    try {
      const orderNumber = generateOrderNumber();
      const shippingAddress = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user!.id,
            order_number: orderNumber,
            total_amount: calculateTotal(),
            shipping_address: shippingAddress,
            notes: formData.notes,
            status: 'pending',
            payment_status: 'pending',
          },
        ])
        .select()
        .single();

      if (orderError || !order) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        design_id: item.design_id,
        quantity: item.quantity,
        unit_price: item.product.base_price,
        size: item.size,
        color: item.color,
        customization_details: item.customization_details || {},
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          customerEmail: user!.email,
          orderId: order.id,
          metadata: {
            userId: user!.id,
            orderNumber: orderNumber,
            shipping: getShippingCost(),
            discount: getDiscount(),
            giftWrapFee: getGiftWrapFee(),
            couponCode: checkoutData?.appliedCoupon?.code,
          },
        }),
      });

      const { sessionId, url, error: stripeError } = await response.json();

      if (stripeError) {
        throw new Error(stripeError);
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to proceed to payment. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-foreground">Loading checkout...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link 
              href="/cart"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cart
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order securely</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Shipping Information
                    </div>
                    {addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleNewAddressClick}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        New Address
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Saved Addresses */}
                  {addresses.length > 0 && !showNewAddressForm && (
                    <div className="space-y-3">
                      <Label className="text-foreground font-semibold">Select Delivery Address</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => handleAddressSelect(address.id)}
                            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary ${
                              selectedAddressId === address.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-background'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Home className="h-4 w-4 text-primary" />
                                  <span className="font-semibold text-foreground">{address.full_name}</span>
                                  {address.is_default && (
                                    <Badge variant="outline" className="text-xs border-primary text-primary">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{address.phone}</p>
                                <p className="text-sm text-muted-foreground">
                                  {address.address}, {address.city}, {address.state} - {address.pincode}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedAddressId === address.id
                                      ? 'border-primary bg-primary'
                                      : 'border-border'
                                  }`}
                                >
                                  {selectedAddressId === address.id && (
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Address Form or No Addresses */}
                  {(showNewAddressForm || addresses.length === 0) && (
                    <>
                      {addresses.length > 0 && (
                        <div className="flex items-center justify-between pb-2">
                          <Label className="text-foreground font-semibold">Enter New Address</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowNewAddressForm(false);
                              if (addresses.length > 0) {
                                handleAddressSelect(addresses[0].id);
                              }
                            }}
                            className="text-primary hover:text-primary/80"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-foreground">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            className="bg-background border-border text-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            pattern="[0-9+\-\s()]+"
                            title="Please enter a valid phone number (numbers, spaces, and +- () allowed)"
                            placeholder="+91 9876543210"
                            className="bg-background border-border text-foreground"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-foreground">Address *</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                          className="bg-background border-border text-foreground"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-foreground">City *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                            className="bg-background border-border text-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" className="text-foreground">State *</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            required
                            className="bg-background border-border text-foreground"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode" className="text-foreground">Pincode *</Label>
                          <Input
                            id="pincode"
                            type="text"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            required
                            pattern="[0-9]{4,10}"
                            title="Please enter a valid pincode (4-10 digits)"
                            placeholder="560066"
                            className="bg-background border-border text-foreground"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-foreground">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special instructions for your order..."
                      className="bg-background border-border text-foreground"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Secure Payment with Stripe</h4>
                      <p className="text-sm text-muted-foreground">
                        Your payment will be processed securely through Stripe. You'll be redirected to complete your payment after clicking "Place Order".
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span>All major credit and debit cards accepted</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>PCI DSS compliant secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>SSL encrypted transaction</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-muted-foreground">Powered by</span>
                    <span className="font-semibold text-primary">Stripe</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="bg-card border-border sticky top-20">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Size: {item.size} • Color: {item.color}
                          </p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-primary font-semibold">₹{item.product.base_price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    
                    {getDiscount() > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{getDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className={getShippingCost() > 0 ? "text-foreground" : "text-primary font-medium"}>
                        {getShippingCost() > 0 ? `₹${getShippingCost().toFixed(2)}` : "Free"}
                      </span>
                    </div>
                    
                    {getGiftWrapFee() > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Gift Wrap</span>
                        <span>₹{getGiftWrapFee().toFixed(2)}</span>
                      </div>
                    )}
                    
                    <Separator />
                    <div className="flex justify-between text-xl font-bold text-primary">
                      <span>Total</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800 text-white h-12 text-lg font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Place Order
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Link href="/cart" className="text-sm text-primary hover:underline">
                      <ArrowLeft className="inline mr-1 h-3 w-3" />
                      Back to Cart
                    </Link>
                  </div>

                  {/* Security & Trust */}
                  <div className="pt-4 border-t border-border">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Secure checkout with SSL encryption</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Truck className="h-4 w-4 text-primary" />
                        <span>Fast & reliable shipping</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4 text-primary" />
                        <span>Free returns within 30 days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
