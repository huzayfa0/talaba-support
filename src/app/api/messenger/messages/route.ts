import { NextRequest, NextResponse } from 'next/server';
import { getGroupMessages, sendGroupMessage } from '@/lib/messenger-storage';
import { UserPlan } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ error: 'Guruh ID si kiritilishi shart' }, { status: 400 });
    }

    const messages = await getGroupMessages(groupId);
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching group messages:', error);
    return NextResponse.json({ error: 'Xabarlarni yuklashda xatolik' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, senderId, senderName, senderRole, senderPlan, text, attachment } = body;

    if (!groupId || !text || !text.trim()) {
      return NextResponse.json({ error: 'Guruh va xabar matni talab qilinadi' }, { status: 400 });
    }

    // Free foydalanuvchilar faqat ko'rish rejimida
    if (senderPlan === 'free') {
      return NextResponse.json(
        {
          error: 'Oddiy (Free) tarifda xabar yozish cheklangan. Premium yoki Ultra VIP tarifiga o‘ting!',
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    const message = await sendGroupMessage({
      groupId,
      senderId: senderId || `user-${Date.now()}`,
      senderName: senderName || 'Hurmatli Talaba',
      senderRole: senderRole || 'Talaba',
      senderPlan: (senderPlan as UserPlan) || 'premium',
      text,
      attachment,
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Xabar yuborishda xatolik' }, { status: 500 });
  }
}
