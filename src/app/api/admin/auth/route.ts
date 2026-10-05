import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminCredentials,
  verifyCurrentAdminPassword,
  updateAdminCredentials,
  addAdminSession,
} from '@/lib/admin-storage';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Login va parol kiritilmadi' },
        { status: 400 }
      );
    }

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Login yoki parol noto‘g‘ri!' },
        { status: 401 }
      );
    }

    // Sessiya kaliti
    const token = `adm_token_${Date.now()}_${Buffer.from(username).toString('base64')}`;

    // Sessiyani audit logiga yozish
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Noma‘lum brauzer';
    let device = 'Kompyuter (Brauzer)';
    if (/Windows/i.test(userAgent)) device = 'Windows PC';
    else if (/Macintosh|Mac OS/i.test(userAgent)) device = 'Apple Mac';
    else if (/Android/i.test(userAgent)) device = 'Android Telefon';
    else if (/iPhone|iPad/i.test(userAgent)) device = 'iPhone / iOS';
    else if (/Linux/i.test(userAgent)) device = 'Linux Qurilma';

    if (/Chrome/i.test(userAgent)) device += ' (Chrome)';
    else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) device += ' (Safari)';
    else if (/Firefox/i.test(userAgent)) device += ' (Firefox)';
    else if (/Edge/i.test(userAgent)) device += ' (Edge)';

    await addAdminSession({
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      token,
      username,
      ip,
      device,
      userAgent,
      loginTime: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Muvaffaqiyatli kirdingiz',
      token,
      username,
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { currentPassword, newUsername, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Joriy parol va yangi parol kiritilishi shart' },
        { status: 400 }
      );
    }

    // Joriy parolni tekshiramiz
    const isValid = await verifyCurrentAdminPassword(currentPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Joriy parol noto‘g‘ri!' },
        { status: 401 }
      );
    }

    const updated = await updateAdminCredentials(newUsername, newPassword);

    if (updated) {
      return NextResponse.json({
        success: true,
        message: 'Admin ma’lumotlari muvaffaqiyatli yangilandi',
      });
    }

    return NextResponse.json(
      { error: 'Yangilashda xatolik yuz berdi' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin password change error:', error);
    return NextResponse.json(
      { error: 'Serverda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
