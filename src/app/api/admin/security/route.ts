import { NextRequest, NextResponse } from 'next/server';
import {
  getBlockedDevices,
  unblockDevice,
  getSecuritySettings,
  updateSecuritySettings,
} from '@/lib/security-storage';

export async function GET() {
  try {
    const [blockedDevices, settings] = await Promise.all([
      getBlockedDevices(),
      getSecuritySettings(),
    ]);

    return NextResponse.json({
      success: true,
      blockedDevices,
      settings,
    });
  } catch (error) {
    console.error('Admin security GET error:', error);
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, settings } = body;
    const deviceId = body.deviceId || body.target || body.id;

    if (action === 'unblock' && deviceId) {
      const unblocked = await unblockDevice(deviceId);
      return NextResponse.json({
        success: true,
        unblocked,
        message: 'Qurilma blokdan muvaffaqiyatli chiqarildi!',
      });
    }

    if (action === 'update_settings' && settings) {
      const updated = await updateSecuritySettings(settings);
      return NextResponse.json({
        success: true,
        settings: updated,
        message: 'Xavfsizlik sozlamalari yangilandi!',
      });
    }

    return NextResponse.json({ error: 'Noma‘lum amal' }, { status: 400 });
  } catch (error) {
    console.error('Admin security POST error:', error);
    return NextResponse.json({ error: 'Sozlamalarni saqlashda xatolik' }, { status: 500 });
  }
}
