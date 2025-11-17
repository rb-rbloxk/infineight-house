import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Note: Environment variables are read at runtime in the handler function
// to ensure they're available in serverless environments like Vercel

export async function POST(req: NextRequest) {
  try {
    // Validate PhonePe credentials at runtime
    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    
    if (!merchantId || !saltKey) {
      console.error('PhonePe credentials missing:', {
        hasMerchantId: !!merchantId,
        hasSaltKey: !!saltKey,
        merchantIdLength: merchantId?.length || 0,
        saltKeyLength: saltKey?.length || 0,
      });
      return NextResponse.json(
        { error: 'PhonePe credentials are not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

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

    // Determine the correct PhonePe URL (use test URL if PHONEPE_BASE_URL is set, or if not in production)
    const baseUrl = process.env.PHONEPE_BASE_URL;
    const isProduction = process.env.NODE_ENV === 'production';
    const apiUrl = baseUrl || (
      isProduction
        ? 'https://api.phonepe.com/apis/hermes'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox'
    );

    // Create payment request payload
    const payload = {
      merchantId: merchantId,
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
    const stringToHash = `${base64Payload}/pg/v1/pay${saltKey}`;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = `${sha256Hash}###${saltIndex}`;

    // Log for debugging (remove sensitive data in production)
    console.log('PhonePe Payment Request:', {
      url: apiUrl,
      merchantId: merchantId.substring(0, 10) + '...',
      hasSaltKey: !!saltKey,
      saltIndex,
      amount: payload.amount,
      orderId,
    });

    // Make request to PhonePe API
    const response = await fetch(`${apiUrl}/pg/v1/pay`, {
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
      console.error('PhonePe API error:', {
        status: response.status,
        statusText: response.statusText,
        response: responseData,
        url: apiUrl,
        merchantId: merchantId.substring(0, 10) + '...',
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create PhonePe payment';
      if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.code) {
        errorMessage = `PhonePe Error: ${responseData.code}`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: responseData.code || 'Unknown error',
        },
        { status: response.status || 500 }
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

