'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-card border-border max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground mb-2">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information (processed securely through third-party payment processors)</li>
                  <li>Account credentials (email and password)</li>
                  <li>Custom design preferences and saved designs</li>
                  <li>Order history and preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-2">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Process and fulfill your orders</li>
                  <li>Communicate with you about your orders and account</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Improve our services and user experience</li>
                  <li>Detect and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Service providers who assist us in operating our website and conducting our business</li>
                  <li>Payment processors to handle transactions</li>
                  <li>Shipping companies to deliver your orders</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                <p className="text-muted-foreground mb-2">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
                <p className="text-muted-foreground">
                  We use cookies to enhance your experience on our website. For more information, please see our Cookies Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy, please contact us at hello@Infineight.house
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

