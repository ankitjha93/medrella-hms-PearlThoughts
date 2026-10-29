import { NextRequest, NextResponse } from 'next/server';
import { getDoctors, createDoctor } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const specialty = searchParams.get('specialty') || undefined;

    const doctors = getDoctors(search, specialty);
    return NextResponse.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.specialization || !body.consultationFee) {
      return NextResponse.json(
        { success: false, error: 'Name, specialization, and consultationFee are required.' },
        { status: 400 }
      );
    }

    const newDoctor = createDoctor({
      name: body.name.trim(),
      specialization: body.specialization.trim(),
      experienceYears: Number(body.experienceYears) || 5,
      consultationFee: Number(body.consultationFee),
      avatar: body.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
      about: body.about || `Board-certified specialist in ${body.specialization}. Dedicated to evidence-based clinical healthcare.`,
      education: body.education || 'MD - State Medical University',
      location: body.location || 'Specialty OPD Clinic, Suite 301',
      hospital: body.hospital || 'Medrella Central Hospital',
      departmentCode: body.departmentCode || 'GENMED',
      roomNumber: body.roomNumber || 'Room 301',
      availableDays: body.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });

    return NextResponse.json({
      success: true,
      message: 'Doctor specialist successfully onboarded',
      doctor: newDoctor,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to onboard doctor' },
      { status: 500 }
    );
  }
}
