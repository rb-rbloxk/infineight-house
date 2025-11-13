'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, Product } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Palette, Filter, X } from 'lucide-react';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(category ? [category] : ['all']);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategories]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    // Handle multiple category selection
    if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
      query = query.in('category', selectedCategories);
    }

    const { data, error } = await query;

    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  // Helper functions for category management
  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      setSelectedCategories(prev => {
        const newCategories = prev.includes(categoryId) 
          ? prev.filter(cat => cat !== categoryId)
          : [...prev.filter(cat => cat !== 'all'), categoryId];
        
        // If no categories selected, default to 'all'
        return newCategories.length === 0 ? ['all'] : newCategories;
      });
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories(['all']);
  };

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'Apparel & Fashion', label: '🧢 Apparel & Fashion' },
    { id: 'Men\'s Apparel', label: '👔 Men\'s Apparel' },
    { id: 'Women\'s Apparel', label: '👚 Women\'s Apparel' },
    { id: 'Unisex & Custom Wear', label: '👕 Unisex & Custom Wear' },
    { id: 'Gifting & Hampers', label: '🎁 Gifting & Hampers' },
    { id: 'Chocolates & Sweets', label: '🍫 Chocolates & Sweets' },
    { id: 'Mugs, Bottles & Drinkware', label: '☕ Mugs, Bottles & Drinkware' },
    { id: 'Snack & Gourmet Hampers', label: '🍪 Snack & Gourmet Hampers' },
    { id: 'Luxury Gift Sets', label: '🌸 Luxury Gift Sets' },
    { id: 'Corporate Kits & Sets', label: '💼 Corporate Kits & Sets' },
    { id: 'Employee Onboarding Kits', label: '👋 Employee Onboarding Kits' },
    { id: 'Recognition & Reward Kits', label: '🏆 Recognition & Reward Kits' },
    { id: 'Event & Conference Kits', label: '🎊 Event & Conference Kits' },
    { id: 'Work-From-Home Kits', label: '🖥️ Work-From-Home Kits' },
    { id: 'Custom Branding Solutions', label: '🖋️ Custom Branding Solutions' },
    { id: 'Seasonal & Festive Collections', label: '🪄 Seasonal & Festive Collections' },
    { id: 'Eco-Friendly & Sustainable Gifts', label: '♻️ Eco-Friendly & Sustainable Gifts' },
    { id: 'Accessories & Essentials', label: '🏷️ Accessories & Essentials' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Shop Our Collection
          </h1>
          <p className="text-muted-foreground text-lg">Find the perfect products to customize and make your own</p>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <Button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            variant="outline"
            className="w-full justify-between"
          >
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter Categories
              {selectedCategories.length > 1 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCategories.length}
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {showMobileFilters ? 'Hide' : 'Show'}
            </span>
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Categories */}
          <div className={`w-80 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
            <Card className="sticky top-8 bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Categories</h3>
                  {selectedCategories.length > 1 && (
                    <Button
                      onClick={clearAllFilters}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                        className="flex-shrink-0"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm text-foreground cursor-pointer flex-1 hover:text-primary transition-colors"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Selected Categories Summary */}
                {selectedCategories.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Selected:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedCategories.filter(cat => cat !== 'all').map((categoryId) => {
                        const category = categories.find(cat => cat.id === categoryId);
                        return (
                          <Badge key={categoryId} variant="outline" className="text-xs">
                            {category?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Products */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedCategories.includes('all') 
                    ? 'All Products' 
                    : `${products.length} Products Found`
                  }
                </h2>
                {selectedCategories.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    Showing products from {selectedCategories.length} categories
                  </p>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-card rounded-2xl p-12 border border-border max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👕</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">No products found in the selected categories.</p>
                  <Button onClick={clearAllFilters} variant="outline">
                    View All Products
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/product/${product.slug}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary bg-card h-full">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-secondary rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                          {((product as any).image_urls && (product as any).image_urls.length > 0) ? (
                            <>
                              <img
                                src={(product as any).image_urls[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {(product as any).image_urls.length > 1 && (
                                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                  +{(product as any).image_urls.length - 1}
                                </div>
                              )}
                            </>
                          ) : product.base_image_url ? (
                            <img
                              src={product.base_image_url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span className="text-6xl">👕</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description || 'Customizable product'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-foreground">₹{product.base_price}</span>
                          {product.is_customizable && (
                            <div className="flex items-center text-xs text-primary">
                              <Palette className="h-3 w-3 mr-1" />
                              Customizable
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
