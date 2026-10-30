import { NextRequest, NextResponse } from 'next/server';
import { processDueReminders, getReminders } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId') || undefined;
    const reminders = getReminders(patientId);
    return NextResponse.json({ success: true, reminders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

export async function POST(_request: NextRequest) {
  try {
    const summary = processDueReminders();
    return NextResponse.json({
      success: true,
      ...summary,
      message: `Processed ${summary.processedCount} reminders (${summary.sentCount} sent, ${summary.cancelledCount} cancelled).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process due reminders' },
      { status: 500 }
    );
  }
}
