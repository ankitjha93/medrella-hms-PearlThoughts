import { NextRequest, NextResponse } from 'next/server';
import { getDoctorAvailability, updateDoctorAvailability } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'doctorId is required' },
        { status: 400 }
      );
    }

    const availabilities = getDoctorAvailability(doctorId);
    return NextResponse.json({
      success: true,
      availability: availabilities[0] || null,
      availabilities,
      data: availabilities,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, availabilities, startTime, endTime, slotDurationMinutes, daysOfWeek, blackoutDates } = body;

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'doctorId is required' },
        { status: 400 }
      );
    }

    let toSave: any[] = [];
    if (Array.isArray(availabilities)) {
      toSave = availabilities;
    } else if (startTime && endTime) {
      toSave = [
        {
          id: `av_${doctorId}`,
          doctorId,
          dayOfWeek: 'Monday',
          daysOfWeek: daysOfWeek || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime,
          endTime,
          slotDurationMinutes: slotDurationMinutes || 30,
          blackoutDates: Array.isArray(blackoutDates) ? blackoutDates : [],
          maxCapacity: 1,
          isActive: true,
        },
      ];
    }

    const updated = updateDoctorAvailability(doctorId, toSave);
    return NextResponse.json({
      success: true,
      availability: updated[0] || null,
      availabilities: updated,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}
