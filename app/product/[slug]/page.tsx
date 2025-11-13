'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, Product } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Palette, ShoppingCart, Check, Heart, Star, Shield, Truck, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ProductStructuredData } from '@/components/ProductStructuredData';
import { trackProductView, trackAddToCart } from '@/lib/analytics';

export default function ProductPage() {
  return <ProductPageContent />;
}

function ProductPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  useEffect(() => {
    if (product && user) {
      checkWishlistStatus();
    }
  }, [product, user]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', params.slug as string)
      .eq('is_active', true)
      .maybeSingle();

    if (data) {
      setProduct(data);
      if (data.available_sizes.length > 0) {
        setSelectedSize(data.available_sizes[0]);
      }
      if (data.available_colors.length > 0) {
        setSelectedColor(data.available_colors[0]);
      }
      
      // Track product view
      trackProductView({
        id: data.id,
        name: data.name,
        category: data.category,
        price: parseFloat(data.base_price.toString()),
        currency: 'INR',
      });
    }
    setLoading(false);
  };

  const checkWishlistStatus = async () => {
    if (!user || !product) return;

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (error) throw error;
      setIsInWishlist(!!data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      router.push('/auth/login');
      return;
    }

    if (!product) return;

    setWishlistLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;

        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            product_id: product.id
          });

        if (error) throw error;

        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    setAdding(true);

    const { error } = await supabase
      .from('cart_items')
      .insert([
        {
          user_id: user.id,
          product_id: product!.id,
          quantity,
          size: selectedSize,
          color: selectedColor,
        },
      ]);

    if (error) {
      toast.error('Failed to add to cart');
    } else {
      toast.success('Added to cart successfully!');
      
      // Track add to cart event
      trackAddToCart({
        id: product!.id,
        name: product!.name,
        category: product!.category,
        price: parseFloat(product!.base_price.toString()),
        quantity,
        currency: 'INR',
      });
    }

    setAdding(false);
  };

  const startCustomization = () => {
    if (!user) {
      toast.error('Please login to customize products');
      router.push('/auth/login');
      return;
    }
    router.push(`/customise?product=${product!.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">😔</div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Product not found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/shop')} className="bg-primary hover:bg-primary/90">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProductStructuredData product={product} />
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => router.push('/shop')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Shop
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">{product.category}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
          {/* Product Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-card rounded-2xl overflow-hidden shadow-2xl border border-border">
              {((product as any).image_urls && (product as any).image_urls.length > 0) ? (
                <img
                  src={(product as any).image_urls[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : product.base_image_url ? (
                <img
                  src={product.base_image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-muted">
                  <span className="text-9xl opacity-50">👕</span>
                </div>
              )}
            </div>
            
            {/* Image Gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {((product as any).image_urls && (product as any).image_urls.length > 0 ? (product as any).image_urls : [product.base_image_url]).slice(0, 4).map((imageUrl: string, i: number) => (
                <div key={i} className="aspect-square bg-card rounded-lg border border-border overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl opacity-30">👕</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {product.category}
                  </span>
                  {product.is_customizable && (
                    <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded-full flex items-center">
                      <Palette className="w-3 h-3 mr-1" />
                      Customizable
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">(4.8)</span>
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-primary">
                  ₹{product.base_price}
                </span>
                <span className="text-base sm:text-lg text-muted-foreground line-through">
                  ₹{(product.base_price * 1.2).toFixed(0)}
                </span>
                <span className="px-2 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded">
                  Save 17%
                </span>
              </div>
            </div>

            {/* Product Description */}
            {product.description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border border-border">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">On orders over ₹999</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border border-border">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Quality Guarantee</p>
                  <p className="text-sm text-muted-foreground">Premium materials</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-card rounded-lg border border-border">
                <Check className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Easy Returns</p>
                  <p className="text-sm text-muted-foreground">30-day policy</p>
                </div>
              </div>
            </div>

            {/* Customization Notice */}
            {product.is_customizable && (
              <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Fully Customizable Design</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Add your own text, images, or choose from our design library to create a unique piece.
                    </p>
                    <Button 
                      onClick={startCustomization}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Palette className="mr-2 h-4 w-4" />
                      Start Customizing
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Size Selection */}
            {product.available_sizes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-semibold text-foreground">Size</label>
                  <button className="text-sm text-primary hover:underline">Size Guide</button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {product.available_sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`p-2 sm:p-4 rounded-xl font-semibold transition-all duration-200 border-2 text-sm sm:text-base ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                          : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.available_colors.length > 0 && (
              <div className="space-y-4">
                <label className="text-lg font-semibold text-foreground">Color</label>
                <div className="flex flex-wrap gap-3">
                  {product.available_colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 border-2 capitalize text-sm sm:text-base ${
                        selectedColor === color
                          ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                          : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="space-y-4">
              <label className="text-lg font-semibold text-foreground">Quantity</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 bg-card text-foreground hover:bg-muted transition-colors"
                  >
                    -
                  </button>
                  <div className="px-6 py-3 bg-background text-xl font-semibold text-foreground min-w-[60px] text-center">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 bg-card text-foreground hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {quantity} × ₹{product.base_price} = ₹{(quantity * product.base_price).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  onClick={addToCart}
                  disabled={adding || !selectedSize}
                  className="h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {adding ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-5 w-5" />
                  )}
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant={isInWishlist ? "default" : "outline"}
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className="h-14 text-lg font-semibold"
                >
                  {wishlistLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  )}
                  {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </Button>
              </div>
              
              {/* {!product.is_customizable && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-14 text-lg font-semibold"
                >
                  Buy Now
                </Button>
              )} */}
            </div>

            {/* Additional Info */}
            <div className="pt-8 border-t border-border">
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>SKU</span>
                  <span className="text-foreground font-mono">{product.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Category</span>
                  <span className="text-foreground">{product.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Availability</span>
                  <span className="text-primary font-medium">In Stock</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
