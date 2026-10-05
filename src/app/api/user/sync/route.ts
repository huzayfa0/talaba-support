import { NextRequest, NextResponse } from 'next/server';
import { syncStudentProfile } from '@/lib/admin-storage';
import { UserProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const profile: UserProfile = await req.json();

    if (!profile || !profile.name) {
      return NextResponse.json(
        { error: 'Profil ma‘lumotlari yetarli emas' },
        { status: 400 }
      );
    }

    const synced = await syncStudentProfile(profile);

    return NextResponse.json({
      success: true,
      user: synced,
      profile: synced,
    });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json(
      { error: 'Profilni sinxronlashda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
