import { NextRequest, NextResponse } from 'next/server';
import { updateAppointmentStatus, rescheduleAppointment } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status, cancellationReason, prescription, newDate, newTime, reason } = body;

    // Handle appointment rescheduling
    if (action === 'RESCHEDULE') {
      if (!newDate || !newTime) {
        return NextResponse.json(
          { success: false, error: 'newDate and newTime are required to reschedule' },
          { status: 400 }
        );
      }

      try {
        const rescheduled = rescheduleAppointment(id, newDate, newTime, reason);
        if (!rescheduled) {
          return NextResponse.json(
            { success: false, error: 'Appointment not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, appointment: rescheduled, data: rescheduled });
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: err.message || 'Failed to reschedule appointment' },
          { status: 409 }
        );
      }
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const updated = updateAppointmentStatus(id, status, cancellationReason, prescription);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, appointment: updated, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}
