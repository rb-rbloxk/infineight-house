'use client';

import { useEffect } from 'react';
import { Product } from '@/lib/supabase';

interface ProductStructuredDataProps {
  product: Product;
}

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infineight.house';
    const productUrl = `${siteUrl}/product/${product.slug}`;
    
    // Get full image URL
    const getFullImageUrl = (imageUrl: string | null) => {
      if (!imageUrl) {
        return `${siteUrl}/images/products/placeholder.png`;
      }
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      return `${siteUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
    };

    const imageUrl = getFullImageUrl(product.base_image_url);
    const additionalImages = product.image_urls && product.image_urls.length > 1
      ? product.image_urls.slice(1).map(img => getFullImageUrl(img))
      : [];

    const structuredData = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.name,
      image: [imageUrl, ...additionalImages],
      sku: product.id,
      mpn: product.id,
      brand: {
        '@type': 'Brand',
        name: 'Infineight',
      },
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'INR',
        price: product.base_price.toString(),
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: product.is_active
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Infineight',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '150',
      },
      category: product.category,
    };

    // Remove existing structured data script if any
    const existingScript = document.getElementById('product-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = document.createElement('script');
    script.id = 'product-structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('product-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [product]);

  return null;
}

