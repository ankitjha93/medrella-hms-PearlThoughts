import { NextRequest, NextResponse } from 'next/server';
import { 
  getAppointments, 
  createAppointment, 
  getDoctorById, 
  isSlotAvailableForBooking,
  scheduleAppointmentReminders,
  addNotification
} from '@/lib/db';
import { NotificationService } from '@/lib/notifications/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || undefined;
    const doctorId = searchParams.get('doctorId') || undefined;

    const appointments = getAppointments({ patientId, doctorId });
    return NextResponse.json({ success: true, appointments, data: appointments });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

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
      startTime,
      endTime,
      durationMinutes,
      symptoms,
    } = body;

    const chosenTime = startTime || time || timeSlot;

    if (!patientId || !doctorId || !date || !chosenTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields (patientId, doctorId, date, time)' },
        { status: 400 }
      );
    }

    const doctor = getDoctorById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Selected doctor not found' },
        { status: 404 }
      );
    }

    // Verify slot is not already booked or held (conflict prevention guardrail)
    const slotCheck = isSlotAvailableForBooking(doctorId, date, chosenTime);
    if (!slotCheck.isAvailable) {
      return NextResponse.json(
        { success: false, error: slotCheck.reason || 'This time slot is already reserved. Please select another time slot.' },
        { status: 409 }
      );
    }

    const appointment = createAppointment({
      patientId,
      patientName: patientName || 'John Doe',
      patientEmail: patientEmail || 'john.doe@example.com',
      patientPhone: patientPhone || '+1 (555) 000-0000',
      doctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialization,
      doctorAvatar: doctor.avatar,
      date,
      time: chosenTime,
      startTime: startTime || chosenTime,
      endTime,
      durationMinutes: durationMinutes || 30,
      fee: doctor.consultationFee,
      symptoms: symptoms || 'General consultation',
    });

    try {
      scheduleAppointmentReminders(appointment);
      NotificationService.notifyBookingConfirmation(appointment, undefined, addNotification);
    } catch (notifErr) {
      console.warn('Failed to schedule reminders or notifications on direct booking:', notifErr);
    }

    return NextResponse.json({ success: true, appointment, data: appointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
