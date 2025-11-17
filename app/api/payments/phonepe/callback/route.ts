import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || '';
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '';
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { response } = body;

    if (!response) {
      return NextResponse.json(
        { error: 'Missing response data' },
        { status: 400 }
      );
    }

    // Decode the base64 response
    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'));

    // Verify the X-VERIFY header
    const xVerify = req.headers.get('x-verify');
    if (!xVerify) {
      return NextResponse.json(
        { error: 'Missing X-VERIFY header' },
        { status: 400 }
      );
    }

    // Verify signature
    const stringToVerify = `${response}/pg/v1/status/${PHONEPE_MERCHANT_ID}${PHONEPE_SALT_KEY}`;
    const sha256Hash = crypto.createHash('sha256').update(stringToVerify).digest('hex');
    const expectedXVerify = `${sha256Hash}###${PHONEPE_SALT_INDEX}`;

    if (xVerify !== expectedXVerify) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const { merchantTransactionId, transactionId, code, state } = decodedResponse;

    // Find order by merchant transaction ID (which is our order_number)
    // We need to find the order by order_number and get the actual order ID
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', merchantTransactionId)
      .limit(1);

    if (fetchError || !orders || orders.length === 0) {
      console.error('Order not found:', merchantTransactionId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderId = orders[0].id;

    // Update order based on payment status
    if (code === 'PAYMENT_SUCCESS' && state === 'COMPLETED') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          payment_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        );
      }
    } else {
      // Payment failed
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Callback processed',
    });
  } catch (error: any) {
    console.error('PhonePe callback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process callback' },
      { status: 500 }
    );
  }
}

// Handle GET requests for status check
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const merchantTransactionId = searchParams.get('merchantTransactionId');

    if (!merchantTransactionId) {
      return NextResponse.json(
        { error: 'Missing merchant transaction ID' },
        { status: 400 }
      );
    }

    // Find order
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, payment_status, status')
      .eq('order_number', merchantTransactionId)
      .limit(1);

    if (fetchError || !orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderId: orders[0].id,
      paymentStatus: orders[0].payment_status,
      status: orders[0].status,
    });
  } catch (error: any) {
    console.error('PhonePe status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}

