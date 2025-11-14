'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomisationPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-card border-border max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">Customisation Policy</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Customisation Services</h2>
                <p className="text-muted-foreground">
                  Infineight.House offers customisation services for various products including t-shirts, hoodies, mugs, and other merchandise. You can personalize products with your own text, images, logos, and designs using our online design tool.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Design Guidelines</h2>
                <p className="text-muted-foreground mb-2">
                  When creating custom designs, please ensure:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>All content is original or you have proper authorization to use it</li>
                  <li>Designs do not infringe on copyrights, trademarks, or intellectual property rights</li>
                  <li>Content is not offensive, defamatory, or inappropriate</li>
                  <li>Images are high resolution (minimum 300 DPI recommended)</li>
                  <li>Text is clear and readable</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Prohibited Content</h2>
                <p className="text-muted-foreground mb-2">
                  We reserve the right to refuse any customisation that contains:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Copyrighted material without authorization</li>
                  <li>Trademarked logos or brand names without permission</li>
                  <li>Offensive, hateful, or discriminatory content</li>
                  <li>Violent, illegal, or harmful imagery</li>
                  <li>Personal information of others without consent</li>
                  <li>Content that violates any laws or regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Design Approval</h2>
                <p className="text-muted-foreground">
                  All custom designs are subject to review before production. We may contact you if we have concerns about your design. If a design is rejected, you will be notified and can modify it or receive a full refund.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Design Ownership</h2>
                <p className="text-muted-foreground">
                  You retain ownership of your custom designs. However, by submitting a design, you grant us a license to use, reproduce, and print the design for the purpose of fulfilling your order. We will not use your designs for any other purpose without your consent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Production Time</h2>
                <p className="text-muted-foreground mb-2">
                  Custom orders typically take 3-5 business days for production, plus shipping time. Production time may vary based on:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Order complexity and quantity</li>
                  <li>Product type and customization method</li>
                  <li>Peak season demand</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  You will receive an estimated delivery date at checkout.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Quality Assurance</h2>
                <p className="text-muted-foreground">
                  We strive to produce high-quality custom products. However, slight variations in color, placement, or finish may occur due to the nature of customization. If you are not satisfied with the quality of your custom order due to our error, please contact us for a replacement or refund.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Returns and Refunds</h2>
                <p className="text-muted-foreground">
                  Customized items are made to order and generally cannot be returned unless there is a manufacturing defect or error on our part. Please review your design carefully before placing your order. For more information, see our Return Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Client Instructions</h2>
                <p className="text-muted-foreground">
                  When placing a custom order, you may provide special instructions. We will do our best to accommodate your requests, but cannot guarantee specific placement, sizing, or effects beyond what is available in our design tool. Complex requests may require additional communication and may affect production time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                <p className="text-muted-foreground">
                  For questions about customisation or to discuss special requirements, please contact us at hello@Infineight.house
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

