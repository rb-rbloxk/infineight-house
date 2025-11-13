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
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone,
  Mail,
  Calendar,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Palette,
  Type,
  Image as ImageIcon,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import jsPDF from 'jspdf';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  design_id?: string;
  quantity: number;
  unit_price: number;
  size: string;
  color: string;
  customization_details?: any;
  product?: {
    id: string;
    name: string;
    slug: string;
    base_image_url: string;
  };
  design?: {
    id: string;
    preview_url: string;
    design_data?: {
      elements?: any[];
      product?: any;
      canvasSettings?: any;
      timestamp?: string;
    };
  };
}

interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  shipping_address: any;
  notes?: string;
  status: 'pending' | 'confirmed' | 'printing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersPageContent />
    </AuthGuard>
  );
}

function OrdersPageContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOrder, setSearchOrder] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              slug,
              base_image_url
            ),
            design:designs (
              id,
              preview_url,
              design_data
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'printing': return 'bg-purple-500';
      case 'shipped': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'printing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const searchOrderByNumber = async () => {
    if (!searchOrder.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              slug,
              base_image_url
            ),
            design:designs (
              id,
              preview_url,
              design_data
            )
          )
        `)
        .eq('order_number', searchOrder.toUpperCase())
        .eq('user_id', user!.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Order not found. Please check your order number.');
        } else {
          throw error;
        }
      } else {
        setSelectedOrder(data);
        toast.success('Order found!');
      }
    } catch (error) {
      console.error('Error searching order:', error);
      toast.error('Failed to search order');
    } finally {
      setIsSearching(false);
    }
  };

  const refreshOrderStatus = async () => {
    if (!selectedOrder) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, updated_at')
        .eq('id', selectedOrder.id)
        .single();

      if (error) throw error;
      
      setSelectedOrder(prev => prev ? { ...prev, ...data } : null);
    toast.success('Order status refreshed');
    } catch (error) {
      console.error('Error refreshing order status:', error);
      toast.error('Failed to refresh order status');
    }
  };

  const downloadInvoice = async () => {
    if (!selectedOrder) return;
    
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set background color to #121212
      pdf.setFillColor(18, 18, 18); // #121212 in RGB
      pdf.rect(0, 0, 210, 297, 'F'); // Fill entire page
      
      // Set up fonts and colors for dark background
      pdf.setFont('helvetica');
      
      // Add logo
      try {
        const logoResponse = await fetch('/images/logo.png');
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoBlob);
        });
        
        // Add logo to PDF (top left)
        pdf.addImage(logoBase64 as string, 'PNG', 20, 15, 30, 15);
      } catch (logoError) {
        console.warn('Could not load logo, using text fallback:', logoError);
        // Fallback to text if logo fails
        pdf.setFontSize(24);
        pdf.setTextColor(246, 233, 207); // Primary color for dark background
        pdf.text('Infineight', 20, 30);
      }
      
      // Invoice title
      pdf.setFontSize(18);
      pdf.setTextColor(255, 255, 255); // White text for dark background
      pdf.text('INVOICE', 20, 45);
      
      // Invoice details
      pdf.setFontSize(10);
      pdf.setTextColor(200, 200, 200); // Light gray for labels
      pdf.text('Order Number:', 20, 60);
      pdf.text('Order Date:', 20, 67);
      pdf.text('Status:', 20, 74);
      
      pdf.setTextColor(255, 255, 255); // White text for values
      pdf.text(selectedOrder.order_number, 50, 60);
      pdf.text(new Date(selectedOrder.created_at).toLocaleDateString(), 50, 67);
      pdf.text(selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1), 50, 74);
      
      // Total amount (right side) with proper INR symbol
      pdf.setFontSize(16);
      pdf.setTextColor(246, 233, 207); // Primary color
      pdf.text(`Total: ₹${selectedOrder.total_amount.toFixed(2)}`, 150, 60);
      
      // Line separator (light gray for dark background)
      pdf.setDrawColor(100, 100, 100);
      pdf.line(20, 85, 190, 85);
      
      // Items table header
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Items', 20, 95);
      
      // Table headers
      pdf.setFontSize(9);
      pdf.setTextColor(200, 200, 200);
      pdf.text('Product', 20, 105);
      pdf.text('Size', 80, 105);
      pdf.text('Color', 100, 105);
      pdf.text('Qty', 120, 105);
      pdf.text('Price', 140, 105);
      pdf.text('Total', 160, 105);
      
      // Table header line
      pdf.line(20, 107, 190, 107);
      
      // Items data
      let yPosition = 115;
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      
      selectedOrder.order_items?.forEach((item) => {
        if (yPosition > 250) {
          pdf.addPage();
          // Set background for new page
          pdf.setFillColor(18, 18, 18);
          pdf.rect(0, 0, 210, 297, 'F');
          yPosition = 20;
        }
        
        const productName = item.product?.name || 'Product';
        const truncatedName = productName.length > 25 ? productName.substring(0, 22) + '...' : productName;
        
        pdf.text(truncatedName, 20, yPosition);
        pdf.text(item.size, 80, yPosition);
        pdf.text(item.color, 100, yPosition);
        pdf.text(item.quantity.toString(), 120, yPosition);
        pdf.text(`₹${item.unit_price.toFixed(2)}`, 140, yPosition);
        pdf.text(`₹${(item.unit_price * item.quantity).toFixed(2)}`, 160, yPosition);
        
        yPosition += 8;
      });
      
      // Total line
      pdf.setDrawColor(100, 100, 100);
      pdf.line(20, yPosition + 5, 190, yPosition + 5);
      
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Total Amount:', 120, yPosition + 15);
      pdf.setTextColor(246, 233, 207); // Primary color for total
      pdf.text(`₹${selectedOrder.total_amount.toFixed(2)}`, 160, yPosition + 15);
      
      // Shipping address
      yPosition += 35;
      if (yPosition > 250) {
        pdf.addPage();
        // Set background for new page
        pdf.setFillColor(18, 18, 18);
        pdf.rect(0, 0, 210, 297, 'F');
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Shipping Address:', 20, yPosition);
      
      pdf.setFontSize(10);
      pdf.setTextColor(200, 200, 200);
      yPosition += 10;
      
      if (selectedOrder.shipping_address) {
        pdf.setTextColor(255, 255, 255);
        pdf.text(selectedOrder.shipping_address.fullName || 'N/A', 20, yPosition);
        yPosition += 7;
        pdf.text(selectedOrder.shipping_address.address || 'N/A', 20, yPosition);
        yPosition += 7;
        pdf.text(`${selectedOrder.shipping_address.city || 'N/A'}, ${selectedOrder.shipping_address.state || 'N/A'} ${selectedOrder.shipping_address.pincode || 'N/A'}`, 20, yPosition);
        yPosition += 7;
        pdf.text('India', 20, yPosition);
      }
      
      // Footer
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Thank you for your order!', 20, pageHeight - 20);
      pdf.text('For support, contact us at support@Infineight.house', 20, pageHeight - 15);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 10);
      
      // Download the PDF
      pdf.save(`invoice-${selectedOrder.order_number}.pdf`);
      
      toast.success('PDF invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF invoice:', error);
      toast.error('Failed to generate PDF invoice');
    }
  };

  const contactSupport = () => {
    const phoneNumber = '+91 9449183434'; // Replace with your actual support number
    const message = selectedOrder 
      ? `Hi, I need support for my order #${selectedOrder.order_number}.`
      : 'Hi, I need support with my order.';
    
    // Create WhatsApp link
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    toast.success('Opening WhatsApp support...');
  };

  const emailSupport = () => {
    const supportEmail = 'support@Infineight.house'; // Replace with your actual support email
    const subject = selectedOrder 
      ? `Support Request - Order #${selectedOrder.order_number}`
      : 'Support Request';
    
    const body = selectedOrder 
      ? `Hi,\n\nI need support regarding my order #${selectedOrder.order_number}.\n\nOrder Details:\n- Order Number: ${selectedOrder.order_number}\n- Order Date: ${new Date(selectedOrder.created_at).toLocaleDateString()}\n- Total Amount: ₹${selectedOrder.total_amount.toFixed(2)}\n- Status: ${selectedOrder.status}\n\nPlease describe your issue:\n\nThank you!`
      : `Hi,\n\nI need support with my order.\n\nPlease describe your issue:\n\nThank you!`;
    
    // Create mailto link
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoUrl;
    
    toast.success('Opening email client...');
  };

  const getEstimatedDelivery = (orderDate: string) => {
    const order = new Date(orderDate);
    const delivery = new Date(order.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    return delivery.toLocaleDateString();
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending': return 'Order placed and awaiting confirmation';
      case 'confirmed': return 'Payment confirmed and order processing started';
      case 'printing': return 'Your custom designs are being printed';
      case 'shipped': return 'Order shipped and in transit';
      case 'delivered': return 'Order delivered successfully';
      case 'cancelled': return 'Order has been cancelled';
      default: return 'Order status unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-foreground">Loading orders...</span>
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
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-primary mb-2">Please Login</h2>
              <p className="text-muted-foreground mb-6">
                You need to be logged in to view your orders.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link 
              href="/profile"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Profile
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Orders</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Order Tracking</h1>
            <p className="text-muted-foreground">
              Track your orders and stay updated on delivery status
            </p>
          </div>

          {/* Search Order */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Search className="h-5 w-5" />
                Track Your Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-foreground">Order Number</Label>
                  <Input
                    placeholder="Enter your order number (e.g., HS20250119001)"
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={searchOrderByNumber}
                    disabled={isSearching}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSearching ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {isSearching ? 'Searching...' : 'Track Order'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-primary">
                        Order #{selectedOrder.order_number}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </Badge>
                      <p className="text-primary font-semibold mt-1">
                        ₹{selectedOrder.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                        <p className="text-foreground font-medium">
                          {getEstimatedDelivery(selectedOrder.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Shipping To</p>
                        <p className="text-foreground font-medium">
                          {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="border border-border rounded-lg overflow-hidden">
                        <div className="flex items-center gap-4 p-4">
                          <img
                            src={item.product?.base_image_url || item.design?.preview_url || '/images/placeholder-product.png'}
                            alt={item.product?.name || 'Product'}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{item.product?.name || 'Product'}</h3>
                            <p className="text-sm text-muted-foreground">
                              Size: {item.size} • Color: {item.color}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × ₹{item.unit_price.toFixed(2)}
                            </p>
                            {item.design && (
                              <Badge variant="outline" className="mt-2 border-primary text-primary">
                                <Palette className="h-3 w-3 mr-1" />
                                Custom Design
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              ₹{(item.unit_price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Custom Design Details */}
                        {item.design && item.design.design_data && (
                          <div className="border-t border-border bg-muted/20 p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-1">Custom Design Details</h4>
                                <p className="text-xs text-muted-foreground">
                                  Design ID: {item.design.id.slice(0, 8)}...
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (!item.design) return;
                                  // Download design data as JSON
                                  const dataStr = JSON.stringify(item.design.design_data, null, 2);
                                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                  const url = URL.createObjectURL(dataBlob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `design-${item.design.id}.json`;
                                  link.click();
                                  URL.revokeObjectURL(url);
                                  toast.success('Design data downloaded');
                                }}
                                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download Design
                              </Button>
                            </div>
                            
                            {/* Design Elements Summary */}
                            {item.design.design_data.elements && item.design.design_data.elements.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-foreground">
                                  Design Elements ({item.design.design_data.elements.length}):
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {item.design.design_data.elements.map((element: any, idx: number) => (
                                    <div key={idx} className="bg-background/50 rounded p-2 text-xs">
                                      <div className="flex items-center gap-1 mb-1">
                                        {element.type === 'text' && <Type className="h-3 w-3 text-primary" />}
                                        {element.type === 'image' && <ImageIcon className="h-3 w-3 text-primary" />}
                                        {element.type === 'shape' && <Square className="h-3 w-3 text-primary" />}
                                        <span className="font-medium text-foreground capitalize">{element.type}</span>
                                      </div>
                                      {element.type === 'text' && (
                                        <p className="text-muted-foreground truncate">"{element.content}"</p>
                                      )}
                                      {element.type === 'image' && (
                                        <p className="text-muted-foreground">Image uploaded</p>
                                      )}
                                      {element.type === 'shape' && (
                                        <p className="text-muted-foreground capitalize">{element.shapeType || 'Shape'}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Design Metadata */}
                            {item.design.design_data.product && (
                              <div className="mt-3 pt-3 border-t border-border">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-medium text-foreground">Product:</span> {item.design.design_data.product.name} 
                                  {item.design.design_data.product.colorName && ` • ${item.design.design_data.product.colorName}`}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-primary">Order Status</CardTitle>
                    <Button onClick={refreshOrderStatus} variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${getStatusColor(selectedOrder.status)} text-white`}>
                        {getStatusIcon(selectedOrder.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground capitalize">
                            {selectedOrder.status.replace('_', ' ')}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                            {new Date(selectedOrder.updated_at).toLocaleString()}
                      </span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                          {getStatusDescription(selectedOrder.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-foreground font-medium">{selectedOrder.shipping_address?.fullName}</p>
                    <p className="text-muted-foreground">{selectedOrder.shipping_address?.address}</p>
                    <p className="text-muted-foreground">
                      {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.pincode}
                    </p>
                    <p className="text-muted-foreground">India</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button onClick={downloadInvoice} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                <Button onClick={contactSupport} variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button onClick={emailSupport} variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {!selectedOrder && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-6">
                        You haven't placed any orders yet. Start shopping to see your orders here.
                      </p>
                      <Link href="/shop">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          Start Shopping
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getStatusColor(order.status)} text-white`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">#{order.order_number}</h3>
                          <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()} • ₹{order.total_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}