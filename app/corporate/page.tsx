'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Users, Gift, Award, TrendingUp, CheckCircle, Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Image from 'next/image';

export default function CorporatePage() {
  return (
    <AuthGuard>
      <CorporatePageContent />
    </AuthGuard>
  );
}

interface UploadedFile {
  id: string;
  file: File;
  url?: string;
  type: 'image' | 'document';
  uploading: boolean;
}

function CorporatePageContent() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

    const newFiles: UploadedFile[] = files.map(file => {
      const isImage = allowedImageTypes.includes(file.type);
      const isDocument = allowedDocTypes.includes(file.type);

      if (!isImage && !isDocument) {
        toast.error(`${file.name} is not a supported file type. Please upload images or documents.`);
        return null;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return null;
      }

      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        type: isImage ? 'image' : 'document',
        uploading: false,
      };
    }).filter((f): f is UploadedFile => f !== null);

    if (newFiles.length === 0) return;

    setUploadedFiles(prev => [...prev, ...newFiles]);
    await uploadFiles(newFiles);
  };

  const uploadFiles = async (files: UploadedFile[]) => {
    setUploadingFiles(true);

    try {
      const uploadPromises = files.map(async (fileObj) => {
        const fileExt = fileObj.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `corporate-enquiries/${fileName}`;

        // Mark as uploading
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileObj.id ? { ...f, uploading: true } : f)
        );

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('corporate-uploads')
          .upload(filePath, fileObj.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('corporate-uploads')
          .getPublicUrl(filePath);

        // Update with URL
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileObj.id ? { ...f, url: urlData.publicUrl, uploading: false } : f)
        );

        return urlData.publicUrl;
      });

      await Promise.all(uploadPromises);
      toast.success('Files uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
      // Remove failed files
      setUploadedFiles(prev => prev.filter(f => !files.some(uf => uf.id === f.id)));
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare attachments array
      const attachments = uploadedFiles
        .filter(f => f.url)
        .map(f => ({
          url: f.url,
          name: f.file.name,
          type: f.type,
          size: f.file.size,
        }));

      const { error } = await supabase
        .from('corporate_enquiries')
        .insert([
          {
            user_id: user?.id || null,
            company_name: formData.companyName,
            contact_person: formData.contactPerson,
            email: formData.email,
            phone: formData.phone,
            product_interest: formData.productInterest,
            quantity: formData.quantity ? parseInt(formData.quantity) : null,
            budget_range: formData.budgetRange,
            message: formData.message,
            attachments: attachments.length > 0 ? attachments : null,
            logo_url: attachments.find(a => a.type === 'image')?.url || null,
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
      setUploadedFiles([]);
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

                {/* File Upload Section */}
                <div>
                  <Label className="text-foreground mb-2 block">
                    Upload Requirements (Optional)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload logos, design files, documents, or reference images. Max 10MB per file.
                  </p>
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploadingFiles}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-foreground mb-1">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Images (JPG, PNG, GIF, WEBP) or Documents (PDF, DOC, DOCX, TXT)
                      </span>
                    </label>
                  </div>

                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((fileObj) => (
                        <div
                          key={fileObj.id}
                          className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {fileObj.type === 'image' ? (
                              <ImageIcon className="h-5 w-5 text-primary flex-shrink-0" />
                            ) : (
                              <File className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {fileObj.file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(fileObj.file.size / 1024).toFixed(2)} KB
                                {fileObj.uploading && ' • Uploading...'}
                                {fileObj.url && ' • Uploaded ✓'}
                              </p>
                            </div>
                          </div>
                          {!fileObj.uploading && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(fileObj.id)}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-medium"
                  disabled={submitting || uploadingFiles}
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
