import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminUsersAndStats,
  updateUserPlan,
  updateUserPassword,
  createAdminUser,
  deleteAdminUser,
  updateStudentProfileDirect,
} from '@/lib/admin-storage';

export async function GET() {
  try {
    const data = await getAdminUsersAndStats();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json(
      { error: 'Foydalanuvchilarni yuklashda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, plan, tokens, isBlocked, notes, password } = body;

    // 1. Talaba ma'lumotlarini (OTM, fakultet, guruh, telefon, ism) to'g'ridan-to'g'ri yangilash
    if (action === 'update_details') {
      if (!userId) {
        return NextResponse.json(
          { error: 'userId maydoni kiritilishi shart' },
          { status: 400 }
        );
      }
      const updatedUser = await updateStudentProfileDirect(userId, body);
      if (!updatedUser) {
        return NextResponse.json(
          { error: 'Foydalanuvchi topilmadi' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Talaba ma‘lumotlari muvaffaqiyatli yangilandi',
        user: updatedUser,
      });
    }

    // 1. Talaba parolini yangilash / tiklash
    if (action === 'reset_password' || action === 'update_password') {
      if (!userId || !password) {
        return NextResponse.json(
          { error: 'userId va yangi parol kiritilishi shart' },
          { status: 400 }
        );
      }
      const updatedUser = await updateUserPassword(userId, password);
      if (!updatedUser) {
        return NextResponse.json(
          { error: 'Foydalanuvchi topilmadi' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Talaba paroli muvaffaqiyatli yangilandi',
        user: updatedUser,
      });
    }

    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'userId va plan maydonlari kiritilishi shart' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserPlan(userId, plan, tokens, isBlocked, notes);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Foydalanuvchi tarifi muvaffaqiyatli yangilandi',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Admin users POST error:', error);
    return NextResponse.json(
      { error: 'Tarifni yangilashda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Ism va email kiritilishi shart' },
        { status: 400 }
      );
    }

    const newUser = await createAdminUser(body);

    return NextResponse.json({
      success: true,
      message: 'Yangi foydalanuvchi muvaffaqiyatli qo‘shildi',
      user: newUser,
    });
  } catch (error) {
    console.error('Admin users PUT error:', error);
    return NextResponse.json(
      { error: 'Foydalanuvchi yaratishda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    const deleted = await deleteAdminUser(userId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Foydalanuvchi topilmadi yoki o‘chirib bo‘lmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Foydalanuvchi muvaffaqiyatli o‘chirildi',
    });
  } catch (error) {
    console.error('Admin users DELETE error:', error);
    return NextResponse.json(
      { error: 'O‘chirishda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
