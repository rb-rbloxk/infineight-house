'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Users, Gift, Award, TrendingUp, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function CorporatePage() {
  return (
    <AuthGuard>
      <CorporatePageContent />
    </AuthGuard>
  );
}

function CorporatePageContent() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    productInterest: '',
    quantity: '',
    budgetRange: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('corporate_enquiries')
        .insert([
          {
            company_name: formData.companyName,
            contact_person: formData.contactPerson,
            email: formData.email,
            phone: formData.phone,
            product_interest: formData.productInterest,
            quantity: formData.quantity ? parseInt(formData.quantity) : null,
            budget_range: formData.budgetRange,
            message: formData.message,
            status: 'new',
          },
        ]);

      if (error) throw error;

      toast.success('Enquiry submitted successfully! We will contact you soon.');
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        productInterest: '',
        quantity: '',
        budgetRange: '',
        message: '',
      });
    } catch (error: any) {
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Corporate Gifting Solutions
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Strengthen your brand and build lasting relationships with customized corporate merchandise
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Employee Gifts</h3>
              <p className="text-sm text-muted-foreground">Custom merchandise for your team to boost morale and unity</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Client Appreciation</h3>
              <p className="text-sm text-muted-foreground">Thoughtful gifts to strengthen business relationships</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Event Merchandise</h3>
              <p className="text-sm text-muted-foreground">Custom branded items for conferences and corporate events</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Brand Promotion</h3>
              <p className="text-sm text-muted-foreground">Increase visibility with custom promotional products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground">We deliver excellence in every corporate order</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Bulk Discounts</h3>
                <p className="text-sm text-muted-foreground">Competitive pricing for large orders</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Quick Turnaround</h3>
                <p className="text-sm text-muted-foreground">Fast production and delivery times</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Premium Quality</h3>
                <p className="text-sm text-muted-foreground">High-quality materials and printing</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Custom Designs</h3>
                <p className="text-sm text-muted-foreground">Fully customizable to match your brand</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Dedicated Support</h3>
                <p className="text-sm text-muted-foreground">Personal account manager for your project</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Nationwide Delivery</h3>
                <p className="text-sm text-muted-foreground">Reliable shipping across India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Get a Custom Quote
              </h2>
              <p className="text-muted-foreground text-lg">
                Fill out the form below and our team will get back to you within 24 hours
              </p>
            </div>

            <Card className="p-8 md:p-12 bg-card border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName" className="text-foreground">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson" className="text-foreground">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      required
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-foreground">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productInterest" className="text-foreground">Product Interest</Label>
                    <Input
                      id="productInterest"
                      placeholder="T-shirts, Hoodies, Mugs, etc."
                      value={formData.productInterest}
                      onChange={(e) => setFormData({ ...formData, productInterest: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-foreground">Approximate Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="e.g., 100"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="budgetRange" className="text-foreground">Budget Range</Label>
                  <Input
                    id="budgetRange"
                    placeholder="e.g., ₹50,000 - ₹1,00,000"
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-foreground">Additional Details</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-medium"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Enquiry'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
