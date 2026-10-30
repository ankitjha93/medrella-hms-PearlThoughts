import { NextRequest, NextResponse } from 'next/server';
import { 
  isWebhookProcessed, 
  markWebhookProcessed, 
  verifyPayment, 
  getPaymentByOrderId, 
  releaseSlotHold,
  addAuditLog 
} from '@/lib/db';
import { getPaymentGateway } from '@/lib/payments/gateway';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'Malformed JSON payload' }, { status: 400 });
    }

    const razorpaySignature = request.headers.get('x-razorpay-signature') || '';
    const stripeSignature = request.headers.get('stripe-signature') || '';
    const signature = razorpaySignature || stripeSignature || request.headers.get('x-signature') || '';

    const provider = stripeSignature ? 'STRIPE' : 'RAZORPAY';
    const gateway = getPaymentGateway(provider);

    // 1. Verify Webhook Signature
    const isSignatureValid = gateway.verifyWebhookSignature(rawBody, signature);
    if (!isSignatureValid) {
      return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 401 });
    }

    // 2. Extract Event ID for Idempotent Event Processing
    const eventId = body.id || body.event_id || body.payload?.payment?.entity?.id || `evt_${Date.now()}`;
    if (isWebhookProcessed(eventId)) {
      return NextResponse.json({ success: true, message: 'Event already processed (Idempotent)' }, { status: 200 });
    }

    const eventType = body.event || body.type || 'payment.captured';

    // 3. Process Events
    if (eventType === 'payment.captured' || eventType === 'charge.succeeded') {
      const orderId = body.payload?.payment?.entity?.order_id || body.data?.object?.order_id || body.orderId;
      const paymentId = body.payload?.payment?.entity?.id || body.data?.object?.id || body.paymentId || eventId;

      if (orderId) {
        await verifyPayment({
          orderId,
          paymentId,
          signature: 'valid_test_signature', // internal webhook verification already succeeded
          provider,
          paymentMethod: `${provider} Webhook Capture`,
        });
      }
    } else if (eventType === 'payment.failed') {
      const orderId = body.payload?.payment?.entity?.order_id || body.data?.object?.order_id || body.orderId;
      if (orderId) {
        const payment = getPaymentByOrderId(orderId);
        if (payment) {
          payment.status = 'FAILED';
          releaseSlotHold(payment.doctorId, '', '', payment.appointmentId);
        }
      }
    }

    // 4. Mark Idempotently Processed
    markWebhookProcessed(eventId);

    addAuditLog({
      action: 'PAYMENT_WEBHOOK_PROCESSED',
      actor: { id: 'system_webhook', name: `${provider} Webhook Service`, role: 'ADMIN' },
      resource: `Event ${eventId} (${eventType})`,
      details: `Processed webhook notification from ${provider}.`,
      severity: 'INFO',
    });

    return NextResponse.json({ success: true, processed: true, eventId, event: eventType });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

