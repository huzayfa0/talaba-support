import { NextRequest, NextResponse } from 'next/server';
import {
  getStudyGroups,
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  addMemberToGroup,
} from '@/lib/messenger-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const mode = (searchParams.get('mode') as 'my' | 'all') || (userId ? 'my' : 'all');

    const groups = await getStudyGroups(userId, mode);
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error('Error fetching study groups:', error);
    return NextResponse.json({ error: 'Guruhlarni yuklashda xatolik' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'create';

    // 1. Guruhga o'zi a'zo bo'lib qo'shilish
    if (action === 'join') {
      const { groupId, userId, userName } = body;
      if (!groupId || !userId) {
        return NextResponse.json({ error: 'Guruh yoki foydalanuvchi ko‘rsatilmadi' }, { status: 400 });
      }
      const updatedGroup = await joinStudyGroup(groupId, userId, userName);
      return NextResponse.json({ success: true, group: updatedGroup });
    }

    // 2. Guruhdan chiqish
    if (action === 'leave') {
      const { groupId, userId } = body;
      if (!groupId || !userId) {
        return NextResponse.json({ error: 'Guruh yoki foydalanuvchi ko‘rsatilmadi' }, { status: 400 });
      }
      const updatedGroup = await leaveStudyGroup(groupId, userId);
      return NextResponse.json({ success: true, group: updatedGroup });
    }

    // 3. Boshqa talabani guruhga a'zo qilish (Telefon raqam / ID orqali)
    if (action === 'add_member') {
      const { groupId, targetQuery, addedByName } = body;
      if (!groupId || !targetQuery) {
        return NextResponse.json({ error: 'Guruh va talaba ma‘lumoti kiritilishi shart' }, { status: 400 });
      }
      const result = await addMemberToGroup(groupId, targetQuery, addedByName);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json(result);
    }

    // 4. Yangi guruh ochish
    const { name, description, category, avatarIcon, creatorId, creatorName } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Guruh nomi kiritilishi shart' }, { status: 400 });
    }

    const newGroup = await createStudyGroup({
      name,
      description: description || 'Talabalar uchun o‘quv guruhi',
      category: category || 'Umumiy',
      avatarIcon: avatarIcon || '🎓',
      creatorId,
      creatorName,
    });

    return NextResponse.json({ success: true, group: newGroup });
  } catch (error) {
    console.error('Error in study groups POST:', error);
    return NextResponse.json({ error: 'Amalni bajarishda xatolik yuz berdi' }, { status: 500 });
  }
}
