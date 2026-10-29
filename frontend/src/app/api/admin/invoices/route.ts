import { NextRequest, NextResponse } from 'next/server';
import { getInvoices, createInvoice } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || undefined;
    const status = searchParams.get('status') || undefined;

    const invoices = getInvoices({ patientId, status });
    return NextResponse.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.patientId || !body.patientName || !body.items || !body.total) {
      return NextResponse.json(
        { success: false, error: 'patientId, patientName, items, and total are required.' },
        { status: 400 }
      );
    }

    const newInvoice = createInvoice({
      appointmentId: body.appointmentId,
      patientId: body.patientId,
      patientName: body.patientName,
      patientMRN: body.patientMRN || 'MRN-2026-0941',
      doctorId: body.doctorId,
      doctorName: body.doctorName,
      date: body.date || new Date().toISOString().split('T')[0],
      items: body.items,
      subtotal: Number(body.subtotal) || Number(body.total),
      discount: Number(body.discount) || 0,
      tax: Number(body.tax) || 0,
      total: Number(body.total),
      status: body.status || 'PENDING',
      paymentMethod: body.paymentMethod,
    });

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
