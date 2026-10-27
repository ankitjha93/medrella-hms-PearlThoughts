import { NextRequest, NextResponse } from 'next/server';
import { getDoctorById, getAvailableSlots } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doctor = getDoctorById(id);

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const slots = date ? getAvailableSlots(id, date) : [];

    return NextResponse.json({
      success: true,
      doctor,
      slots,
      data: {
        ...doctor,
        slots,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctor details' },
      { status: 500 }
    );
  }
}
