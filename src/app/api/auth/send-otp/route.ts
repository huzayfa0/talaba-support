import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramOtp } from '@/lib/telegram';
import { isDeviceBlocked } from '@/lib/security-storage';

export async function POST(req: NextRequest) {
  try {
    const { phone, telegramUsername, deviceId } = await req.json();

    if (!phone || phone.trim().length < 7) {
      return NextResponse.json(
        { error: 'Yaroqli telefon raqam kiritilishi shart (masalan: +998 90 123 45 67)' },
        { status: 400 }
      );
    }

    // IP manzilini aniqlash
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip;

    // Qurilma bloklanganligini tekshirish
    const blockCheck = await isDeviceBlocked(deviceId || '', ip);
    if (blockCheck.blocked) {
      return NextResponse.json(
        {
          error: 'Xavfsizlik talablariga binoan ushbu qurilma bloklangan!',
          isBlocked: true,
          reason: blockCheck.record?.reason,
        },
        { status: 403 }
      );
    }

    const result = await sendTelegramOtp(phone, telegramUsername);

    return NextResponse.json({
      success: true,
      message: result.message,
      isSimulated: result.isSimulated,
      demoCode: result.isSimulated ? result.code : undefined,
      botUsername: result.botUsername,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Tasdiqlash kodini yuborishda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
