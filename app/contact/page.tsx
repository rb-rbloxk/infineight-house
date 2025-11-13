import { Mail, Phone, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="p-8 text-center bg-card border-border hover:border-primary transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Email Us</h3>
              <a href="mailto:hello@Infineight.house" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                hello@Infineight.house
              </a>
            </Card>

            <Card className="p-8 text-center bg-card border-border hover:border-primary transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 mx-auto">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Call Us</h3>
              <a href="tel:+911234567890" className="text-muted-foreground hover:text-primary transition-colors text-lg">
                +91 9449 18 3434
              </a>
            </Card>

            <Card className="p-8 text-center bg-card border-border hover:border-primary transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 mx-auto">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Visit Us</h3>
              <p className="text-muted-foreground text-lg">
                Bangalore, India
              </p>
            </Card>
          </div>

          {/* Business Hours */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 bg-card border-border">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Business Hours</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-semibold text-foreground">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-semibold text-foreground">10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="font-semibold text-foreground">Closed</span>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-card border-border">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Quick Response</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Email responses within 24 hours</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Phone support during business hours</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Live chat available on website</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-muted-foreground">Emergency support for urgent orders</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Corporate Information */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Corporate Enquiries
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              For corporate gifting enquiries or bulk orders, we offer special pricing and dedicated support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/corporate" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors">
                Corporate Gifting
              </a>
              <a href="mailto:corporate@Infineight.house" className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors">
                Email Corporate Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
