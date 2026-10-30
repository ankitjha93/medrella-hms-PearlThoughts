import { NextRequest, NextResponse } from 'next/server';
import { 
  processRefund, 
  calculateRefundPolicy, 
  getAppointments, 
  getPaymentByAppointmentId 
} from '@/lib/db';

/**
 * GET: Preview Refund Policy Calculation without triggering refund
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json({ success: false, error: 'appointmentId is required' }, { status: 400 });
    }

    const appts = getAppointments({});
    const appointment = appts.find(a => a.id === appointmentId);
    if (!appointment) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }

    const payment = getPaymentByAppointmentId(appointmentId);
    const amount = payment ? payment.amount : appointment.fee || 75;

    const policy = calculateRefundPolicy(appointment, amount);

    return NextResponse.json({
      success: true,
      appointmentId,
      paidAmount: amount,
      refundAmount: policy.refundAmount,
      percentage: policy.percentage,
      policyTier: policy.policyTier,
      policyReason: policy.reason,
      hasOnlinePayment: Boolean(payment && payment.status === 'PAID'),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate refund preview' },
      { status: 500 }
    );
  }
}

/**
 * POST: Execute Refund according to hospital policy or admin override
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, reason, overrideAmount } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'appointmentId is required to process a refund' },
        { status: 400 }
      );
    }

    const result = await processRefund(
      appointmentId,
      reason || 'Patient cancelled visit online',
      overrideAmount !== undefined ? Number(overrideAmount) : undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to process refund' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: result.appointment,
      payment: result.payment,
      refundAmount: result.refundAmount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process refund' },
      { status: 500 }
    );
  }
}

