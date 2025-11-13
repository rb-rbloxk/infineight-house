export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              About <span className="text-primary">Infineight</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Where every design tells a unique story. We're passionate about helping individuals and businesses express their identity through custom-designed apparel and merchandise.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-card rounded-2xl p-8 md:p-12 mb-12 border border-border">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center max-w-4xl mx-auto">
              To empower everyone to wear their story and gift meaningful moments through premium quality, fully customizable products. We believe that what you wear should be as unique as you are.
            </p>
          </div>

          {/* What We Offer Section */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              What We Offer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">👕</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Custom Apparel</h3>
                <p className="text-muted-foreground">T-shirts, hoodies, and apparel for men and women with unlimited customization options</p>
              </div>
              
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Corporate Solutions</h3>
                <p className="text-muted-foreground">Bulk order discounts and corporate gifting solutions for businesses of all sizes</p>
              </div>
              
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Design Tool</h3>
                <p className="text-muted-foreground">Easy-to-use design tool for creating your perfect look with real-time preview</p>
              </div>
              
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Premium Quality</h3>
                <p className="text-muted-foreground">High-quality printing and materials that last, ensuring your story stands out</p>
              </div>
              
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground">Quick turnaround times and reliable delivery to your doorstep</p>
              </div>
              
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💝</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Gift Solutions</h3>
                <p className="text-muted-foreground">Perfect for special occasions, events, and meaningful gifts</p>
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-secondary rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
              Why Choose Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Experience & Expertise</h3>
                <p className="text-muted-foreground leading-relaxed">
                  With years of experience in custom printing and a commitment to quality, we've helped thousands of customers bring their visions to life.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Simple Process</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're looking for a single custom piece or bulk corporate orders, we're here to make the process simple and enjoyable.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Create Your Story?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Start designing your custom merchandise today and let your story shine!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/shop" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors">
                Start Shopping
              </a>
              <a href="/customise" className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors">
                Design Your Own
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
