import { NextResponse } from 'next/server';
import { getHospitalKPIs } from '@/lib/db';

export async function GET() {
  try {
    const stats = getHospitalKPIs();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch hospital metrics' },
      { status: 500 }
    );
  }
}
