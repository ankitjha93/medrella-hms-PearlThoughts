import { NextRequest, NextResponse } from 'next/server';
import { createPaymentOrder } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      date,
      time,
      timeSlot,
      symptoms,
      provider,
      currency,
    } = body;

    const chosenTime = time || timeSlot;

    if (!patientId || !doctorId || !date || !chosenTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields (patientId, doctorId, date, time)' },
        { status: 400 }
      );
    }

    const result = await createPaymentOrder({
      patientId,
      patientName: patientName || 'Patient',
      patientEmail: patientEmail || 'patient@medrella.com',
      patientPhone,
      doctorId,
      date,
      time: chosenTime,
      symptoms,
      provider,
      currency: currency || 'USD',
    });

    if (!result.success) {
      // 409 Conflict if slot is held or booked
      const isConflict = result.error?.includes('reserved') || result.error?.includes('booked') || result.error?.includes('held');
      return NextResponse.json(
        { success: false, error: result.error },
        { status: isConflict ? 409 : 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orderId: result.orderId,
        payment: result.payment,
        appointment: result.appointment,
        expiresAt: result.expiresAt,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to initialize payment order' },
      { status: 500 }
    );
  }
}

