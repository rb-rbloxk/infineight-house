'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-card border-border max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">Return Policy</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Return Eligibility</h2>
                <p className="text-muted-foreground mb-2">
                  We want you to be completely satisfied with your purchase. Items can be returned within 7 days of delivery, provided they meet the following conditions:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Items must be unused, unwashed, and in original condition</li>
                  <li>Original tags and packaging must be intact</li>
                  <li>Items must not be damaged or altered</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Non-Returnable Items</h2>
                <p className="text-muted-foreground mb-2">
                  The following items cannot be returned:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Customized or personalized items (unless defective)</li>
                  <li>Items damaged due to misuse or normal wear</li>
                  <li>Items without original packaging or tags</li>
                  <li>Items purchased more than 7 days ago</li>
                  <li>Sale or clearance items (unless defective)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Defective or Damaged Items</h2>
                <p className="text-muted-foreground">
                  If you receive a defective or damaged item, please contact us within 48 hours of delivery. We will arrange for a replacement or full refund, including return shipping costs. Please provide photos of the defect or damage when contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Return Process</h2>
                <p className="text-muted-foreground mb-2">
                  To initiate a return:
                </p>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Contact us at hello@Infineight.house with your order number</li>
                  <li>We will provide you with a Return Authorization (RA) number</li>
                  <li>Package the item securely with the RA number visible</li>
                  <li>Ship the item back to the address provided</li>
                  <li>Once received and inspected, we will process your refund</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Refunds</h2>
                <p className="text-muted-foreground mb-2">
                  Refunds will be processed within 5-7 business days after we receive and inspect the returned item. The refund will be issued to the original payment method. Please note:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Original shipping charges are non-refundable (unless item is defective)</li>
                  <li>Return shipping costs are the customer's responsibility (unless item is defective)</li>
                  <li>Refund processing time may vary depending on your payment method</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Exchanges</h2>
                <p className="text-muted-foreground">
                  We currently do not offer direct exchanges. If you need a different size or color, please return the original item and place a new order. We will process your return refund once the item is received.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Custom Orders</h2>
                <p className="text-muted-foreground">
                  Customized or personalized items are made to order and cannot be returned unless there is a manufacturing defect or error on our part. If you notice an error in your custom order, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
                <p className="text-muted-foreground">
                  For any questions about returns or to initiate a return, please contact us at hello@Infineight.house with your order number.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

