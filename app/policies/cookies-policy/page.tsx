'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-card border-border max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">Cookies Policy</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
                <p className="text-muted-foreground mb-2">
                  We use cookies for the following purposes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings to enhance your experience</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and track campaign effectiveness</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Session Cookies</h3>
                    <p>These are temporary cookies that are deleted when you close your browser. They help maintain your session while browsing our website.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Persistent Cookies</h3>
                    <p>These cookies remain on your device for a set period or until you delete them. They remember your preferences for future visits.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
                <p className="text-muted-foreground">
                  We may use third-party services that set cookies on your device, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Google Analytics for website analytics</li>
                  <li>Payment processors for secure transactions</li>
                  <li>Social media platforms for sharing features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
                <p className="text-muted-foreground mb-2">
                  You can control and manage cookies in various ways:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Browser settings: Most browsers allow you to refuse or accept cookies</li>
                  <li>Cookie preferences: Use our cookie consent banner to manage preferences</li>
                  <li>Third-party opt-out: Visit the relevant third-party websites to opt out</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Please note that disabling cookies may affect the functionality of our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookies Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about our use of cookies, please contact us at hello@Infineight.house
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

