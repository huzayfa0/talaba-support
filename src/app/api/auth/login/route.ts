import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentLogin, findUserByPhone } from '@/lib/admin-storage';
import { isDeviceBlocked, recordFailedAttempt, clearFailedAttempts } from '@/lib/security-storage';

export async function POST(req: NextRequest) {
  try {
    const { phone, password, deviceId, checkOnlyPhone } = await req.json();

    const identifier = (phone || '').trim();
    if (!identifier || identifier.length < 3) {
      return NextResponse.json(
        { error: 'Iltimos, telefon raqamingiz yoki loginingizni kiriting' },
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip;

    // 1. Qurilma bloklanganligini tekshirish
    const blockCheck = await isDeviceBlocked(deviceId || '', ip);
    if (blockCheck.blocked) {
      return NextResponse.json(
        {
          error: 'DIQQAT: Sizning qurilmangiz 20 marta xato terilgani sababli butunlay bloklangan! Saytga kirish taqiqlangan.',
          isBlocked: true,
          reason: blockCheck.record?.reason,
          blockedAt: blockCheck.record?.blockedAt,
        },
        { status: 403 }
      );
    }

    // Agar foydalanuvchi faqat telefon raqami mavjudligini tekshirayotgan bo'lsa (1-bosqich)
    if (checkOnlyPhone) {
      const existingUser = await findUserByPhone(phone);
      if (!existingUser) {
        return NextResponse.json({
          exists: false,
          message: 'Ushbu telefon raqam bilan hali ro‘yxatdan o‘tilmagan. Ro‘yxatdan o‘tish oynasiga o‘tishingiz mumkin.',
        });
      }
      return NextResponse.json({
        exists: true,
        userName: existingUser.name,
        message: 'Telefon raqam tasdiqlandi. Iltimos, parolingizni kiriting.',
      });
    }

    // 2. Parolni tekshirish (2-bosqich)
    if (!password) {
      return NextResponse.json(
        { error: 'Iltimos, parolni kiriting' },
        { status: 400 }
      );
    }

    const loginResult = await verifyStudentLogin(identifier, password);

    // Agar parol noto'g'ri bo'lsa -> Urinishni hisoblaymiz!
    if (!loginResult.success) {
      const failed = await recordFailedAttempt(deviceId || '', ip, identifier);

      if (failed.isBlockedNow) {
        return NextResponse.json(
          {
            error: `QURILMA BLOKLANDI! Siz ketma-ket ${failed.attempts} marta noto‘g‘ri parol kiritdingiz. Ushbu qurilma orqali saytga kirish butunlay taqiqlandi!`,
            isBlocked: true,
            attempts: failed.attempts,
            maxAttempts: failed.maxAttempts,
          },
          { status: 403 }
        );
      }

      const remaining = failed.maxAttempts - failed.attempts;

      return NextResponse.json(
        {
          error: `${loginResult.message} Qolgan urinishlar: ${remaining} ta (Jami: ${failed.attempts}/${failed.maxAttempts})`,
          attempts: failed.attempts,
          maxAttempts: failed.maxAttempts,
          remainingAttempts: remaining,
          isBlocked: false,
        },
        { status: 401 }
      );
    }

    // Muvaffaqiyatli kirish! Urinishlarni tozalaymiz
    await clearFailedAttempts(deviceId || '', ip, identifier);

    const u = loginResult.user!;

    return NextResponse.json({
      success: true,
      message: 'Muvaffaqiyatli tizimga kirdingiz!',
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        telegramUsername: u.telegramUsername,
        university: u.university,
        faculty: u.faculty,
        group: u.group,
        plan: u.plan,
        tokens: u.tokens,
        isLoggedIn: true,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Tizimga kirishda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
