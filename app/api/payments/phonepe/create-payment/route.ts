import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || '';
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL || 'https://api.phonepe.com/apis/hermes';

// PhonePe uses UAT and Production environments
const isProduction = process.env.NODE_ENV === 'production';
const phonepeUrl = isProduction
  ? 'https://api.phonepe.com/apis/hermes'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, orderId, customerEmail, customerPhone, redirectUrl, metadata } = body;

    if (!amount || !orderId) {
      return NextResponse.json(
        { error: 'Amount and order ID are required' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://infineight.house';
    const callbackUrl = `${siteUrl}/api/payments/phonepe/callback`;
    const redirectUrlFinal = redirectUrl || `${siteUrl}/payment/success?order_id=${orderId}`;

    // Create payment request payload
    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: orderId,
      merchantUserId: metadata?.userId || 'USER_' + Date.now(),
      amount: Math.round(amount * 100), // Convert to paise
      redirectUrl: redirectUrlFinal,
      redirectMode: 'REDIRECT',
      callbackUrl: callbackUrl,
      mobileNumber: customerPhone || '',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // Create base64 encoded payload
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

    // Create X-VERIFY header (SHA256 hash)
    const stringToHash = `${base64Payload}/pg/v1/pay${PHONEPE_SALT_KEY}`;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = `${sha256Hash}###${PHONEPE_SALT_INDEX}`;

    // Make request to PhonePe API
    const response = await fetch(`${phonepeUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-VERIFY': xVerify,
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.success !== true) {
      console.error('PhonePe API error:', responseData);
      return NextResponse.json(
        { error: responseData.message || 'Failed to create PhonePe payment' },
        { status: 500 }
      );
    }

    // Return the redirect URL
    return NextResponse.json({
      success: true,
      redirectUrl: responseData.data.instrumentResponse.redirectInfo.url,
      merchantTransactionId: orderId,
    });
  } catch (error: any) {
    console.error('PhonePe payment creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create PhonePe payment' },
      { status: 500 }
    );
  }
}

