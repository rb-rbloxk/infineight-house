'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-card border-border max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">Terms and Conditions</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using Infineight.House, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                <p className="text-muted-foreground mb-2">
                  Permission is granted to temporarily use our services for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Product Customization</h2>
                <p className="text-muted-foreground">
                  When you customize products through our platform, you are responsible for ensuring that your designs do not infringe on any third-party rights, including copyrights, trademarks, or other intellectual property rights. We reserve the right to refuse any order that contains inappropriate, offensive, or infringing content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Orders and Payment</h2>
                <p className="text-muted-foreground mb-2">
                  All orders are subject to product availability and acceptance. We reserve the right to refuse or cancel any order for any reason, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Product availability</li>
                  <li>Errors in pricing or product information</li>
                  <li>Fraudulent or illegal transactions</li>
                  <li>Inappropriate or offensive content in customizations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  In no event shall Infineight.House or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Revisions and Errata</h2>
                <p className="text-muted-foreground">
                  The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on its website are accurate, complete, or current.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms and Conditions, please contact us at hello@Infineight.house
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

