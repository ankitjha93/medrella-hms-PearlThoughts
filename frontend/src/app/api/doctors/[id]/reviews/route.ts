import { NextRequest, NextResponse } from 'next/server';
import { addDoctorReview, getDoctorById } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { patientName, rating, comment } = body;

    if (!rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Rating (1-5) and comment are required' },
        { status: 400 }
      );
    }

    const doctor = getDoctorById(id);
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const result = addDoctorReview(id, {
      patientName,
      rating: Number(rating),
      comment: String(comment),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully',
        doctor: result.doctor,
        review: result.review,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to submit review' },
      { status: 500 }
    );
  }
}

