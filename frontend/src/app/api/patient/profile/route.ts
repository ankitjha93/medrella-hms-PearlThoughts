import { NextRequest, NextResponse } from 'next/server';
import { getPatientProfile } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || 'pat_1';

    const profile = getPatientProfile(patientId);
    if (!profile) {
      // Default fallback profile for demo
      return NextResponse.json({
        success: true,
        profile: {
          id: patientId,
          mrn: 'MRN-2026-0941',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 234-5678',
          dateOfBirth: '1988-06-14',
          gender: 'Male',
          bloodGroup: 'O+',
          allergies: ['Penicillin', 'Peanuts'],
          chronicConditions: ['Pre-hypertension'],
          emergencyContact: {
            name: 'Mary Doe',
            relationship: 'Spouse',
            phone: '+1 (555) 987-1234',
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch patient profile' },
      { status: 500 }
    );
  }
}
