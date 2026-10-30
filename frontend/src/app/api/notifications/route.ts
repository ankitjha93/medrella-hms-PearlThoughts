import { NextRequest, NextResponse } from 'next/server';
import { 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  addNotification 
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const notifications = getNotifications(userId);
    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, markAll, userId } = body;

    if (markAll) {
      markAllNotificationsRead(userId);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id) {
      const success = markNotificationRead(id);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ success: false, error: 'Provide either id or markAll' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type, actionUrl } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'title and message are required' }, { status: 400 });
    }

    const created = addNotification({
      userId,
      title,
      message,
      type: type || 'APPOINTMENT',
      actionUrl,
    });

    return NextResponse.json({ success: true, notification: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}
