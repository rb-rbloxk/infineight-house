'use client';

import Link from 'next/link';
import { ArrowRight, Palette, Truck, Award, Users, Zap, Heart, Calculator, Package, Eye, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "Wear moments, Beyond time!",
      subtitle: "",
      description: "Create custom t-shirts, hoodies, and corporate gifts that tell your unique story. Design, preview, and order in minutes.",
      image: "👕",
      bgColor: "from-blue-500 to-purple-600"
    },
    {
      title: "Premium Quality.",
      subtitle: "Every Time.",
      description: "High-quality fabrics and printing technology for lasting impressions. Your designs deserve the best materials.",
      image: "🏆",
      bgColor: "from-green-500 to-teal-600"
    },
    {
      title: "Fast Delivery.",
      subtitle: "Reliable Service.",
      description: "Quick turnaround times with reliable shipping to your doorstep. Get your custom products when you need them.",
      image: "🚚",
      bgColor: "from-orange-500 to-red-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh]">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-gradient-to-br ${slide.bgColor} transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="max-w-4xl mx-auto text-center text-white">
                  <div className="text-4xl sm:text-6xl md:text-8xl mb-4 sm:mb-6">{slide.image}</div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                    {slide.title}<br />
                    <span className="text-yellow-300">{slide.subtitle}</span>
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto opacity-90 px-4">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                    <Link href="/shop">
                      <Button size="lg" className="bg-white hover:bg-gray-100 text-gray-900 px-6 sm:px-8 w-full sm:w-auto">
                        Start Shopping
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </Link>
                    <Link href="/customise">
                      <Button size="lg" variant="outline" className="px-6 sm:px-8 border-white text-black hover:bg-black hover:text-gray-900 w-full sm:w-auto">
                        Design Your Own
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Palette className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Custom Design</h3>
              <p className="text-sm text-muted-foreground">Upload your logo or create unique designs with our easy-to-use editor</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">High-quality fabrics and printing technology for lasting impressions</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Quick turnaround times with reliable shipping to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Bulk Orders</h3>
              <p className="text-sm text-muted-foreground">Special pricing for corporate gifting and bulk orders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-background to-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Popular Categories
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">Discover our most loved product categories</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/shop?category=men">
              <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center relative">
                    <span className="text-6xl">👕</span>
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">Trending</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                    Men's Collection
                  </h3>
                  <p className="text-sm text-muted-foreground">T-shirts, hoodies & more</p>
                  <div className="mt-2 text-xs text-muted-foreground">500+ products</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/shop?category=women">
              <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg mb-4 flex items-center justify-center relative">
                    <span className="text-6xl">👚</span>
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">Popular</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                    Women's Collection
                  </h3>
                  <p className="text-sm text-muted-foreground">Stylish & comfortable</p>
                  <div className="mt-2 text-xs text-muted-foreground">400+ products</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/shop?category=gifting">
              <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-4 flex items-center justify-center relative">
                    <span className="text-6xl">🎁</span>
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">New</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                    Gifting Items
                  </h3>
                  <p className="text-sm text-muted-foreground">Mugs, bags & accessories</p>
                  <div className="mt-2 text-xs text-muted-foreground">200+ products</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/shop?category=corporate">
              <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-4 flex items-center justify-center relative">
                    <span className="text-6xl">💼</span>
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">Bulk</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                    Corporate
                  </h3>
                  <p className="text-sm text-muted-foreground">Bulk orders & branding</p>
                  <div className="mt-2 text-xs text-muted-foreground">300+ products</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Business Needs Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Shop by Business Needs
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">Tailored solutions for every business requirement</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Employee Appreciation</h3>
                <p className="text-sm text-muted-foreground mb-4">Custom branded merchandise for team recognition and company culture</p>
                <Link href="/corporate">
                  <Button variant="outline" size="sm" className="w-full">
                    Explore Solutions
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Event Marketing</h3>
                <p className="text-sm text-muted-foreground mb-4">Promotional items and giveaways for conferences, trade shows, and events</p>
                <Link href="/corporate">
                  <Button variant="outline" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Client Gifting</h3>
                <p className="text-sm text-muted-foreground mb-4">Premium gifts to strengthen client relationships and show appreciation</p>
                <Link href="/corporate">
                  <Button variant="outline" size="sm" className="w-full">
                    View Options
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Product Launch</h3>
                <p className="text-sm text-muted-foreground mb-4">Launch merchandise and promotional materials for new product releases</p>
                <Link href="/corporate">
                  <Button variant="outline" size="sm" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Bulk Orders</h3>
                <p className="text-sm text-muted-foreground mb-4">Volume discounts and streamlined ordering for large quantities</p>
                <Link href="/bulk-calculator">
                  <Button variant="outline" size="sm" className="w-full">
                    Calculate Pricing
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Palette className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Brand Consistency</h3>
                <p className="text-sm text-muted-foreground mb-4">Maintain brand identity across all promotional materials and merchandise</p>
                <Link href="/customise">
                  <Button variant="outline" size="sm" className="w-full">
                    Design Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-background to-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Best Sellers
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">Our most popular products loved by customers worldwide</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center relative">
                  <span className="text-6xl">👕</span>
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">#1</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                  Classic Cotton Tee
                </h3>
                <p className="text-sm text-muted-foreground mb-2">Premium quality cotton t-shirt</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">₹1,599</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-muted-foreground ml-1">4.9 (2.3k)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center relative">
                  <span className="text-6xl">🧥</span>
                  <Badge className="absolute top-2 left-2 bg-orange-500 text-white">#2</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                  Premium Hoodie
                </h3>
                <p className="text-sm text-muted-foreground mb-2">Comfortable fleece hoodie</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">₹3,199</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-muted-foreground ml-1">4.8 (1.8k)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center relative">
                  <span className="text-6xl">☕</span>
                  <Badge className="absolute top-2 left-2 bg-green-500 text-white">#3</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                  Custom Mug
                </h3>
                <p className="text-sm text-muted-foreground mb-2">Ceramic coffee mug</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">₹1,039</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-muted-foreground ml-1">4.9 (1.5k)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center relative">
                  <span className="text-6xl">🎒</span>
                  <Badge className="absolute top-2 left-2 bg-blue-500 text-white">#4</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                  Canvas Tote Bag
                </h3>
                <p className="text-sm text-muted-foreground mb-2">Eco-friendly canvas bag</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">₹1,279</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-muted-foreground ml-1">4.7 (1.2k)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* New Launches Slider Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              New Launches
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">Fresh designs and products just added to our collection</p>
          </div>
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-4 flex items-center justify-center relative">
                      <span className="text-6xl">🎨</span>
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">NEW</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                      Eco-Friendly Tees
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">Sustainable organic cotton collection</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">₹1,999</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-muted-foreground ml-1">4.8 (156)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center relative">
                      <span className="text-6xl">🖥️</span>
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">NEW</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                      Tech Accessories
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">Laptop sleeves and tech gear</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">₹2,399</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-muted-foreground ml-1">4.9 (89)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg mb-4 flex items-center justify-center relative">
                      <span className="text-6xl">👶</span>
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">NEW</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                      Kids Collection
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">Fun designs for little ones</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">₹1,359</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-muted-foreground ml-1">4.7 (234)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg mb-4 flex items-center justify-center relative">
                      <span className="text-6xl">🏃</span>
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">NEW</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                      Sports Apparel
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">Performance wear for athletes</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">₹2,799</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-muted-foreground ml-1">4.8 (167)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="group shadow-subtle hover:shadow-subtle-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg mb-4 flex items-center justify-center relative">
                      <span className="text-6xl">🎓</span>
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">NEW</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                      Graduation Collection
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">Celebrate achievements in style</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">₹1,839</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-muted-foreground ml-1">4.9 (98)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Companies We Work With Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-background to-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Trusted by Leading Companies
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">We're proud to partner with these amazing organizations</p>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-8 sm:space-x-12 md:space-x-16">
              {/* First set of logos */}
              <div className="flex space-x-8 sm:space-x-12 md:space-x-16 shrink-0">
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-gray-600">TechCorp</span>
                </div>
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-blue-600">StartupX</span>
                </div>
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-green-600">EcoBrand</span>
                </div>
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-purple-600">InnovateLab</span>
                </div>
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-orange-600">GlobalCo</span>
                </div>
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-red-600">FutureTech</span>
                </div>
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex space-x-8 sm:space-x-12 md:space-x-16 shrink-0">
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-gray-600">TechCorp</span>
                </div>
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-blue-600">StartupX</span>
                </div>
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-green-600">EcoBrand</span>
                </div>
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-purple-600">InnovateLab</span>
                </div>
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-orange-600">GlobalCo</span>
                </div>
                <div className="flex items-center justify-center w-24 sm:w-32 md:w-40 h-12 sm:h-14 md:h-16 bg-white rounded-lg shadow-sm">
                  <span className="text-sm sm:text-base md:text-lg font-bold text-red-600">FutureTech</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              What Our Clients Say
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">Real feedback from satisfied customers</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="bg-card border-border hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">Sarah Mitchell</h4>
                    <p className="text-sm text-muted-foreground">Marketing Director, TechCorp</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "Exceptional quality and service! Our team loved the custom hoodies. The design process was smooth and the final product exceeded our expectations."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">James Davis</h4>
                    <p className="text-sm text-muted-foreground">CEO, StartupX</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "Fast delivery and amazing customer support. We've ordered multiple times for our events and each time the quality has been outstanding."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">Alex Liu</h4>
                    <p className="text-sm text-muted-foreground">Operations Manager, EcoBrand</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "The eco-friendly options were perfect for our brand values. Great pricing for bulk orders and the customization tool is incredibly user-friendly."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">Maria Rodriguez</h4>
                    <p className="text-sm text-muted-foreground">Event Coordinator, InnovateLab</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "Perfect for our conference swag! The 3D preview helped us visualize the final product. Highly recommend for corporate events."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>TW</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">Tom Wilson</h4>
                    <p className="text-sm text-muted-foreground">HR Director, GlobalCo</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "Employee appreciation gifts that actually get used! The quality is top-notch and the ordering process is streamlined for large quantities."
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>LC</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">Lisa Chen</h4>
                    <p className="text-sm text-muted-foreground">Brand Manager, FutureTech</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  "Outstanding brand consistency across all products. The design team was incredibly helpful in maintaining our brand guidelines throughout the process."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-background to-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Choose & Customize</h3>
                <p className="text-sm text-muted-foreground">Select a product and use our design tool to create your perfect look</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Preview & Order</h3>
                <p className="text-sm text-muted-foreground">See your design in real-time, adjust as needed, and place your order</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Receive & Enjoy</h3>
                <p className="text-sm text-muted-foreground">We print and ship your order directly to you with care</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
