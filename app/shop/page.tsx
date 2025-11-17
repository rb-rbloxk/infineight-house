'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, Product } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Palette, Filter, X, Search, ChevronDown, ChevronRight } from 'lucide-react';

interface CategoryGroup {
  id: string;
  label: string;
  icon: string;
  subCategories: { id: string; label: string }[];
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [themes, setThemes] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(category ? [category] : ['all']);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>('default');
  const [expandedCategoryGroups, setExpandedCategoryGroups] = useState<Set<string>>(new Set(['theme']));

  useEffect(() => {
    fetchAllProducts();
    fetchThemes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedCategories, selectedThemes, searchQuery, selectedColors, priceRange, sortBy, allProducts]);

  const fetchThemes = async () => {
    const { data, error } = await supabase
      .from('themes')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (data) {
      setThemes(data);
    }
  };

  const fetchAllProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, themes:theme_id(id, name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (data) {
      setAllProducts(data);
      // Set initial price range based on products
      if (data.length > 0) {
        const prices = data.map((p: Product) => parseFloat(p.base_price.toString()));
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        setPriceRange([minPrice, maxPrice]);
      }
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...allProducts];

    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Theme filter (for Theme based category)
    if (selectedThemes.length > 0) {
      filtered = filtered.filter(p => {
        const productThemeId = (p as any).theme_id;
        return productThemeId && selectedThemes.includes(productThemeId);
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => {
        const colors = p.available_colors || [];
        return selectedColors.some(color => colors.includes(color));
      });
    }

    // Price filter
    filtered = filtered.filter(p => {
      const price = parseFloat(p.base_price.toString());
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => parseFloat(a.base_price.toString()) - parseFloat(b.base_price.toString()));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => parseFloat(b.base_price.toString()) - parseFloat(a.base_price.toString()));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setProducts(filtered);
  };

  // Organized category groups with sub-categories
  const categoryGroups: CategoryGroup[] = [
    {
      id: 'apparel',
      label: 'Apparel & Fashion',
      icon: '🧢',
      subCategories: [
        { id: 'Men\'s Apparel', label: 'Men\'s Apparel' },
        { id: 'Women\'s Apparel', label: 'Women\'s Apparel' },
        { id: 'Unisex & Custom Wear', label: 'Unisex & Custom Wear' },
        { id: 'Theme based', label: 'Theme based' },
        { id: 'Accessories & Essentials', label: 'Accessories & Essentials' },
      ],
    },
    {
      id: 'gifting',
      label: 'Gifting & Hampers',
      icon: '🎁',
      subCategories: [
        { id: 'Chocolates & Sweets', label: 'Chocolates & Sweets' },
        { id: 'Mugs, Bottles & Drinkware', label: 'Mugs, Bottles & Drinkware' },
        { id: 'Snack & Gourmet Hampers', label: 'Snack & Gourmet Hampers' },
        { id: 'Luxury Gift Sets', label: 'Luxury Gift Sets' },
        { id: 'Seasonal & Festive Collections', label: 'Seasonal & Festive Collections' },
        { id: 'Eco-Friendly & Sustainable Gifts', label: 'Eco-Friendly & Sustainable Gifts' },
      ],
    },
    {
      id: 'corporate',
      label: 'Corporate Kits & Sets',
      icon: '💼',
      subCategories: [
        { id: 'Employee Onboarding Kits', label: 'Employee Onboarding Kits' },
        { id: 'Recognition & Reward Kits', label: 'Recognition & Reward Kits' },
        { id: 'Event & Conference Kits', label: 'Event & Conference Kits' },
        { id: 'Work-From-Home Kits', label: 'Work-From-Home Kits' },
        { id: 'Custom Branding Solutions', label: 'Custom Branding Solutions' },
      ],
    },
  ];

  // Get all unique colors from products
  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    allProducts.forEach(product => {
      const colors = product.available_colors || [];
      if (Array.isArray(colors)) {
        colors.forEach(color => colorSet.add(color));
      }
    });
    return Array.from(colorSet).sort();
  }, [allProducts]);

  // Get price range from products
  const priceRangeBounds = useMemo(() => {
    if (allProducts.length === 0) return [0, 100000];
    const prices = allProducts.map((p: Product) => parseFloat(p.base_price.toString()));
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [allProducts]);

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
    setSelectedThemes([]);
    setSearchQuery('');
    setSelectedColors([]);
    if (allProducts.length > 0) {
      const prices = allProducts.map(p => parseFloat(p.base_price.toString()));
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      setPriceRange([minPrice, maxPrice]);
    } else {
      setPriceRange([0, 100000]);
    }
    setSortBy('default');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0 && !selectedCategories.includes('all')) count++;
    if (selectedThemes.length > 0) count++;
    if (searchQuery.trim()) count++;
    if (selectedColors.length > 0) count++;
    if (priceRange[0] !== priceRangeBounds[0] || priceRange[1] !== priceRangeBounds[1]) count++;
    if (sortBy !== 'default') count++;
    return count;
  }, [selectedCategories, selectedThemes, searchQuery, selectedColors, priceRange, sortBy, priceRangeBounds]);

  const toggleCategoryGroup = (groupId: string) => {
    setExpandedCategoryGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg bg-background border-border text-foreground"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Filter Button & Sort */}
        <div className="lg:hidden mb-6 space-y-3">
          <Button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            variant="outline"
            className="w-full justify-between"
          >
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {showMobileFilters ? 'Hide' : 'Show'}
            </span>
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full bg-background border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Filters */}
          <div className={`w-80 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
            <Card className="sticky top-8 bg-card border-border max-h-[calc(100vh-4rem)] overflow-y-auto">
              <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                  {activeFiltersCount > 0 && (
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

                {/* Categories with Sub-categories */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Categories</h4>
                  <div className="space-y-2">
                    {/* All Products Option */}
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="category-all"
                        checked={selectedCategories.includes('all')}
                        onCheckedChange={() => handleCategoryToggle('all')}
                        className="flex-shrink-0"
                      />
                      <label
                        htmlFor="category-all"
                        className="text-sm text-foreground cursor-pointer flex-1 hover:text-primary transition-colors"
                      >
                        All Products
                      </label>
                    </div>

                    {/* Category Groups */}
                    {categoryGroups.map((group) => (
                      <div key={group.id} className="space-y-1">
                        <button
                          onClick={() => toggleCategoryGroup(group.id)}
                          className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors py-1"
                        >
                          <span>
                            {group.icon} {group.label}
                          </span>
                          {expandedCategoryGroups.has(group.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        {expandedCategoryGroups.has(group.id) && (
                          <div className="ml-4 space-y-1 mt-1">
                            {group.subCategories.map((subCat) => (
                              <div key={subCat.id}>
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`category-${subCat.id}`}
                                    checked={selectedCategories.includes(subCat.id)}
                                    onCheckedChange={() => handleCategoryToggle(subCat.id)}
                                    className="flex-shrink-0"
                                  />
                                  <label
                                    htmlFor={`category-${subCat.id}`}
                                    className="text-sm text-foreground cursor-pointer flex-1 hover:text-primary transition-colors"
                                  >
                                    {subCat.label}
                                  </label>
                                </div>
                                {/* Show themes when "Theme based" is selected */}
                                {subCat.id === 'Theme based' && selectedCategories.includes('Theme based') && (
                                  <div className="ml-7 mt-2 space-y-1">
                                    {themes.length === 0 ? (
                                      <p className="text-xs text-muted-foreground">No themes available</p>
                                    ) : (
                                      themes.map((theme) => (
                                        <div key={theme.id} className="flex items-center space-x-3">
                                          <Checkbox
                                            id={`theme-${theme.id}`}
                                            checked={selectedThemes.includes(theme.id)}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                setSelectedThemes([...selectedThemes, theme.id]);
                                              } else {
                                                setSelectedThemes(selectedThemes.filter(t => t !== theme.id));
                                              }
                                            }}
                                            className="flex-shrink-0"
                                          />
                                          <label
                                            htmlFor={`theme-${theme.id}`}
                                            className="text-sm text-foreground cursor-pointer flex-1 hover:text-primary transition-colors"
                                          >
                                            {theme.name}
                                          </label>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Price Range</h4>
                  <div className="space-y-4">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      min={priceRangeBounds[0]}
                      max={priceRangeBounds[1]}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Min</Label>
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          min={priceRangeBounds[0]}
                          max={priceRangeBounds[1]}
                          className="mt-1 bg-background border-border text-foreground"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Max</Label>
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || priceRangeBounds[1]])}
                          min={priceRangeBounds[0]}
                          max={priceRangeBounds[1]}
                          className="mt-1 bg-background border-border text-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Filter */}
                {availableColors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Colors</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableColors.map((color) => (
                        <div key={color} className="flex items-center space-x-3">
                          <Checkbox
                            id={`color-${color}`}
                            checked={selectedColors.includes(color)}
                            onCheckedChange={() => handleColorToggle(color)}
                            className="flex-shrink-0"
                          />
                          <label
                            htmlFor={`color-${color}`}
                            className="text-sm text-foreground cursor-pointer flex-1 hover:text-primary transition-colors flex items-center gap-2"
                          >
                            <div
                              className="w-4 h-4 rounded-full border border-border"
                              style={{
                                backgroundColor: color.toLowerCase(),
                              }}
                            />
                            {color}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Filters Summary */}
                {activeFiltersCount > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Active Filters:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedCategories.filter(cat => cat !== 'all').map((categoryId) => {
                        const group = categoryGroups.find(g => 
                          g.subCategories.some(sc => sc.id === categoryId)
                        );
                        const subCat = group?.subCategories.find(sc => sc.id === categoryId);
                        return (
                          <Badge key={categoryId} variant="outline" className="text-xs">
                            {subCat?.label || categoryId}
                          </Badge>
                        );
                      })}
                      {selectedThemes.map(themeId => {
                        const theme = themes.find(t => t.id === themeId);
                        return (
                          <Badge key={themeId} variant="outline" className="text-xs">
                            {theme?.name || themeId}
                          </Badge>
                        );
                      })}
                      {selectedColors.map(color => (
                        <Badge key={color} variant="outline" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Products */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
                </h2>
                {(searchQuery || activeFiltersCount > 0) && (
                  <p className="text-sm text-muted-foreground">
                    {searchQuery && `Searching for "${searchQuery}"`}
                    {activeFiltersCount > 0 && ` • ${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`}
                  </p>
                )}
              </div>
              {/* Desktop Sort */}
              <div className="hidden lg:block">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-background border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>
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
