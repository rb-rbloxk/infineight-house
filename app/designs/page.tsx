'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Heart, 
  Download, 
  Share2, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Tag,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface Design {
  id: string;
  user_id: string;
  product_id: string | null;
  design_data: any;
  preview_url: string | null;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    category: string;
  };
}

interface SavedDesign {
  id: string;
  name: string;
  description: string;
  image_url: string;
  product_type: string;
  colors: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  design_data: any;
}

export default function SavedDesignsPage() {
  return (
    <AuthGuard>
      <SavedDesignsPageContent />
    </AuthGuard>
  );
}

function SavedDesignsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'T-Shirt', 'Hoodie', 'Mug', 'Custom'];

  // Fetch designs from Supabase
  useEffect(() => {
    if (!user) return;
    
    fetchDesigns();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('designs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'designs',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchDesigns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchDesigns = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('designs')
        .select(`
          id,
          user_id,
          product_id,
          design_data,
          preview_url,
          is_saved,
          created_at,
          updated_at,
          products (
            id,
            name,
            category
          )
        `)
        .eq('user_id', user.id)
        .eq('is_saved', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform the data to match our SavedDesign interface
      const transformedDesigns: SavedDesign[] = (data || []).map((design: Design) => {
        const designData = design.design_data || {};
        const productName = design.products?.name || 'Custom Design';
        
        return {
          id: design.id,
          name: designData.name || productName,
          description: designData.description || `Custom ${design.products?.category || 'design'} creation`,
          image_url: design.preview_url || '/images/placeholder-design.png',
          product_type: design.products?.category || 'Custom',
          colors: designData.colors || ['#000000', '#FFFFFF'],
          tags: designData.tags || [design.products?.category?.toLowerCase() || 'custom'],
          created_at: design.created_at,
          updated_at: design.updated_at,
          design_data: designData
        };
      });

      setDesigns(transformedDesigns);
    } catch (err: any) {
      console.error('Error fetching designs:', err);
      setError(err.message || 'Failed to load designs');
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || design.product_type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId)
        .eq('user_id', user!.id);

      if (error) throw error;

      toast.success('Design deleted successfully');
      setDesigns(prev => prev.filter(design => design.id !== designId));
    } catch (err: any) {
      console.error('Error deleting design:', err);
      toast.error(err.message || 'Failed to delete design');
    }
  };

  const handleDuplicateDesign = async (design: SavedDesign) => {
    try {
      const newDesignData = {
        ...design.design_data,
        name: `${design.name} (Copy)`,
      };

      const { data, error } = await supabase
        .from('designs')
        .insert({
          user_id: user!.id,
          product_id: null,
          design_data: newDesignData,
          preview_url: design.image_url,
          is_saved: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Design duplicated successfully');
      fetchDesigns(); // Refresh the list
    } catch (err: any) {
      console.error('Error duplicating design:', err);
      toast.error(err.message || 'Failed to duplicate design');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading designs...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <Card className="w-full max-w-md bg-card border-border text-center">
          <CardHeader>
            <CardTitle className="text-foreground">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to view your saved designs.
            </p>
            <Link href="/auth/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2 flex items-center">
              <Palette className="h-8 w-8 mr-3" />
              Saved Designs
            </h1>
            <p className="text-muted-foreground">
              Manage and organize your custom design creations
            </p>
          </div>

          {/* Search and Filter Bar */}
          <Card className="bg-card border-border mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search designs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category)}
                      className={`${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-background text-foreground hover:bg-secondary border-border'
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('grid')}
                    size="sm"
                    className={`${
                      viewMode === 'grid'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-background text-foreground hover:bg-secondary border-border'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    size="sm"
                    className={`${
                      viewMode === 'list'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-background text-foreground hover:bg-secondary border-border'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create New Design Button */}
          <div className="mb-6">
            <Link href="/customise">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Create New Design
              </Button>
            </Link>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="bg-destructive/10 border-destructive/50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Error loading designs</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                  <Button
                    onClick={fetchDesigns}
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Designs Grid/List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your designs...</p>
            </div>
          ) : filteredDesigns.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="text-center py-12">
                <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No designs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'All' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start creating your first custom design!'
                  }
                </p>
                <Link href="/customise">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Design
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }`}>
              {filteredDesigns.map((design) => (
                <Card key={design.id} className="bg-card border-border hover:border-primary transition-colors">
                  <CardContent className="p-0">
                    {/* Design Image */}
                    <div className="relative aspect-square bg-muted rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <Palette className="h-16 w-16 text-primary/50" />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                          onClick={() => handleDuplicateDesign(design)}
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                          onClick={() => handleDeleteDesign(design.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Design Info */}
                      <div className="mb-3">
                        <h3 className="font-semibold text-foreground mb-1">{design.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{design.description}</p>
                      </div>

                      {/* Product Type */}
                      <div className="mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {design.product_type}
                        </Badge>
                      </div>

                      {/* Color Palette */}
                      <div className="mb-3">
                        <div className="flex gap-1">
                          {design.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {design.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {design.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{design.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/customise?edit=${design.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-foreground hover:bg-secondary">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/customise?duplicate=${design.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-foreground hover:bg-secondary">
                            <Download className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </Link>
                      </div>

                      {/* Created Date */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Created {new Date(design.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && designs.length > 0 && (
            <Card className="bg-card border-border mt-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{designs.length}</p>
                    <p className="text-sm text-muted-foreground">Total Designs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {new Set(designs.map(d => d.product_type)).size}
                    </p>
                    <p className="text-sm text-muted-foreground">Product Types</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {new Set(designs.flatMap(d => d.tags)).size}
                    </p>
                    <p className="text-sm text-muted-foreground">Unique Tags</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}