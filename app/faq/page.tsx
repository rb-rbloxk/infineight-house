'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  HelpCircle, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Palette, 
  Users, 
  Package,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqData: FAQItem[] = [
    // General Questions
    {
      id: '1',
      question: 'What is Infineight?',
      answer: 'Infineight is a custom apparel and corporate gifting platform that allows you to create personalized t-shirts, hoodies, mugs, and other products. We specialize in high-quality printing and fast delivery.',
      category: 'general',
      tags: ['about', 'company', 'services']
    },
    {
      id: '2',
      question: 'How do I place an order?',
      answer: 'Ordering is simple! Browse our products, use our customization tool to design your items, add them to your cart, and proceed to checkout. You can also use our bulk calculator for larger orders.',
      category: 'general',
      tags: ['ordering', 'process', 'how-to']
    },
    {
      id: '3',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers for bulk orders. All payments are processed securely.',
      category: 'general',
      tags: ['payment', 'credit-card', 'paypal']
    },

    // Customization
    {
      id: '4',
      question: 'How does the customization tool work?',
      answer: 'Our customization tool allows you to add text, upload images, and position design elements on your products. You can see a real-time preview, adjust colors, fonts, and sizes, and even view your design in 3D.',
      category: 'customization',
      tags: ['design', 'tool', 'customize', 'preview']
    },
    {
      id: '5',
      question: 'What file formats can I upload for custom designs?',
      answer: 'We accept PNG, JPG, JPEG, SVG, and PDF files. For best results, use high-resolution images (300 DPI or higher) and vector formats (SVG) when possible.',
      category: 'customization',
      tags: ['upload', 'file-formats', 'images', 'quality']
    },
    {
      id: '6',
      question: 'Can I see how my design will look before ordering?',
      answer: 'Yes! Our live preview feature shows exactly how your design will appear on the product. You can view it from different angles and even see a 3D preview.',
      category: 'customization',
      tags: ['preview', '3d', 'design', 'visualization']
    },
    {
      id: '7',
      question: 'Is there a limit to how many design elements I can add?',
      answer: 'You can add multiple text elements and images to your design. However, we recommend keeping designs clean and readable for the best results. Our design team can help optimize complex designs.',
      category: 'customization',
      tags: ['elements', 'limit', 'design', 'optimization']
    },

    // Products & Quality
    {
      id: '8',
      question: 'What products do you offer?',
      answer: 'We offer t-shirts, hoodies, polo shirts, mugs, tote bags, water bottles, notebooks, pen sets, and more. Our product range includes men\'s, women\'s, and unisex options.',
      category: 'products',
      tags: ['products', 't-shirts', 'hoodies', 'mugs', 'accessories']
    },
    {
      id: '9',
      question: 'What sizes are available?',
      answer: 'We offer sizes XS through XXL for most apparel items. Each product page includes a detailed size guide with measurements. We also offer custom sizing for bulk orders.',
      category: 'products',
      tags: ['sizes', 'measurements', 'fit', 'guide']
    },
    {
      id: '10',
      question: 'What printing methods do you use?',
      answer: 'We use high-quality DTG (Direct-to-Garment) printing for most apparel, which provides vibrant colors and long-lasting results. For bulk orders, we also offer screen printing and embroidery options.',
      category: 'products',
      tags: ['printing', 'dtg', 'screen-printing', 'embroidery', 'quality']
    },
    {
      id: '11',
      question: 'How long will my custom products last?',
      answer: 'Our products are designed to last! With proper care, printed designs will remain vibrant for years. We use premium materials and professional-grade printing techniques.',
      category: 'products',
      tags: ['durability', 'longevity', 'care', 'quality']
    },

    // Shipping & Delivery
    {
      id: '12',
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days, express shipping takes 1-2 business days, and overnight shipping delivers the next business day. Production time is typically 1-3 business days.',
      category: 'shipping',
      tags: ['shipping', 'delivery', 'time', 'production']
    },
    {
      id: '13',
      question: 'Do you ship internationally?',
      answer: 'Yes! We ship to most countries worldwide. International shipping times vary by location (typically 7-14 business days). Additional customs fees may apply.',
      category: 'shipping',
      tags: ['international', 'worldwide', 'customs', 'fees']
    },
    {
      id: '14',
      question: 'Can I track my order?',
      answer: 'Absolutely! Once your order ships, you\'ll receive a tracking number via email. You can also track your order status in your account dashboard.',
      category: 'shipping',
      tags: ['tracking', 'status', 'updates', 'dashboard']
    },
    {
      id: '15',
      question: 'What if my order is lost or damaged?',
      answer: 'We\'re committed to your satisfaction! If your order is lost or arrives damaged, contact us immediately. We\'ll replace the items at no cost to you.',
      category: 'shipping',
      tags: ['lost', 'damaged', 'replacement', 'support']
    },

    // Bulk Orders & Corporate
    {
      id: '16',
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! We offer volume discounts starting at 5% for orders of 25+ items, up to 30% for orders of 1000+ items. Use our bulk calculator to see instant pricing.',
      category: 'bulk',
      tags: ['bulk', 'discounts', 'volume', 'pricing', 'calculator']
    },
    {
      id: '17',
      question: 'What are your minimum order quantities?',
      answer: 'There\'s no minimum for individual orders. For bulk orders, we recommend a minimum of 25 items to qualify for volume discounts, but we can accommodate smaller quantities.',
      category: 'bulk',
      tags: ['minimum', 'quantity', 'bulk', 'orders']
    },
    {
      id: '18',
      question: 'Do you offer corporate gifting services?',
      answer: 'Yes! We specialize in corporate gifting with dedicated account managers, custom branding, flexible payment terms, and special pricing for businesses.',
      category: 'bulk',
      tags: ['corporate', 'gifting', 'business', 'account-manager']
    },
    {
      id: '19',
      question: 'Can I get samples before placing a bulk order?',
      answer: 'Absolutely! We can provide samples of your custom design before production. Sample fees apply but are credited toward your final order.',
      category: 'bulk',
      tags: ['samples', 'proof', 'testing', 'quality']
    },

    // Returns & Exchanges
    {
      id: '20',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unused items in original packaging. Custom items can be returned if there\'s a manufacturing defect. Return shipping is free.',
      category: 'returns',
      tags: ['returns', 'policy', '30-days', 'defects']
    },
    {
      id: '21',
      question: 'Can I exchange my order?',
      answer: 'Yes! We offer exchanges for different sizes or colors. If the new item costs more, you\'ll pay the difference. If it costs less, we\'ll refund the difference.',
      category: 'returns',
      tags: ['exchanges', 'sizes', 'colors', 'refunds']
    },
    {
      id: '22',
      question: 'How do I initiate a return or exchange?',
      answer: 'Contact our customer service team or use the return portal in your account dashboard. We\'ll provide a return label and instructions.',
      category: 'returns',
      tags: ['process', 'customer-service', 'portal', 'label']
    },

    // Account & Support
    {
      id: '23',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" in the top navigation, enter your email and password, and verify your email address. You can also sign up during checkout.',
      category: 'account',
      tags: ['account', 'signup', 'registration', 'email']
    },
    {
      id: '24',
      question: 'How can I save my designs?',
      answer: 'Create an account and use our wishlist feature to save your favorite designs. You can also save designs during the customization process.',
      category: 'account',
      tags: ['save', 'designs', 'wishlist', 'favorites']
    },
    {
      id: '25',
      question: 'How do I contact customer support?',
      answer: 'You can reach us via email at hello@Infineight.house, phone at +91 9449 18 3434, or live chat on our website. We typically respond within 24 hours.',
      category: 'account',
      tags: ['support', 'contact', 'email', 'phone', 'chat']
    },
    {
      id: '26',
      question: 'Do you have a mobile app?',
      answer: 'Our website is fully mobile-responsive and works great on all devices. We\'re currently developing a mobile app that will be available soon.',
      category: 'account',
      tags: ['mobile', 'app', 'responsive', 'devices']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'general', name: 'General', icon: HelpCircle },
    { id: 'customization', name: 'Customization', icon: Palette },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'shipping', name: 'Shipping', icon: Truck },
    { id: 'bulk', name: 'Bulk Orders', icon: Users },
    { id: 'returns', name: 'Returns', icon: ShoppingCart },
    { id: 'account', name: 'Account', icon: CreditCard }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast.success(`Found ${filteredFAQs.length} results for "${searchQuery}"`);
    }
  };

  const contactSupport = () => {
    toast.success('Opening contact form...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our products, services, and ordering process. 
              Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          {/* Search */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`h-auto p-3 flex flex-col items-center gap-2 ${
                    selectedCategory === category.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs text-center">{category.name}</span>
                </Button>
              );
            })}
          </div>

          {/* FAQ Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedCategory === 'all' ? 'All Questions' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <Badge variant="outline" className="text-foreground">
                {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'}
              </Badge>
            </div>

            {filteredFAQs.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No questions found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or browse different categories.
                  </p>
                  <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} variant="outline">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <Card key={faq.id} className="bg-card border-border">
                    <AccordionItem value={faq.id} className="border-none">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/50">
                        <div className="text-left">
                          <h3 className="font-semibold text-foreground">{faq.question}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {categories.find(c => c.id === faq.category)?.name}
                            </Badge>
                            {faq.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                ))}
              </Accordion>
            )}
          </div>

          {/* Contact Support */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary text-center">Still Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Can't find the answer you're looking for? Our support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={contactSupport} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Us
                </Button>
                <Button variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>📧 hello@Infineight.house</p>
                <p>📞 +91 9449 18 3434</p>
                <p>💬 Available 9 AM - 6 PM EST, Monday - Friday</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

