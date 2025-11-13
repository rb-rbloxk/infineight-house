import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a server-side Supabase client
const supabase = supabaseUrl && supabaseKey && !supabaseKey.startsWith('http')
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Helper function to escape XML
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper function to get full image URL
function getFullImageUrl(imageUrl: string | null): string {
  if (!imageUrl) {
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://infineight.house'}/images/products/placeholder.png`;
  }
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Otherwise, prepend the site URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infineight.house';
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

// Map category to Google product type
function getGoogleProductType(category: string): string {
  const categoryMap: Record<string, string> = {
    "Men's Apparel": "Apparel & Accessories > Clothing > Shirts & Tops",
    "Women's Apparel": "Apparel & Accessories > Clothing > Shirts & Tops",
    "Unisex & Custom Wear": "Apparel & Accessories > Clothing > Shirts & Tops",
    "Gifting & Hampers": "Home & Garden > Gift Baskets",
    "Mugs, Bottles & Drinkware": "Home & Garden > Kitchen & Dining > Drinkware",
    "Corporate Kits & Sets": "Office Products > Office Supplies",
    "Accessories & Essentials": "Apparel & Accessories > Clothing Accessories",
  };
  
  return categoryMap[category] || "Apparel & Accessories > Clothing";
}

// Map category to Google product category
function getGoogleCategory(category: string): string {
  if (category.includes("Apparel") || category.includes("Wear")) {
    return "1604"; // Apparel & Accessories > Clothing
  }
  if (category.includes("Gift") || category.includes("Hamper")) {
    return "117"; // Home & Garden > Gift Baskets
  }
  if (category.includes("Mug") || category.includes("Bottle") || category.includes("Drinkware")) {
    return "206"; // Home & Garden > Kitchen & Dining > Drinkware
  }
  if (category.includes("Corporate") || category.includes("Kit")) {
    return "783"; // Office Products
  }
  return "1604"; // Default to Apparel
}

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Fetch all active products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infineight.house';
    const currentDate = new Date().toISOString();

    // Generate XML feed
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>Infineight Products</title>\n`;
    xml += `    <link>${siteUrl}</link>\n`;
    xml += `    <description>Infineight - Custom T-Shirts &amp; Corporate Gifting Products</description>\n`;
    xml += `    <lastBuildDate>${currentDate}</lastBuildDate>\n\n`;

    // Add each product
    products?.forEach((product) => {
      const productUrl = `${siteUrl}/product/${product.slug}`;
      const imageUrl = getFullImageUrl(product.base_image_url);
      const additionalImages = product.image_urls && product.image_urls.length > 1
        ? product.image_urls.slice(1).map((img: string) => getFullImageUrl(img)).join(',')
        : '';
      
      const price = parseFloat(product.base_price.toString()).toFixed(2);
      const googleProductType = getGoogleProductType(product.category);
      const googleCategory = getGoogleCategory(product.category);
      const condition = 'new';
      const availability = 'in stock';

      xml += `    <item>\n`;
      xml += `      <g:id>${escapeXml(product.id)}</g:id>\n`;
      xml += `      <title>${escapeXml(product.name)}</title>\n`;
      xml += `      <description>${escapeXml(product.description || product.name)}</description>\n`;
      xml += `      <link>${escapeXml(productUrl)}</link>\n`;
      xml += `      <g:image_link>${escapeXml(imageUrl)}</g:image_link>\n`;
      
      if (additionalImages) {
        xml += `      <g:additional_image_link>${escapeXml(additionalImages)}</g:additional_image_link>\n`;
      }
      
      xml += `      <g:price>${price} INR</g:price>\n`;
      xml += `      <g:currency_code>INR</g:currency_code>\n`;
      xml += `      <g:availability>${availability}</g:availability>\n`;
      xml += `      <g:condition>${condition}</g:condition>\n`;
      xml += `      <g:product_type>${escapeXml(googleProductType)}</g:product_type>\n`;
      xml += `      <g:google_product_category>${googleCategory}</g:google_product_category>\n`;
      xml += `      <g:brand>Infineight</g:brand>\n`;
      xml += `      <g:mpn>${escapeXml(product.id)}</g:mpn>\n`;
      xml += `      <g:identifier_exists>no</g:identifier_exists>\n`;
      
      // Add sizes if available
      if (product.available_sizes && product.available_sizes.length > 0) {
        xml += `      <g:size>${escapeXml(product.available_sizes.join(', '))}</g:size>\n`;
      }
      
      // Add colors if available
      if (product.available_colors && product.available_colors.length > 0) {
        xml += `      <g:color>${escapeXml(product.available_colors.join(', '))}</g:color>\n`;
      }
      
      xml += `      <g:custom_label_0>${escapeXml(product.category)}</g:custom_label_0>\n`;
      
      if (product.is_customizable) {
        xml += `      <g:custom_label_1>Customizable</g:custom_label_1>\n`;
      }
      
      xml += `    </item>\n\n`;
    });

    xml += `  </channel>\n`;
    xml += `</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating Google Merchant feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

