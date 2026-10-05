import { NextRequest, NextResponse } from 'next/server';
import { getDirectMessages, sendDirectMessage } from '@/lib/direct-chat-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const targetId = searchParams.get('targetId');

    if (!userId || !targetId) {
      return NextResponse.json({ error: 'userId va targetId talab qilinadi' }, { status: 400 });
    }

    const messages = await getDirectMessages(userId, targetId);
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Xabarlarni yuklashda xatolik' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderId, senderName, senderPhone, senderPlan, receiverId, receiverName, receiverPhone, text } = body;

    if (!senderId || !receiverId || !text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Xabar matni, yuboruvchi va qabul qiluvchi ko‘rsatilishi shart' },
        { status: 400 }
      );
    }

    const message = await sendDirectMessage({
      senderId,
      senderName: senderName || 'Talaba',
      senderPhone,
      senderPlan,
      receiverId,
      receiverName,
      receiverPhone,
      text: text.trim(),
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Xabarni yuborishda xatolik' }, { status: 500 });
  }
}
