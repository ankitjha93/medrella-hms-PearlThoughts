import { NextRequest, NextResponse } from 'next/server';
import { getDoctors } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const specialty = searchParams.get('specialty') || undefined;

    const doctors = getDoctors(search, specialty);
    return NextResponse.json({ success: true, doctors, data: doctors });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}
