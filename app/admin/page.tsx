'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminGuard } from '@/components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Users, 
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Save,
  Search,
  Filter,
  Download,
  RefreshCw,
  Shield,
  UserPlus,
  UserMinus,
  Mail,
  Calendar,
  XCircle,
  Activity,
  DollarSign,
  Package2,
  Clock,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  base_price: number;
  base_image_url: string;
  image_urls: string[]; // Array of image URLs
  available_colors: string[];
  available_sizes: string[];
  is_customizable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

interface CorporateEnquiry {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  product_interest: string;
  quantity: number;
  budget_range: string;
  message: string;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean | string | null;
  created_at: string;
  updated_at: string;
}

interface AnalyticsData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalEnquiries: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  monthlyUsers: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{ name: string; orders: number; revenue: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  revenueGrowth: Array<{ month: string; revenue: number }>;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockItems: number;
  pendingOrders: number;
  monthlyGrowth: number;
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}

function AdminDashboardContent() {
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiries, setEnquiries] = useState<CorporateEnquiry[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    monthlyGrowth: 0
  });

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    categories: [] as string[],
    basePrice: '',
    availableColors: [] as string[],
    availableSizes: [] as string[],
    isCustomizable: false,
    isActive: true,
    imageUrls: ['', '', '', ''] as string[]
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Predefined options for colors and sizes
  const predefinedColors = [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Gray', 'Navy', 'Maroon', 'Teal', 'Cream', 'Beige', 'Khaki', 'Burgundy', 'Royal Blue', 'Forest Green', 'Coral', 'Lavender', 'Turquoise', 'Gold', 'Silver'
  ];

  const predefinedSizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60', '62', '64', '66', '68', '70', '72', '74', '76', '78', '80', '82', '84', '86', '88', '90', '92', '94', '96', '98', '100', '102', '104', '106', '108', '110', '112', '114', '116', '118', '120', '122', '124', '126', '128', '130', '132', '134', '136', '138', '140', '142', '144', '146', '148', '150', '152', '154', '156', '158', '160', '162', '164', '166', '168', '170', '172', '174', '176', '178', '180', '182', '184', '186', '188', '190', '192', '194', '196', '198', '200'
  ];

  const predefinedCategories = [
    'Apparel & Fashion',
    'Men\'s Apparel',
    'Women\'s Apparel',
    'Unisex & Custom Wear',
    'Gifting & Hampers',
    'Chocolates & Sweets',
    'Mugs, Bottles & Drinkware',
    'Snack & Gourmet Hampers',
    'Luxury Gift Sets',
    'Corporate Kits & Sets',
    'Employee Onboarding Kits',
    'Recognition & Reward Kits',
    'Event & Conference Kits',
    'Work-From-Home Kits',
    'Custom Branding Solutions',
    'Seasonal & Festive Collections',
    'Eco-Friendly & Sustainable Gifts',
    'Accessories & Essentials'
  ];

  // Check if user is admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (user && profile) {
        // Double-check admin status from database
        const { data: currentProfile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error || !currentProfile?.is_admin) {
          toast.error('Access denied. Admin privileges required.');
          // Sign out and redirect
          await supabase.auth.signOut();
          window.location.href = '/';
          return;
        }
        
        setIsLoading(false);
        loadDashboardData();
      } else if (user && !profile) {
        // Still loading profile
      } else {
        // Not logged in
        window.location.href = '/auth/login';
      }
    };

    checkAdminAccess();
  }, [user, profile]);

  const loadDashboardData = async () => {
    try {
      // Use Promise.all to fetch all data in parallel for faster loading
      const [productsResult, ordersResult, enquiriesResult, usersResult] = await Promise.all([
        // Fetch products from database
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }),
        
        // Fetch orders from database
        supabase
          .from('orders')
          .select(`
            *,
            profiles:user_id(email)
          `)
          .order('created_at', { ascending: false }),
        
        // Fetch corporate enquiries
        supabase
          .from('corporate_enquiries')
          .select('*')
          .order('created_at', { ascending: false }),
        
        // Fetch users using API route (bypasses RLS)
        fetch('/api/admin/users').then(res => res.json())
      ]);

      // Handle products
      if (productsResult.error) throw productsResult.error;
      setProducts(productsResult.data || []);

      // Handle orders
      if (ordersResult.error) throw ordersResult.error;
      const formattedOrders = (ordersResult.data || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number,
        customerEmail: order.profiles?.email || 'Unknown',
        status: order.status,
        totalAmount: order.total_amount,
        itemCount: 0, // This would need to be calculated from order_items
        createdAt: order.created_at
      }));
      setOrders(formattedOrders);

      // Handle enquiries
      if (enquiriesResult.error) throw enquiriesResult.error;
      setEnquiries(enquiriesResult.data || []);

      // Handle users
      if (!usersResult.users) {
        console.error('Users API Error:', usersResult);
        throw new Error(usersResult.error || 'Failed to fetch users');
      }
      setUsers(usersResult.users || []);

      // Calculate analytics and stats in parallel
      const [analyticsData, statsData] = await Promise.all([
        calculateAnalytics(productsResult.data || [], formattedOrders, enquiriesResult.data || [], usersResult.users || []),
        Promise.resolve({
          totalProducts: productsResult.data?.length || 0,
          totalOrders: formattedOrders.length,
          totalRevenue: formattedOrders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0),
          lowStockItems: 0, // This would need inventory tracking
          pendingOrders: formattedOrders.filter((o: Order) => o.status === 'pending').length,
          monthlyGrowth: 15.5 // This would need historical data
        })
      ]);

      setAnalytics(analyticsData);
      setStats(statsData);

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('Invalid API key')) {
        toast.error('Supabase configuration error. Please check your API keys.');
      } else if (error.message?.includes('Failed to fetch users')) {
        toast.error('Unable to load user data. Check admin permissions.');
      } else {
        toast.error(`Failed to load dashboard data: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Helper function to check if user is admin
  const isUserAdmin = (user: UserProfile): boolean => {
    return user.is_admin === true || user.is_admin === 'true';
  };

  // Helper function to check if user is regular
  const isUserRegular = (user: UserProfile): boolean => {
    return user.is_admin === false || user.is_admin === 'false' || user.is_admin === null || user.is_admin === undefined;
  };

  // Calculate analytics data (optimized for performance)
  const calculateAnalytics = async (products: Product[], orders: Order[], enquiries: CorporateEnquiry[], users: UserProfile[]): Promise<AnalyticsData> => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter monthly data
    const monthlyOrders = orders.filter(order => new Date(order.createdAt) >= currentMonth);
    const monthlyUsers = users.filter(user => new Date(user.created_at) >= currentMonth);
    
    // Calculate revenue metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const conversionRate = users.length > 0 ? (orders.length / users.length) * 100 : 0;

    // Get real top products from order_items
    try {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, unit_price, product:products(name)');

      // Calculate product performance
      const productStats = new Map<string, { name: string; orders: number; revenue: number }>();
      
      orderItems?.forEach((item: any) => {
        const productId = item.product_id;
        const productName = item.product?.name || 'Unknown Product';
        const revenue = item.unit_price * item.quantity;
        
        if (productStats.has(productId)) {
          const stats = productStats.get(productId)!;
          stats.orders += item.quantity;
          stats.revenue += revenue;
        } else {
          productStats.set(productId, {
            name: productName,
            orders: item.quantity,
            revenue: revenue
          });
        }
      });

      // Sort by revenue and get top 5
      const topProducts = Array.from(productStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate real user growth for last 6 months
      const userGrowth = Array.from({ length: 6 }, (_, i) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - 4 + i, 0, 23, 59, 59);
        
        const usersInMonth = users.filter(user => {
          const createdAt = new Date(user.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length;

        return {
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          users: usersInMonth
        };
      });

      // Calculate real revenue growth for last 6 months
      const revenueGrowth = Array.from({ length: 6 }, (_, i) => {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - 4 + i, 0, 23, 59, 59);
        
        const revenueInMonth = orders
          .filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= monthStart && orderDate <= monthEnd;
          })
          .reduce((sum, order) => sum + order.totalAmount, 0);

        return {
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          revenue: revenueInMonth
        };
      });

      return {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalEnquiries: enquiries.length,
        monthlyRevenue,
        monthlyOrders: monthlyOrders.length,
        monthlyUsers: monthlyUsers.length,
        averageOrderValue,
        conversionRate,
        topProducts: topProducts.length > 0 ? topProducts : [{
          name: 'No sales yet',
          orders: 0,
          revenue: 0
        }],
        userGrowth,
        revenueGrowth
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      
      // Return basic analytics if detailed calculation fails
      return {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalEnquiries: enquiries.length,
        monthlyRevenue,
        monthlyOrders: monthlyOrders.length,
        monthlyUsers: monthlyUsers.length,
        averageOrderValue,
        conversionRate,
        topProducts: [{
          name: 'Data unavailable',
          orders: 0,
          revenue: 0
        }],
        userGrowth: [],
        revenueGrowth: []
      };
    }
  };

  // User management functions
  const promoteToAdmin = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isAdmin: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to promote user');
      }

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: true } : u));
      toast.success('User promoted to admin successfully');
    } catch (error) {
      toast.error('Failed to promote user to admin');
    }
  };

  const demoteFromAdmin = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isAdmin: false }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to demote user');
      }

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: false } : u));
      toast.success('User demoted from admin successfully');
    } catch (error) {
      toast.error('Failed to demote user from admin');
    }
  };

  const handleAddProduct = async () => {
    // Validate required fields
    if (!productForm.name?.trim()) {
      toast.error('Product Name is required');
      return;
    }
    if (productForm.categories.length === 0) {
      toast.error('At least one category is required');
      return;
    }
    if (!productForm.basePrice || parseFloat(productForm.basePrice) <= 0) {
      toast.error('Base Price must be greater than 0');
      return;
    }
    if (productForm.availableColors.length === 0) {
      toast.error('Please add at least one color');
      return;
    }
    if (productForm.availableSizes.length === 0) {
      toast.error('Please add at least one size');
      return;
    }

    try {
      // Filter out empty image URLs and ensure at least one image
      const validImageUrls = productForm.imageUrls.filter(url => url.trim() !== '');
      const imageUrls = validImageUrls.length > 0 ? validImageUrls : ['/images/products/placeholder.png'];
      const baseImageUrl = imageUrls[0];

      const { data, error} = await supabase
        .from('products')
        .insert({
          name: productForm.name,
          slug: productForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: productForm.description || '',
          category: productForm.categories[0], // Use first selected category
          base_price: parseFloat(productForm.basePrice),
          base_image_url: baseImageUrl,
          image_urls: imageUrls,
          available_colors: productForm.availableColors,
          available_sizes: productForm.availableSizes,
          is_customizable: productForm.isCustomizable,
          is_active: productForm.isActive
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh products list
      await loadDashboardData();
      
      // Reset form
      setProductForm({
        name: '',
        description: '',
        categories: [],
        basePrice: '',
        availableColors: [],
        availableSizes: [],
        isCustomizable: false,
        isActive: true,
        imageUrls: ['', '', '', '']
      });

      toast.success('Product added successfully!');
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    // Ensure we have 4 image slots, filling empty ones with empty strings
    const imageUrls = [...(product.image_urls || [])];
    while (imageUrls.length < 4) {
      imageUrls.push('');
    }
    
    setProductForm({
      name: product.name,
      description: product.description,
      categories: [product.category], // Convert single category to array
      basePrice: product.base_price.toString(),
      availableColors: product.available_colors,
      availableSizes: product.available_sizes,
      isCustomizable: product.is_customizable,
      isActive: product.is_active,
      imageUrls: imageUrls.slice(0, 4)
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      // Filter out empty image URLs and ensure at least one image
      const validImageUrls = productForm.imageUrls.filter(url => url.trim() !== '');
      const imageUrls = validImageUrls.length > 0 ? validImageUrls : [editingProduct.base_image_url];
      const baseImageUrl = imageUrls[0];

      const { error } = await supabase
        .from('products')
        .update({
          name: productForm.name,
          slug: productForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: productForm.description || '',
          category: productForm.categories[0], // Use first selected category
          base_price: parseFloat(productForm.basePrice),
          base_image_url: baseImageUrl,
          image_urls: imageUrls,
          available_colors: productForm.availableColors,
          available_sizes: productForm.availableSizes,
          is_customizable: productForm.isCustomizable,
          is_active: productForm.isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      // Refresh products list
      await loadDashboardData();
      
      setEditingProduct(null);
      
      // Reset form
      setProductForm({
        name: '',
        description: '',
        categories: [],
        basePrice: '',
        availableColors: [],
        availableSizes: [],
        isCustomizable: false,
        isActive: true,
        imageUrls: ['', '', '', '']
      });

      toast.success('Product updated successfully!');
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
    const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        if (error) throw error;

        // Refresh products list
        await loadDashboardData();
        
        toast.success('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };


  const handleUpdateStock = (productId: string, newStock: number) => {
    const updatedProducts = products.map(p => 
      p.id === productId 
        ? { ...p, stock: newStock, updatedAt: new Date().toISOString().split('T')[0] }
        : p
    );
    setProducts(updatedProducts);
    toast.success('Stock updated successfully!');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
          <div className="mt-4 space-y-2">
            <div className="w-64 bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground">Fetching data from Supabase...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage products, orders, and inventory</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={loadDashboardData} variant="outline" className="w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold text-primary">{stats.totalProducts}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
          </CardContent>
        </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-primary">{stats.totalOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
          </CardContent>
        </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-primary">${stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
          </CardContent>
        </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                    <p className="text-2xl font-bold text-primary">{stats.pendingOrders}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-orange-500" />
                </div>
          </CardContent>
        </Card>
      </div>

          {/* Low Stock Alert - Removed since stock management is not in database schema */}

          {/* Main Content Tabs */}
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="bg-secondary">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <Card className="bg-card border-border">
            <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-primary">Product Management</CardTitle>
                    <Button onClick={() => setEditingProduct(null)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
            </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-full sm:w-48 bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Apparel & Fashion">🧢 Apparel & Fashion</SelectItem>
                        <SelectItem value="Men's Apparel">👔 Men's Apparel</SelectItem>
                        <SelectItem value="Women's Apparel">👚 Women's Apparel</SelectItem>
                        <SelectItem value="Unisex & Custom Wear">👕 Unisex & Custom Wear</SelectItem>
                        <SelectItem value="Gifting & Hampers">🎁 Gifting & Hampers</SelectItem>
                        <SelectItem value="Chocolates & Sweets">🍫 Chocolates & Sweets</SelectItem>
                        <SelectItem value="Mugs, Bottles & Drinkware">☕ Mugs, Bottles & Drinkware</SelectItem>
                        <SelectItem value="Snack & Gourmet Hampers">🍪 Snack & Gourmet Hampers</SelectItem>
                        <SelectItem value="Luxury Gift Sets">🌸 Luxury Gift Sets</SelectItem>
                        <SelectItem value="Corporate Kits & Sets">💼 Corporate Kits & Sets</SelectItem>
                        <SelectItem value="Employee Onboarding Kits">👋 Employee Onboarding Kits</SelectItem>
                        <SelectItem value="Recognition & Reward Kits">🏆 Recognition & Reward Kits</SelectItem>
                        <SelectItem value="Event & Conference Kits">🎊 Event & Conference Kits</SelectItem>
                        <SelectItem value="Work-From-Home Kits">🖥️ Work-From-Home Kits</SelectItem>
                        <SelectItem value="Custom Branding Solutions">🖋️ Custom Branding Solutions</SelectItem>
                        <SelectItem value="Seasonal & Festive Collections">🪄 Seasonal & Festive Collections</SelectItem>
                        <SelectItem value="Eco-Friendly & Sustainable Gifts">♻️ Eco-Friendly & Sustainable Gifts</SelectItem>
                        <SelectItem value="Accessories & Essentials">🏷️ Accessories & Essentials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product Form */}
                  <Card className="bg-secondary border-border">
            <CardHeader>
                      <CardTitle className="text-primary">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </CardTitle>
            </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Required Fields - Always Visible */}
                      <div className="grid grid-cols-1 gap-4">
                  <div>
                          <Label className="text-foreground">Product Name *</Label>
                    <Input
                      value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                            className="bg-background border-border text-foreground"
                            placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                          <Label className="text-foreground">Categories *</Label>
                          <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-background">
                            <div className="grid grid-cols-1 gap-2">
                              {predefinedCategories.map((category) => (
                                <div key={category} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`category-${category}`}
                                    checked={productForm.categories.includes(category)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setProductForm({
                                          ...productForm,
                                          categories: [...productForm.categories, category]
                                        });
                                      } else {
                                        setProductForm({
                                          ...productForm,
                                          categories: productForm.categories.filter(c => c !== category)
                                        });
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`category-${category}`} className="text-sm text-foreground cursor-pointer">
                                    {category}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {productForm.categories.map((category, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Select one or more categories. First selected will be the primary category.</p>
                        </div>
                </div>

                      {/* Additional Fields */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-foreground">Base Price (₹) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={productForm.basePrice}
                            onChange={(e) => setProductForm({...productForm, basePrice: e.target.value})}
                            className="bg-background border-border text-foreground"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-foreground">Product Images (Max 4)</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            {productForm.imageUrls.map((url, index) => (
                              <div key={index} className="space-y-2">
                                <Input
                                  type="url"
                                  value={url}
                                  onChange={(e) => {
                                    const newImageUrls = [...productForm.imageUrls];
                                    newImageUrls[index] = e.target.value;
                                    setProductForm({...productForm, imageUrls: newImageUrls});
                                  }}
                                  className="bg-background border-border text-foreground"
                                  placeholder={`Image ${index + 1} URL (optional)`}
                                />
                                {url && (
                                  <div className="w-full h-24 border border-border rounded-lg overflow-hidden bg-secondary">
                                    <img
                                      src={url}
                                      alt={`Product preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/images/products/placeholder.png';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Enter up to 4 image URLs. First image will be the primary image.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="customizable"
                            checked={productForm.isCustomizable}
                            onChange={(e) => setProductForm({...productForm, isCustomizable: e.target.checked})}
                            className="rounded border-border"
                          />
                          <Label htmlFor="customizable" className="text-foreground">Customizable</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="active"
                            checked={productForm.isActive}
                            onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})}
                            className="rounded border-border"
                          />
                          <Label htmlFor="active" className="text-foreground">Active</Label>
                        </div>
                      </div>
                      <div>
                        <Label className="text-foreground">Description</Label>
                        <Textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          className="bg-background border-border text-foreground"
                          placeholder="Enter product description"
                          rows={3}
                        />
                      </div>

                      {/* Colors and Sizes */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-foreground">Available Colors *</Label>
                          <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-background">
                            <div className="grid grid-cols-2 gap-2">
                              {predefinedColors.map((color) => (
                                <div key={color} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`color-${color}`}
                                    checked={productForm.availableColors.includes(color)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setProductForm({
                                          ...productForm,
                                          availableColors: [...productForm.availableColors, color]
                                        });
                                      } else {
                                        setProductForm({
                                          ...productForm,
                                          availableColors: productForm.availableColors.filter(c => c !== color)
                                        });
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`color-${color}`} className="text-sm text-foreground cursor-pointer">
                                    {color}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {productForm.availableColors.map((color, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Select colors from the list above</p>
                        </div>

                        <div>
                          <Label className="text-foreground">Available Sizes *</Label>
                          <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-background">
                            <div className="grid grid-cols-3 gap-2">
                              {predefinedSizes.map((size) => (
                                <div key={size} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`size-${size}`}
                                    checked={productForm.availableSizes.includes(size)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setProductForm({
                                          ...productForm,
                                          availableSizes: [...productForm.availableSizes, size]
                                        });
                                      } else {
                                        setProductForm({
                                          ...productForm,
                                          availableSizes: productForm.availableSizes.filter(s => s !== size)
                                        });
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`size-${size}`} className="text-sm text-foreground cursor-pointer">
                                    {size}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {productForm.availableSizes.map((size, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {size}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Select sizes from the list above</p>
                        </div>
                      </div>


                      <div className="flex gap-2">
                        {editingProduct ? (
                          <>
                            <Button onClick={handleUpdateProduct} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              <Save className="h-4 w-4 mr-2" />
                              Update Product
                            </Button>
                            <Button onClick={() => setEditingProduct(null)} variant="outline">
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Products List */}
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="bg-card border-border">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                              <div className="flex gap-1">
                                {(product.image_urls || [product.base_image_url]).slice(0, 3).map((imageUrl, index) => (
                                  <img
                                    key={index}
                                    src={imageUrl || '/images/products/placeholder.png'}
                                    alt={`${product.name} ${index + 1}`}
                                    className="w-12 h-12 object-cover rounded border"
                                  />
                                ))}
                                {(product.image_urls || []).length > 3 && (
                                  <div className="w-12 h-12 bg-secondary border rounded flex items-center justify-center text-xs text-muted-foreground">
                                    +{(product.image_urls || []).length - 3}
                                  </div>
                                )}
                              </div>
                  <div className="flex-1">
                                <h3 className="font-semibold text-foreground">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                  <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                                    {product.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                  {product.is_customizable && (
                                    <Badge variant="outline" className="text-xs">Customizable</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                              <div className="text-left sm:text-right">
                                <p className="font-semibold text-primary">₹{product.base_price.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">
                                  Colors: {product.available_colors?.length || 0} | 
                                  Sizes: {product.available_sizes?.length || 0}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditProduct(product)}
                                  className="flex-1 sm:flex-none"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="flex-1 sm:flex-none"
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
            </CardContent>
          </Card>
        </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card className="bg-card border-border">
            <CardHeader>
                  <CardTitle className="text-primary">Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="bg-secondary border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                      <div>
                              <h3 className="font-semibold text-foreground">#{order.orderNumber}</h3>
                              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                              <p className="text-sm text-muted-foreground">{order.itemCount} items</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">${order.totalAmount}</p>
                              <Badge variant="outline" className="text-xs">{order.status}</Badge>
                              <p className="text-sm text-muted-foreground">{order.createdAt}</p>
                            </div>
                      </div>
                        </CardContent>
                      </Card>
                    ))}
                    </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enquiries Tab */}
            <TabsContent value="enquiries" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary">Corporate Enquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enquiries.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No Enquiries Yet</h3>
                        <p className="text-muted-foreground">
                          Corporate enquiries will appear here when customers submit them.
                        </p>
                      </div>
                    ) : (
                      enquiries.map((enquiry) => (
                        <Card key={enquiry.id} className="bg-secondary border-border">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-foreground text-lg">{enquiry.company_name}</h3>
                                <p className="text-sm text-muted-foreground">{enquiry.contact_person}</p>
                                <p className="text-sm text-muted-foreground">{enquiry.email}</p>
                                {enquiry.phone && (
                                  <p className="text-sm text-muted-foreground">{enquiry.phone}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    enquiry.status === 'new' ? 'bg-blue-500/10 text-blue-500 border-blue-500' :
                                    enquiry.status === 'contacted' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500' :
                                    enquiry.status === 'quoted' ? 'bg-green-500/10 text-green-500 border-green-500' :
                                    'bg-gray-500/10 text-gray-500 border-gray-500'
                                  }`}
                                >
                                  {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {new Date(enquiry.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium text-foreground mb-1">Product Interest</h4>
                                <p className="text-sm text-muted-foreground">
                                  {enquiry.product_interest || 'Not specified'}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground mb-1">Quantity</h4>
                                <p className="text-sm text-muted-foreground">
                                  {enquiry.quantity ? enquiry.quantity.toLocaleString() : 'Not specified'}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground mb-1">Budget Range</h4>
                                <p className="text-sm text-muted-foreground">
                                  {enquiry.budget_range || 'Not specified'}
                                </p>
                              </div>
                            </div>

                            {enquiry.message && (
                              <div className="mb-4">
                                <h4 className="font-medium text-foreground mb-1">Additional Details</h4>
                                <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
                                  {enquiry.message}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Select
                                value={enquiry.status}
                                onValueChange={async (newStatus) => {
                                  try {
                                    const { error } = await supabase
                                      .from('corporate_enquiries')
                                      .update({ 
                                        status: newStatus,
                                        updated_at: new Date().toISOString()
                                      })
                                      .eq('id', enquiry.id);

                                    if (error) throw error;

                                    setEnquiries(prev => 
                                      prev.map(e => 
                                        e.id === enquiry.id 
                                          ? { ...e, status: newStatus as any, updated_at: new Date().toISOString() }
                                          : e
                                      )
                                    );
                                    toast.success('Status updated successfully');
                                  } catch (error) {
                                    toast.error('Failed to update status');
                                  }
                                }}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="quoted">Quoted</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const subject = `Re: Corporate Enquiry from ${enquiry.company_name}`;
                                  const body = `Hi ${enquiry.contact_person},\n\nThank you for your enquiry. We will get back to you soon.\n\nBest regards,\nInfineight Team`;
                                  window.open(`mailto:${enquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                                }}
                              >
                                Reply
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab - Removed since stock management is not in database schema */}

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* User Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                    <Card className="bg-secondary border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                            <p className="text-2xl font-bold text-primary">{users.length}</p>
                          </div>
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-secondary border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Admin Users</p>
                            <p className="text-2xl font-bold text-primary">
                              {users.filter(isUserAdmin).length}
                            </p>
                          </div>
                          <Shield className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-secondary border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Regular Users</p>
                            <p className="text-2xl font-bold text-primary">
                              {users.filter(isUserRegular).length}
                            </p>
                          </div>
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Users List */}
                  <div className="space-y-4">
                    {users.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No Users Found</h3>
                        <p className="text-muted-foreground">
                          Users will appear here when they register.
                        </p>
                      </div>
                    ) : (
                      users.map((userProfile) => (
                        <Card key={userProfile.id} className="bg-secondary border-border">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  {isUserAdmin(userProfile) ? (
                                    <Shield className="h-6 w-6 text-primary" />
                                  ) : (
                                    <Users className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground text-lg">
                                    {userProfile.full_name || 'No Name'}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                                  {userProfile.phone && (
                                    <p className="text-sm text-muted-foreground">{userProfile.phone}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    isUserAdmin(userProfile)
                                      ? 'bg-primary/10 text-primary border-primary' 
                                      : 'bg-secondary text-muted-foreground border-border'
                                  }`}
                                >
                                  {isUserAdmin(userProfile) ? 'Admin' : 'User'}
                                </Badge>
                                <div className="flex gap-2">
                                  {isUserAdmin(userProfile) ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => demoteFromAdmin(userProfile.id)}
                                      className="text-orange-600 hover:text-orange-700"
                                    >
                                      <UserMinus className="h-4 w-4 mr-1" />
                                      Demote
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => promoteToAdmin(userProfile.id)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <UserPlus className="h-4 w-4 mr-1" />
                                      Promote
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const subject = `Message from Infineight Admin`;
                                      const body = `Hi ${userProfile.full_name || 'there'},\n\nI hope this message finds you well.\n\nBest regards,\nInfineight Team`;
                                      window.open(`mailto:${userProfile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                                    }}
                                  >
                                    <Mail className="h-4 w-4 mr-1" />
                                    Email
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {analytics ? (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold text-primary">₹{analytics.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                            <p className="text-xs text-green-600">+₹{analytics.monthlyRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })} this month</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                            <p className="text-2xl font-bold text-primary">{analytics.totalOrders}</p>
                            <p className="text-xs text-green-600">+{analytics.monthlyOrders} this month</p>
                          </div>
                          <ShoppingCart className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Users</p>
                            <p className="text-2xl font-bold text-primary">{analytics.totalUsers}</p>
                            <p className="text-xs text-green-600">+{analytics.monthlyUsers} this month</p>
                          </div>
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Conversion Rate</p>
                            <p className="text-2xl font-bold text-primary">{analytics.conversionRate.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">Orders per user</p>
                          </div>
                          <Target className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Average Order Value</p>
                            <p className="text-2xl font-bold text-primary">₹{analytics.averageOrderValue.toFixed(2)}</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Products</p>
                            <p className="text-2xl font-bold text-primary">{analytics.totalProducts}</p>
                          </div>
                          <Package2 className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Active Enquiries</p>
                            <p className="text-2xl font-bold text-primary">{analytics.totalEnquiries}</p>
                          </div>
                          <Mail className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Products */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-primary">Top Performing Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.topProducts.map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">#{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground">{product.name}</h4>
                                <p className="text-sm text-muted-foreground">{product.orders} sold</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">₹{product.revenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                              <p className="text-sm text-muted-foreground">Revenue</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Growth Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-primary">User Growth</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics.userGrowth.map((data, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{data.month}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${(data.users / Math.max(...analytics.userGrowth.map(d => d.users))) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-foreground w-8 text-right">{data.users}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-primary">Revenue Growth</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics.revenueGrowth.map((data, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{data.month}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-secondary rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${analytics.revenueGrowth.length > 0 && Math.max(...analytics.revenueGrowth.map(d => d.revenue)) > 0 ? (data.revenue / Math.max(...analytics.revenueGrowth.map(d => d.revenue))) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-foreground w-20 text-right">₹{data.revenue.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="text-center py-8">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Loading Analytics...</h3>
                    <p className="text-muted-foreground">
                      Calculating analytics data...
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}