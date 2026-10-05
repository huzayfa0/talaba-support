import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessions, revokeAdminSession } from '@/lib/admin-storage';

export async function GET() {
  try {
    const sessions = await getAdminSessions();
    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Admin sessions GET error:', error);
    return NextResponse.json({ error: 'Sessiyalarni olishda xatolik' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, sessionId } = await req.json();

    if (action === 'revoke' && sessionId) {
      const revoked = await revokeAdminSession(sessionId);
      return NextResponse.json({
        success: true,
        revoked,
        message: 'Sessiya muvaffaqiyatli yakunlandi',
      });
    }

    return NextResponse.json({ error: 'Noma‘lum amal' }, { status: 400 });
  } catch (error) {
    console.error('Admin sessions POST error:', error);
    return NextResponse.json({ error: 'Sessiyani yakunlashda xatolik' }, { status: 500 });
  }
}
