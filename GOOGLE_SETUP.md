# Google Analytics & Google Merchant Center Setup Guide

This guide will help you set up Google Analytics 4 (GA4) and Google Merchant Center for your Infineight e-commerce store.

## Prerequisites

- Google account
- Access to Google Analytics
- Access to Google Merchant Center
- Your website domain (e.g., https://infineight.house)

## Part 1: Google Analytics 4 (GA4) Setup

### Step 1: Create a GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon) in the bottom left
3. In the **Property** column, click **Create Property**
4. Enter your property name (e.g., "Infineight Store")
5. Select your reporting time zone and currency (INR)
6. Click **Next** and complete the business information
7. Click **Create**

### Step 2: Get Your Measurement ID

1. In your GA4 property, go to **Admin** > **Data Streams**
2. Click **Add stream** > **Web**
3. Enter your website URL (e.g., https://infineight.house)
4. Enter a stream name (e.g., "Infineight Website")
5. Click **Create stream**
6. Copy your **Measurement ID** (format: G-XXXXXXXXXX)

### Step 3: Add Measurement ID to Environment Variables

1. Create or update your `.env.local` file in the project root:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://infineight.house
```

2. Replace `G-XXXXXXXXXX` with your actual Measurement ID
3. Replace the site URL with your actual domain

### Step 4: Verify Installation

1. Restart your development server
2. Visit your website
3. In Google Analytics, go to **Reports** > **Realtime**
4. You should see your visit appear within a few seconds

## Part 2: Google Merchant Center Setup

### Step 1: Create a Merchant Center Account

1. Go to [Google Merchant Center](https://merchants.google.com/)
2. Click **Get Started** or **Sign In**
3. Enter your business information:
   - Business name: Infineight
   - Country: India
   - Website URL: https://infineight.house
4. Complete the account setup

### Step 2: Verify Your Website

1. In Merchant Center, go to **Settings** > **Website**
2. Choose a verification method:
   - **HTML tag**: Add the provided meta tag to your site
   - **Google Analytics**: Use your GA4 property
   - **Google Tag Manager**: If you're using GTM
3. Complete verification (may take a few hours)

### Step 3: Set Up Product Feed

1. In Merchant Center, go to **Products** > **Feeds**
2. Click the **+** button to create a new feed
3. Select **India** as your target country
4. Choose **Primary feed**
5. Enter a feed name (e.g., "Infineight Products")
6. Select **Scheduled fetch** as the input method
7. Enter your feed URL: `https://infineight.house/api/google-merchant-feed`
8. Set fetch schedule (recommended: Daily)
9. Click **Create feed**

### Step 4: Configure Feed Settings

1. Click on your feed to open settings
2. Under **Feed rules**, ensure:
   - **Product ID**: Maps to `g:id`
   - **Title**: Maps to `title`
   - **Description**: Maps to `description`
   - **Link**: Maps to `link`
   - **Image link**: Maps to `g:image_link`
   - **Price**: Maps to `g:price`
   - **Availability**: Maps to `g:availability`
   - **Condition**: Maps to `g:condition`
   - **Brand**: Maps to `g:brand`
   - **Product type**: Maps to `g:product_type`
   - **Google product category**: Maps to `g:google_product_category`

### Step 5: Test Your Feed

1. After creating the feed, Google will fetch it automatically
2. Go to **Products** > **Diagnostics** to check for errors
3. Fix any issues reported:
   - Missing required fields
   - Invalid image URLs
   - Price format issues
   - Category mismatches

### Step 6: Submit Products for Review

1. Once your feed has no errors, products will be automatically submitted
2. Go to **Products** > **All products** to see your product status
3. Products may take 3-5 business days to be approved
4. Check **Products** > **Issues** for any problems

## Part 3: E-commerce Tracking

The implementation includes automatic tracking for:

- **Product views**: When users view product pages
- **Add to cart**: When items are added to cart
- **Remove from cart**: When items are removed
- **Begin checkout**: When users start checkout
- **Purchase**: When orders are completed

All events are automatically sent to Google Analytics with product details.

## Part 4: Structured Data

Product pages include JSON-LD structured data for:
- Product information
- Pricing
- Availability
- Ratings
- Brand information

This helps Google understand your products better and may improve search visibility.

## Troubleshooting

### Analytics Not Working

1. Check that `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
2. Verify the ID format (should start with `G-`)
3. Check browser console for errors
4. Use Google Tag Assistant browser extension to debug

### Merchant Center Feed Issues

1. **Feed not accessible**: 
   - Ensure your site is publicly accessible
   - Check that the API route `/api/google-merchant-feed` is working
   - Visit the URL directly in a browser to test

2. **Missing products**:
   - Ensure products have `is_active = true` in database
   - Check that products have required fields (name, price, image)
   - Verify image URLs are accessible

3. **Price format errors**:
   - Prices must be in format: `XX.XX INR`
   - Ensure prices are positive numbers

4. **Image issues**:
   - Images must be accessible via HTTPS
   - Minimum size: 100x100 pixels
   - Recommended: 800x800 pixels or larger
   - Supported formats: JPG, PNG, GIF, BMP

### Testing Your Feed

You can test your feed URL directly:
```
https://infineight.house/api/google-merchant-feed
```

This should return an XML file with all your products.

## Additional Resources

- [Google Analytics Help](https://support.google.com/analytics)
- [Google Merchant Center Help](https://support.google.com/merchants)
- [Product Data Specification](https://support.google.com/merchants/answer/7052112)
- [GA4 E-commerce Events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Google's documentation
3. Check your browser console for errors
4. Verify all environment variables are set correctly

