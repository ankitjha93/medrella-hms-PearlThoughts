import { NextResponse } from 'next/server';
import { getDepartments } from '@/lib/db';

export async function GET() {
  try {
    const departments = getDepartments();
    return NextResponse.json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}
