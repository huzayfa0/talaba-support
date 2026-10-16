import { NextRequest, NextResponse } from 'next/server';
import { registerStudent } from '@/lib/admin-storage';
import { isDeviceBlocked, clearFailedAttempts } from '@/lib/security-storage';

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      username,
      email,
      phone,
      university,
      gender,
      password,
      telegramUsername,
      deviceId,
    } = await req.json();

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

    // Registratsiya funksiyasini chaqirish
    const result = await registerStudent({
      name,
      username,
      email,
      phone,
      university,
      gender,
      password,
      telegramUsername,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Ro‘yxatdan o‘tishda xatolik yuz berdi' },
        { status: 400 }
      );
    }

    const user = result.user;

    // Qurilmadagi oldingi xatolik urinishlarini tozalash
    await clearFailedAttempts(deviceId || '', ip, phone);

    return NextResponse.json({
      success: true,
      message: 'Muvaffaqiyatli ro‘yxatdan o‘tdingiz!',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
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
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Ro‘yxatdan o‘tishda server xatoligi yuz berdi' },
      { status: 500 }
    );
  }
}
