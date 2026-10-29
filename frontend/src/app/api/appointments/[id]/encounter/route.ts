import { NextRequest, NextResponse } from 'next/server';
import { recordSOAPEncounter } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!body.diagnosis || !body.medicines || body.medicines.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Diagnosis and at least one prescribed medicine are required.' },
        { status: 400 }
      );
    }

    const result = recordSOAPEncounter(id, {
      vitals: body.vitals,
      diagnosis: body.diagnosis,
      medicines: body.medicines,
      advice: body.advice,
      followUpDate: body.followUpDate,
      labOrders: body.labOrders || [],
      doctorNotes: body.doctorNotes,
      chiefComplaint: body.chiefComplaint,
    });

    return NextResponse.json({
      success: true,
      message: 'SOAP clinical encounter recorded, prescription signed, and billing invoice generated.',
      appointment: result.appointment,
      invoice: result.invoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record SOAP encounter' },
      { status: 500 }
    );
  }
}
