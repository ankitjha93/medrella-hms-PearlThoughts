import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature, provider, paymentMethod } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification credentials (orderId, paymentId, signature)' },
        { status: 400 }
      );
    }

    const result = await verifyPayment({
      orderId,
      paymentId,
      signature,
      provider,
      paymentMethod,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: result.payment,
      appointment: result.appointment,
      invoice: result.invoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

