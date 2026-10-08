import { NextRequest, NextResponse } from 'next/server';
import { syncStudentProfile } from '@/lib/admin-storage';
import { UserProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const profile: UserProfile = await req.json();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil ma‘lumotlari yetarli emas' },
        { status: 400 }
      );
    }

    // Agar foydalanuvchi tizimga kirmagan bo'lsa (mehmon bo'lsa) yoki ID/telefoni bo'lmasa,
    // server bazasidan hech kimni ulamaymiz!
    if (!profile.isLoggedIn || (!profile.id && !profile.phone)) {
      return NextResponse.json({
        success: true,
        isGuest: true,
        user: {
          ...profile,
          name: profile.name && profile.name.trim().toLowerCase() !== 'talaba' ? profile.name : 'Talaba',
          email: '',
          plan: 'free',
          tokens: 10,
          isLoggedIn: false,
        },
      });
    }

    const synced = await syncStudentProfile(profile);

    return NextResponse.json({
      success: true,
      user: synced,
      profile: synced,
      isGuest: !synced.isLoggedIn,
    });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Profilni sinxronlashda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
