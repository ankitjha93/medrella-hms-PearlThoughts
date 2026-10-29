import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, addAuditLog } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 50;

    const logs = getAuditLogs(limit);
    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.action || !body.actor || !body.resource) {
      return NextResponse.json(
        { success: false, error: 'action, actor, and resource are required' },
        { status: 400 }
      );
    }

    const log = addAuditLog({
      action: body.action,
      actor: body.actor,
      resource: body.resource,
      details: body.details,
      severity: body.severity || 'INFO',
    });

    return NextResponse.json({
      success: true,
      log,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to log audit event' },
      { status: 500 }
    );
  }
}
