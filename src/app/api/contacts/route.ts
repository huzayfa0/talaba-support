import { NextRequest, NextResponse } from 'next/server';
import {
  searchStudentByAccountOrPhone,
  getSavedContactsList,
  saveContactForUser,
  deleteContactAndMessages,
} from '@/lib/direct-chat-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId talab qilinadi' }, { status: 400 });
    }

    const contacts = await getSavedContactsList(userId);
    return NextResponse.json({ success: true, contacts });
  } catch (error) {
    console.error('Contacts GET error:', error);
    return NextResponse.json({ error: 'Kontaktlarni yuklashda xatolik' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, ownerId, targetUserId } = body;

    // 1. Qidiruv
    if (action === 'search') {
      if (!query || query.trim().length === 0) {
        return NextResponse.json({ success: true, results: [] });
      }
      const results = await searchStudentByAccountOrPhone(query);
      return NextResponse.json({ success: true, results });
    }

    // 2. Kontaktlarga saqlash
    if (action === 'save') {
      if (!ownerId || !targetUserId) {
        return NextResponse.json({ error: 'ownerId va targetUserId kiritilishi shart' }, { status: 400 });
      }
      const saved = await saveContactForUser(ownerId, targetUserId);
      return NextResponse.json({ success: true, saved, message: 'Kontakt muvaffaqiyatli saqlandi!' });
    }

    return NextResponse.json({ error: 'Noma‘lum amal' }, { status: 400 });
  } catch (error) {
    console.error('Contacts POST error:', error);
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    const targetUserId = searchParams.get('targetUserId');

    if (!ownerId || !targetUserId) {
      return NextResponse.json(
        { error: 'ownerId va targetUserId ko‘rsatilishi shart' },
        { status: 400 }
      );
    }

    const deleted = await deleteContactAndMessages(ownerId, targetUserId);
    return NextResponse.json({
      success: true,
      deleted,
      message: 'Kontakt va barcha yozishmalar muvaffaqiyatli o‘chirildi!',
    });
  } catch (error) {
    console.error('Contacts DELETE error:', error);
    return NextResponse.json({ error: 'O‘chirishda xatolik yuz berdi' }, { status: 500 });
  }
}

