'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  Eye, 
  Trash2,
  Filter,
  Search,
  SortAsc,
  Grid,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Utility function to format dates consistently
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

interface WishlistItem {
  id: string;
  product_id: string;
  user_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    base_price: number;
    base_image_url: string;
    image_urls: string[];
    available_colors: string[];
    available_sizes: string[];
    is_customizable: boolean;
    is_active: boolean;
  };
}

export default function WishlistPage() {
  return (
    <AuthGuard>
      <WishlistPageContent />
    </AuthGuard>
  );
}

function WishlistPageContent() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', 'Men', 'Women', 'Gifts', 'Corporate'];

  // Helper function to convert color names to hex values
  const getColorValue = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
      'White': '#FFFFFF',
      'Black': '#000000',
      'Red': '#FF0000',
      'Blue': '#0000FF',
      'Green': '#00FF00',
      'Yellow': '#FFFF00',
      'Orange': '#FFA500',
      'Purple': '#800080',
      'Pink': '#FFC0CB',
      'Brown': '#A52A2A',
      'Gray': '#808080',
      'Navy': '#000080',
      'Vintage Brown': '#8B4513',
      'Multi-color': '#FF6B6B'
    };
    return colorMap[colorName] || '#CCCCCC';
  };

  // Fetch wishlist items from database
  const fetchWishlistItems = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Check if it's a table not found error
        if (error.message?.includes('relation "public.wishlist" does not exist') || 
            error.message?.includes('Could not find the table')) {
          console.warn('Wishlist table does not exist. Please run the migration to create it.');
          setWishlistItems([]);
          return;
        }
        throw error;
      }

      setWishlistItems(data || []);
    } catch (error: any) {
      console.error('Error fetching wishlist items:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('relation "public.wishlist" does not exist') || 
          error.message?.includes('Could not find the table')) {
        toast.error('Wishlist table not found. Please contact admin to set up wishlist functionality.');
      } else {
        toast.error('Failed to load wishlist items');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, [user]);

  const addToCart = async (item: WishlistItem) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      // Add item to cart
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: item.product_id,
          quantity: 1,
          size: item.product.available_sizes[0] || 'M',
          color: item.product.available_colors[0] || 'Default'
        });

      if (error) throw error;

      toast.success('Added to cart!', {
        description: `${item.product.name} has been added to your cart`
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromWishlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.message?.includes('relation "public.wishlist" does not exist') || 
            error.message?.includes('Could not find the table')) {
          toast.error('Wishlist functionality not available. Please contact admin.');
          return;
        }
        throw error;
      }

      setWishlistItems(items => items.filter(item => item.id !== id));
      toast.success('Removed from wishlist');
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const shareItem = (item: WishlistItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.product.name,
        text: `Check out this ${item.product.name} from Infineight!`,
        url: `/product/${item.product.slug}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/product/${item.product.slug}`);
      toast.success('Product link copied to clipboard!');
    }
  };

  const getSavings = (item: WishlistItem) => {
    // For now, no savings calculation since we don't have original price
    return 0;
  };

  const sortedAndFilteredItems = wishlistItems
    .filter(item => filterCategory === 'all' || item.product.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.product.base_price - b.product.base_price;
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const totalSavings = wishlistItems.reduce((total, item) => total + getSavings(item), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 animate-pulse" />
          <span>Loading wishlist...</span>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card">
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto bg-card border-border">
            <CardContent className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-primary mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save items you love to your wishlist and come back to them later.
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
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary">My Wishlist</h1>
              <p className="text-muted-foreground">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Filters and Sorting */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Filter:</span>
                  <div className="flex gap-2">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={filterCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterCategory(category)}
                        className={filterCategory === category ? 'bg-primary text-primary-foreground' : ''}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Sort by:</span>
                  <div className="flex gap-2">
                    {[
                      { key: 'date', label: 'Date Added' },
                      { key: 'price', label: 'Price' },
                      { key: 'name', label: 'Name' }
                    ].map(option => (
                      <Button
                        key={option.key}
                        variant={sortBy === option.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy(option.key as any)}
                        className={sortBy === option.key ? 'bg-primary text-primary-foreground' : ''}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {totalSavings > 0 && (
                  <>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">
                        💰 Total Savings: ${totalSavings.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Wishlist Items */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {sortedAndFilteredItems.map((item) => (
              <Card key={item.id} className="bg-card border-border group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className={viewMode === 'grid' ? 'space-y-4' : 'flex gap-4'}>
                    {/* Product Image */}
                    <div className="relative">
                      <div className={`${viewMode === 'grid' ? 'w-full h-48' : 'w-24 h-24'} bg-muted rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20`}>
                        {item.product.base_image_url ? (
                          <img 
                            src={item.product.base_image_url} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Heart className={`${viewMode === 'grid' ? 'h-16 w-16' : 'h-8 w-8'} text-primary/50`} />
                        )}
                      </div>
                      {!item.product.is_active && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <Badge variant="outline" className="bg-background text-foreground">
                            Inactive
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className={`${viewMode === 'grid' ? 'space-y-2' : 'flex-1 space-y-2'}`}>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.product.category}</p>
                        {item.product.available_sizes.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Sizes: {item.product.available_sizes.join(', ')}
                          </p>
                        )}
                        {item.product.available_colors.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Colors: {item.product.available_colors.join(', ')}
                          </p>
                        )}
                        {item.product.is_customizable && (
                          <p className="text-sm text-primary">
                            ✨ Customizable
                          </p>
                        )}
                      </div>

                      {/* Color Palette Preview */}
                      <div className="flex gap-1 mb-2">
                        {item.product.available_colors.slice(0, 4).map((color, index) => (
                          <div 
                            key={index}
                            className="w-4 h-4 rounded-full border border-border" 
                            style={{ backgroundColor: getColorValue(color) }} 
                            title={color} 
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          ${item.product.base_price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Added on {formatDate(item.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className={`${viewMode === 'grid' ? 'space-y-2' : 'flex flex-col gap-2'}`}>
                      <Button
                        onClick={() => addToCart(item)}
                        disabled={!item.product.is_active}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {item.product.is_active ? 'Add to Cart' : 'Product Inactive'}
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(`/product/${item.product.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => shareItem(item)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bulk Actions */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {sortedAndFilteredItems.length} items in wishlist
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const activeItems = sortedAndFilteredItems.filter(item => item.product.is_active);
                      if (activeItems.length > 0) {
                        try {
                          for (const item of activeItems) {
                            await addToCart(item);
                          }
                          toast.success(`Added ${activeItems.length} items to cart!`);
                        } catch (error) {
                          toast.error('Failed to add some items to cart');
                        }
                      } else {
                        toast.error('No active items to add to cart');
                      }
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add All to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        for (const item of wishlistItems) {
                          await removeFromWishlist(item.id);
                        }
                        toast.success('Wishlist cleared');
                      } catch (error) {
                        toast.error('Failed to clear wishlist');
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Wishlist
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
