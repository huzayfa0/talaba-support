import { NextRequest, NextResponse } from 'next/server';
import { updateGroupLiveState } from '@/lib/messenger-storage';
import { UserPlan } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, isLive, speaker } = body;

    if (!groupId) {
      return NextResponse.json({ error: 'Guruh ID si kiritilishi shart' }, { status: 400 });
    }

    if (isLive && speaker?.plan !== 'ultra') {
      return NextResponse.json(
        {
          error: 'Jonli dars (Kamera va Ekran ulashish) faqat Ultra VIP foydalanuvchilar uchun!',
          requiresUltra: true,
        },
        { status: 403 }
      );
    }

    const updatedGroup = await updateGroupLiveState(
      groupId,
      isLive,
      isLive && speaker
        ? {
            name: speaker.name,
            plan: (speaker.plan as UserPlan) || 'ultra',
            hasScreenShare: Boolean(speaker.hasScreenShare),
            hasCamera: Boolean(speaker.hasCamera),
          }
        : undefined
    );

    return NextResponse.json({ success: true, group: updatedGroup });
  } catch (error) {
    console.error('Error updating live state:', error);
    return NextResponse.json({ error: 'Jonli dars holatini yangilashda xatolik' }, { status: 500 });
  }
}
