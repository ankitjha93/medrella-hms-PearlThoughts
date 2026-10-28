import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, createAppointment, getDoctorById } from '@/lib/db';

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
      symptoms,
    } = body;

    const chosenTime = time || timeSlot;

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

    // Verify slot is not already booked (conflict prevention guardrail)
    const existing = getAppointments({ doctorId });
    const isConflict = existing.some(
      a => a.date === date && (a.time === chosenTime || a.timeSlot === chosenTime) && a.status !== 'CANCELLED'
    );

    if (isConflict) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already reserved. Please select another time slot.' },
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
      durationMinutes: 30,
      fee: doctor.consultationFee,
      symptoms: symptoms || 'General consultation',
    });

    return NextResponse.json({ success: true, appointment, data: appointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
