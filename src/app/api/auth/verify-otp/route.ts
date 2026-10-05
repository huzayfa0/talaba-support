import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpCode } from '@/lib/telegram';
import { registerStudentWithPhone } from '@/lib/admin-storage';
import { isDeviceBlocked, clearFailedAttempts } from '@/lib/security-storage';

export async function POST(req: NextRequest) {
  try {
    const { phone, code, name, password, telegramUsername, email, deviceId } = await req.json();

    if (!phone || !code || !password) {
      return NextResponse.json(
        { error: 'Telefon, tasdiqlash kodi va parol kiritilishi shart' },
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip;

    // Qurilma bloklanganligini tekshirish
    const blockCheck = await isDeviceBlocked(deviceId || '', ip);
    if (blockCheck.blocked) {
      return NextResponse.json(
        {
          error: 'Ushbu qurilma bloklangan!',
          isBlocked: true,
          reason: blockCheck.record?.reason,
        },
        { status: 403 }
      );
    }

    // Kodni tekshirish
    const verifyResult = await verifyOtpCode(phone, code);
    if (!verifyResult.valid) {
      return NextResponse.json(
        { error: verifyResult.message },
        { status: 400 }
      );
    }

    // Ro'yxatdan o'tkazish
    const user = await registerStudentWithPhone({
      name: name || 'Talaba',
      phone,
      password,
      telegramUsername,
      email,
    });

    // Urinishlarni tozalash
    await clearFailedAttempts(deviceId || '', ip, phone);

    return NextResponse.json({
      success: true,
      message: 'Ro‘yxatdan o‘tish muvaffaqiyatli yakunlandi!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        telegramUsername: user.telegramUsername,
        university: user.university,
        faculty: user.faculty,
        group: user.group,
        plan: user.plan,
        tokens: user.tokens,
        isLoggedIn: true,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Tasdiqlashda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
