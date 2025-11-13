import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe only if secret key is available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
  });
};

export async function POST(req: NextRequest) {
  try {
    // Get Stripe instance
    const stripe = getStripe();
    
    const body = await req.json();
    const { items, customerEmail, orderId, metadata } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // Calculate total amount
    const subtotal = items.reduce((total: number, item: any) => {
      return total + (item.product.base_price * item.quantity);
    }, 0);

    const shipping = metadata?.shipping || 0;
    const discount = metadata?.discount || 0;
    const giftWrapFee = metadata?.giftWrapFee || 0;
    const totalAmount = subtotal + shipping + giftWrapFee - discount;

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.product.name,
          description: `Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'}`,
        },
        unit_amount: Math.round(item.product.base_price * 100), // Convert to paise
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Shipping',
            description: 'Standard delivery',
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    // Add gift wrap as a line item if applicable
    if (giftWrapFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Gift Wrap',
            description: 'Special gift wrapping',
          },
          unit_amount: Math.round(giftWrapFee * 100),
        },
        quantity: 1,
      });
    }

    // Add discount as a negative line item if applicable
    if (discount > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Discount',
            description: metadata?.couponCode ? `Coupon: ${metadata.couponCode}` : 'Applied discount',
          },
          unit_amount: -Math.round(discount * 100), // Negative amount for discount
        },
        quantity: 1,
      });
    }

    // Get the site URL from environment variable or use default
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://Infineight.house';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${siteUrl}/payment/cancel?order_id=${orderId}`,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId,
        userId: metadata?.userId,
        orderNumber: metadata?.orderNumber,
      },
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

