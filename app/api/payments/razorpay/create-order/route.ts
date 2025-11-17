import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured');
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', orderId, customerEmail, customerName, customerPhone, metadata } = body;

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: 'Amount and order ID are required' },
        { status: 400 }
      );
    }

    // Initialize Razorpay lazily
    const razorpay = getRazorpay();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency.toUpperCase(),
      receipt: orderId,
      notes: {
        orderId: orderId,
        customerEmail: customerEmail || '',
        ...metadata,
      },
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: 'Infineight',
      description: `Order ${orderId}`,
      prefill: {
        name: customerName || '',
        email: customerEmail || '',
        contact: customerPhone || '',
      },
      theme: {
        color: '#FFA500',
      },
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}

