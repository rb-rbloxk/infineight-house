'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  Users, 
  Package, 
  Percent, 
  DollarSign,
  Download,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Info,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import jsPDF from 'jspdf';

interface BulkOrderItem {
  id: string;
  product: string;
  category: string;
  basePrice: number;
  quantity: number;
  customization: boolean;
  rushOrder: boolean;
}

interface PricingTier {
  minQuantity: number;
  maxQuantity: number;
  discount: number;
  label: string;
}

export default function BulkCalculatorPage() {
  return (
    <AuthGuard>
      <BulkCalculatorPageContent />
    </AuthGuard>
  );
}

function BulkCalculatorPageContent() {
  const { user } = useAuth();
  const [orderItems, setOrderItems] = useState<BulkOrderItem[]>([
    {
      id: '1',
      product: 'Classic T-Shirt',
      category: 'Apparel',
      basePrice: 399,
      quantity: 50,
      customization: true,
      rushOrder: false
    }
  ]);

  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    budget: '',
    requirements: ''
  });

  const [discountCode, setDiscountCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const products = [
    { name: 'Classic T-Shirt', category: 'Apparel', basePrice: 399 },
    { name: 'Premium T-Shirt', category: 'Apparel', basePrice: 599 },
    { name: 'Hoodie', category: 'Apparel', basePrice: 899 },
    { name: 'Polo Shirt', category: 'Apparel', basePrice: 699 },
    { name: 'Custom Mug', category: 'Gifts', basePrice: 199 },
    { name: 'Tote Bag', category: 'Gifts', basePrice: 299 },
    { name: 'Water Bottle', category: 'Gifts', basePrice: 399 },
    { name: 'Notebook', category: 'Gifts', basePrice: 149 },
    { name: 'Pen Set', category: 'Gifts', basePrice: 249 }
  ];

  const pricingTiers: PricingTier[] = [
    { minQuantity: 1, maxQuantity: 24, discount: 0, label: 'Standard' },
    { minQuantity: 25, maxQuantity: 49, discount: 5, label: 'Small Bulk' },
    { minQuantity: 50, maxQuantity: 99, discount: 10, label: 'Medium Bulk' },
    { minQuantity: 100, maxQuantity: 249, discount: 15, label: 'Large Bulk' },
    { minQuantity: 250, maxQuantity: 499, discount: 20, label: 'XL Bulk' },
    { minQuantity: 500, maxQuantity: 999, discount: 25, label: 'XXL Bulk' },
    { minQuantity: 1000, maxQuantity: Infinity, discount: 30, label: 'Enterprise' }
  ];

  const addItem = () => {
    const newItem: BulkOrderItem = {
      id: Date.now().toString(),
      product: 'Classic T-Shirt',
      category: 'Apparel',
      basePrice: 399,
      quantity: 1,
      customization: false,
      rushOrder: false
    };
    setOrderItems([...orderItems, newItem]);
  };

  const removeItem = (id: string) => {
    setOrderItems(items => items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<BulkOrderItem>) => {
    setOrderItems(items =>
      items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const getPricingTier = (quantity: number) => {
    return pricingTiers.find(tier => 
      quantity >= tier.minQuantity && quantity <= tier.maxQuantity
    ) || pricingTiers[0];
  };

  const calculateItemPrice = (item: BulkOrderItem) => {
    const tier = getPricingTier(item.quantity);
    const basePrice = item.basePrice;
    const quantityDiscount = (basePrice * tier.discount) / 100;
    const discountedPrice = basePrice - quantityDiscount;
    
    let finalPrice = discountedPrice;
    
    // Customization fee (₹50)
    if (item.customization) {
      finalPrice += 50;
    }
    
    // Rush order fee (₹30)
    if (item.rushOrder) {
      finalPrice += 30;
    }
    
    return {
      unitPrice: finalPrice,
      totalPrice: finalPrice * item.quantity,
      discount: quantityDiscount,
      tier: tier
    };
  };

  const calculateTotals = () => {
    const itemTotals = orderItems.map(item => ({
      ...calculateItemPrice(item),
      quantity: item.quantity
    }));
    const subtotal = itemTotals.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalDiscount = itemTotals.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
    
    // Additional discounts (in INR)
    let additionalDiscount = 0;
    if (subtotal >= 50000) additionalDiscount += subtotal * 0.05; // 5% for orders over ₹50,000
    if (subtotal >= 200000) additionalDiscount += subtotal * 0.05; // Additional 5% for orders over ₹2,00,000
    
    const finalTotal = subtotal - additionalDiscount;
    
    return {
      subtotal,
      totalDiscount: totalDiscount + additionalDiscount,
      finalTotal,
      itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      savings: totalDiscount + additionalDiscount
    };
  };

  const generateQuote = async () => {
    // Validate order items
    if (orderItems.length === 0) {
      toast.error('Please add at least one item to generate a quote');
      return;
    }

    // Validate all required company information fields
    if (!companyInfo.name?.trim()) {
      toast.error('Please enter company name');
      return;
    }
    if (!companyInfo.email?.trim()) {
      toast.error('Please enter email address');
      return;
    }
    if (!companyInfo.phone?.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    if (!companyInfo.eventDate) {
      toast.error('Please select event date');
      return;
    }
    if (!companyInfo.budget) {
      toast.error('Please select budget range');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyInfo.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsGenerating(true);
    try {
      const totals = calculateTotals();
      const doc = new jsPDF();
      
      // Colors
      const primaryColor = '#121212';
      const accentColor = '#10b981';
      
      // Header
      doc.setFillColor(18, 18, 18);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('BULK ORDER QUOTE', 105, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('34Stories - Custom Merchandise Solutions', 105, 28, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 105, 34, { align: 'center' });
      
      // Reset color for body
      doc.setTextColor(0, 0, 0);
      let yPos = 50;
      
      // Company Information
      if (companyInfo.name || companyInfo.email || companyInfo.phone) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Company Information', 20, yPos);
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (companyInfo.name) {
          doc.text(`Company: ${companyInfo.name}`, 20, yPos);
          yPos += 6;
        }
        if (companyInfo.email) {
          doc.text(`Email: ${companyInfo.email}`, 20, yPos);
          yPos += 6;
        }
        if (companyInfo.phone) {
          doc.text(`Phone: ${companyInfo.phone}`, 20, yPos);
          yPos += 6;
        }
        if (companyInfo.eventDate) {
          doc.text(`Event Date: ${new Date(companyInfo.eventDate).toLocaleDateString('en-IN')}`, 20, yPos);
          yPos += 6;
        }
        if (companyInfo.budget) {
          doc.text(`Budget Range: ${companyInfo.budget}`, 20, yPos);
          yPos += 6;
        }
        if (companyInfo.requirements) {
          doc.text(`Requirements: ${companyInfo.requirements}`, 20, yPos);
          yPos += 6;
        }
        yPos += 5;
      }
      
      // Order Items
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Details', 20, yPos);
      yPos += 10;
      
      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos - 5, 170, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Product', 22, yPos);
      doc.text('Qty', 90, yPos);
      doc.text('Unit Price', 110, yPos);
      doc.text('Discount', 140, yPos);
      doc.text('Total', 170, yPos);
      yPos += 8;
      
      // Table rows
      doc.setFont('helvetica', 'normal');
      orderItems.forEach((item, index) => {
        const pricing = calculateItemPrice(item);
        
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(item.product, 22, yPos);
        doc.text(item.quantity.toString(), 90, yPos);
        doc.text(`₹${pricing.unitPrice.toFixed(2)}`, 110, yPos);
        doc.text(`${pricing.tier.discount}%`, 140, yPos);
        doc.text(`₹${pricing.totalPrice.toFixed(2)}`, 170, yPos);
        
        yPos += 6;
        
        // Add customization/rush info
        const extras = [];
        if (item.customization) extras.push('Custom Design (+₹50)');
        if (item.rushOrder) extras.push('Rush Order (+₹30)');
        
        if (extras.length > 0) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(extras.join(', '), 22, yPos);
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          yPos += 6;
        }
        
        yPos += 2;
      });
      
      yPos += 5;
      
      // Summary
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, 190, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.text('Subtotal:', 130, yPos);
      doc.text(`₹${totals.subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 170, yPos);
      yPos += 7;
      
      if (totals.totalDiscount > 0) {
        doc.setTextColor(16, 185, 129);
        doc.text('Volume Discount:', 130, yPos);
        doc.text(`-₹${totals.totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 170, yPos);
        yPos += 7;
        doc.setTextColor(0, 0, 0);
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total Amount:', 130, yPos);
      doc.text(`₹${totals.finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 170, yPos);
      yPos += 10;
      
      // Savings highlight
      if (totals.savings > 0) {
        doc.setFillColor(16, 185, 129, 0.1);
        doc.rect(20, yPos, 170, 12, 'F');
        doc.setTextColor(16, 120, 80);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`You're saving ₹${totals.savings.toLocaleString('en-IN', { maximumFractionDigits: 2 })} with volume discounts!`, 105, yPos + 8, { align: 'center' });
        yPos += 15;
      }
      
      // Footer
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('This quote is valid for 30 days from the date of generation.', 105, 280, { align: 'center' });
      doc.text('Contact us at support@34stories.com or call +91-XXXX-XXXXXX', 105, 285, { align: 'center' });
      
      // Save PDF
      const fileName = `BulkQuote_${Date.now()}.pdf`;
      doc.save(fileName);
      
      toast.success('Quote generated successfully!', {
        description: `Total: ₹${totals.finalTotal.toLocaleString('en-IN')} for ${totals.itemCount} items`
      });
    } catch (error) {
      console.error('Error generating quote:', error);
      toast.error('Failed to generate quote PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const requestConsultation = async () => {
    if (!companyInfo.name || !companyInfo.email || !companyInfo.phone) {
      toast.error('Please fill in company name, email, and phone to request consultation');
      return;
    }

    if (!user) {
      toast.error('Please login to request consultation');
      return;
    }

    setIsRequesting(true);
    try {
      const totals = calculateTotals();
      
      // Save consultation request to corporate_enquiries table
      const { error } = await supabase
        .from('corporate_enquiries')
        .insert({
          user_id: user.id,
          company_name: companyInfo.name,
          email: companyInfo.email,
          phone: companyInfo.phone,
          event_date: companyInfo.eventDate || null,
          budget_range: companyInfo.budget || null,
          requirements: companyInfo.requirements || '',
          order_details: JSON.stringify({
            items: orderItems,
            totals: totals,
            timestamp: new Date().toISOString()
          }),
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Consultation request sent successfully!', {
        description: 'Our team will contact you within 24 hours'
      });

      // Optionally send email notification
      // You can implement this with a backend API route

    } catch (error: any) {
      console.error('Error requesting consultation:', error);
      toast.error(error.message || 'Failed to send consultation request');
    } finally {
      setIsRequesting(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Bulk Order Calculator</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get instant pricing for bulk orders and corporate gifting. Our calculator shows you 
              volume discounts, customization costs, and delivery options.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calculator */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Order Calculator
                    </CardTitle>
                    <Button onClick={addItem} variant="outline" size="sm">
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderItems.map((item, index) => {
                    const pricing = calculateItemPrice(item);
                    return (
                      <div key={item.id} className="p-4 border border-border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">Item {index + 1}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-foreground">Product</Label>
                            <Select
                              value={item.product}
                              onValueChange={(value) => {
                                const product = products.find(p => p.name === value);
                                if (product) {
                                  updateItem(item.id, {
                                    product: product.name,
                                    category: product.category,
                                    basePrice: product.basePrice
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map(product => (
                                  <SelectItem key={product.name} value={product.name}>
                                    {product.name} - ₹{product.basePrice}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-foreground">Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`customization-${item.id}`}
                              checked={item.customization}
                              onChange={(e) => updateItem(item.id, { customization: e.target.checked })}
                              className="rounded border-border"
                            />
                            <Label htmlFor={`customization-${item.id}`} className="text-foreground">
                              Custom Design (+₹50)
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`rush-${item.id}`}
                              checked={item.rushOrder}
                              onChange={(e) => updateItem(item.id, { rushOrder: e.target.checked })}
                              className="rounded border-border"
                            />
                            <Label htmlFor={`rush-${item.id}`} className="text-foreground">
                              Rush Order (+₹30)
                            </Label>
                          </div>
                        </div>

                        <div className="bg-secondary p-3 rounded">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Pricing Tier:</span>
                            <Badge variant="outline" className="text-primary">
                              {pricing.tier.label} ({pricing.tier.discount}% off)
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Unit Price:</span>
                            <span className="text-foreground">₹{pricing.unitPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-primary">Total:</span>
                            <span className="text-primary">₹{pricing.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-blue-500/10 border-blue-500/20">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700">
                      All fields marked with * are required to generate a quote PDF.
                    </AlertDescription>
                  </Alert>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground">Company Name *</Label>
                      <Input
                        value={companyInfo.name}
                        onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                        className="bg-background border-border text-foreground"
                        placeholder="Your company name"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-foreground">Email *</Label>
                      <Input
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                        className="bg-background border-border text-foreground"
                        placeholder="your@company.com"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-foreground">Phone *</Label>
                      <Input
                        value={companyInfo.phone}
                        onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                        className="bg-background border-border text-foreground"
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-foreground">Event Date *</Label>
                      <Input
                        type="date"
                        value={companyInfo.eventDate}
                        onChange={(e) => setCompanyInfo({...companyInfo, eventDate: e.target.value})}
                        className="bg-background border-border text-foreground"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-foreground">Budget Range *</Label>
                    <Select
                      value={companyInfo.budget}
                      onValueChange={(value) => setCompanyInfo({...companyInfo, budget: value})}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-25000">Under ₹25,000</SelectItem>
                        <SelectItem value="25000-50000">₹25,000 - ₹50,000</SelectItem>
                        <SelectItem value="50000-200000">₹50,000 - ₹2,00,000</SelectItem>
                        <SelectItem value="200000-500000">₹2,00,000 - ₹5,00,000</SelectItem>
                        <SelectItem value="over-500000">Over ₹5,00,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-foreground">Special Requirements</Label>
                    <Input
                      value={companyInfo.requirements}
                      onChange={(e) => setCompanyInfo({...companyInfo, requirements: e.target.value})}
                      className="bg-background border-border text-foreground"
                      placeholder="Any special requirements or notes..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="text-foreground">{totals.itemCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="text-foreground">₹{totals.subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Volume Discount:</span>
                      <span>-₹{totals.totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-primary">Total:</span>
                      <span className="text-primary">₹{totals.finalTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {totals.savings > 0 && (
                    <Alert className="bg-green-500/10 border-green-500/20">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-700">
                        You're saving ₹{totals.savings.toLocaleString('en-IN', { maximumFractionDigits: 2 })} with volume discounts!
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Button 
                      onClick={generateQuote}
                      disabled={isGenerating}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Generate Quote PDF
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={requestConsultation}
                      disabled={isRequesting}
                      variant="outline"
                      className="w-full"
                    >
                      {isRequesting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-2" />
                          Request Consultation
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Tiers */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Volume Discounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pricingTiers.map((tier, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {tier.minQuantity === 1 ? '1-24' : 
                           tier.maxQuantity === Infinity ? `${tier.minQuantity}+` :
                           `${tier.minQuantity}-${tier.maxQuantity}`} items
                        </span>
                        <Badge variant="outline" className="text-primary">
                          {tier.discount}% off
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary">Bulk Order Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-foreground">Volume discounts up to 30%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-foreground">Free design consultation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-foreground">Priority production</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-foreground">Dedicated account manager</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-foreground">Flexible payment terms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

