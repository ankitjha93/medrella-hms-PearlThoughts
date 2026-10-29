import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, updateInvoiceStatus } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const invoice = getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { success: false, error: 'status field is required (PAID, PENDING, CANCELLED)' },
        { status: 400 }
      );
    }

    const updated = updateInvoiceStatus(id, body.status, body.paymentMethod);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invoice ${updated.invoiceNumber} status updated to ${updated.status}`,
      invoice: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update invoice' },
      { status: 500 }
    );
  }
}
