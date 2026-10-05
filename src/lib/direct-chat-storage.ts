import fs from 'fs/promises';
import path from 'path';
import { DirectMessage, SavedContactEntry, AdminUserRecord, UserPlan } from '@/types';
import { cleanPhoneNumber } from './otp-storage';

export interface DirectChatsStoreData {
  savedContacts: {
    ownerId: string;
    targetUserId: string;
    addedAt: string;
  }[];
  messages: DirectMessage[];
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CHATS_FILE = path.join(DATA_DIR, 'direct-chats-store.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin-store.json');

const INITIAL_STORE: DirectChatsStoreData = {
  savedContacts: [],
  messages: [],
};

async function loadChatsStore(): Promise<DirectChatsStoreData> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(CHATS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      savedContacts: parsed.savedContacts || [],
      messages: parsed.messages || [],
    };
  } catch {
    return { ...INITIAL_STORE };
  }
}

async function saveChatsStore(store: DirectChatsStoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CHATS_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

async function loadAllUsers(): Promise<AdminUserRecord[]> {
  try {
    const content = await fs.readFile(ADMIN_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed.users || [];
  } catch {
    return [];
  }
}

/**
 * Talabani telefon raqami yoki akkount ID bo'yicha qidirish
 */
export async function searchStudentByAccountOrPhone(query: string): Promise<Omit<AdminUserRecord, 'passwordHash'>[]> {
  const rawQuery = (query || '').trim();
  if (!rawQuery) return [];

  const cleanDigits = cleanPhoneNumber(rawQuery);
  const lowerQuery = rawQuery.toLowerCase();
  const allUsers = await loadAllUsers();

  const matched = allUsers.filter((u) => {
    // 1. Telefon raqami bo'yicha
    if (cleanDigits.length >= 5 && u.phone) {
      const uClean = cleanPhoneNumber(u.phone);
      if (uClean === cleanDigits || uClean.includes(cleanDigits) || cleanDigits.includes(uClean)) {
        return true;
      }
    }

    // 2. ID bo'yicha
    if (u.id.toLowerCase() === lowerQuery || u.id.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // 3. Email bo'yicha
    if (u.email && u.email.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // 4. Telegram username bo'yicha
    if (u.telegramUsername) {
      const cleanTg = u.telegramUsername.replace(/^@/, '').toLowerCase();
      const cleanInputTg = lowerQuery.replace(/^@/, '');
      if (cleanTg === cleanInputTg || cleanTg.includes(cleanInputTg)) {
        return true;
      }
    }

    // 5. Ism bo'yicha (kamida 3 ta harf bo'lsa)
    if (lowerQuery.length >= 3 && u.name.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    return false;
  });

  // Parol xeshlarini olib tashlaymiz
  return matched.map(({ passwordHash: _ph, ...safeUser }) => safeUser);
}

/**
 * Ikki foydalanuvchi o'rtasidagi barcha shaxsiy xabarlarni olish
 */
export async function getDirectMessages(userAId: string, userBId: string): Promise<DirectMessage[]> {
  if (!userAId || !userBId) return [];

  const store = await loadChatsStore();
  let modified = false;

  const relevant = store.messages.filter((m) => {
    return (
      (m.senderId === userAId && m.receiverId === userBId) ||
      (m.senderId === userBId && m.receiverId === userAId)
    );
  });

  // userB dan kelgan xabarlarni o'qilgan (read: true) deb belgilaymiz
  for (const m of relevant) {
    if (m.senderId === userBId && m.receiverId === userAId && !m.read) {
      m.read = true;
      modified = true;
    }
  }

  if (modified) {
    await saveChatsStore(store);
  }

  return relevant.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Yangi shaxsiy xabar yuborish
 */
export async function sendDirectMessage(data: {
  senderId: string;
  senderName: string;
  senderPhone?: string;
  senderPlan?: UserPlan;
  receiverId: string;
  receiverName?: string;
  receiverPhone?: string;
  text: string;
}): Promise<DirectMessage> {
  const store = await loadChatsStore();

  const newMsg: DirectMessage = {
    id: `dm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    senderId: data.senderId,
    senderName: data.senderName,
    senderPhone: data.senderPhone,
    senderPlan: data.senderPlan || 'free',
    receiverId: data.receiverId,
    receiverName: data.receiverName,
    receiverPhone: data.receiverPhone,
    text: data.text.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  store.messages.push(newMsg);

  // Aloqa bog'langanda ikkala foydalanuvchining kontaktlariga avtomatik kiritamiz
  const hasContactA = store.savedContacts.some(
    (c) => c.ownerId === data.senderId && c.targetUserId === data.receiverId
  );
  if (!hasContactA) {
    store.savedContacts.push({
      ownerId: data.senderId,
      targetUserId: data.receiverId,
      addedAt: new Date().toISOString(),
    });
  }

  const hasContactB = store.savedContacts.some(
    (c) => c.ownerId === data.receiverId && c.targetUserId === data.senderId
  );
  if (!hasContactB) {
    store.savedContacts.push({
      ownerId: data.receiverId,
      targetUserId: data.senderId,
      addedAt: new Date().toISOString(),
    });
  }

  await saveChatsStore(store);
  return newMsg;
}

/**
 * Foydalanuvchining kontaktlari va suhbatdoshlari ro'yxatini olish
 */
export async function getSavedContactsList(userId: string): Promise<SavedContactEntry[]> {
  if (!userId) return [];

  const [store, allUsers] = await Promise.all([loadChatsStore(), loadAllUsers()]);
  const userMap = new Map<string, AdminUserRecord>();
  allUsers.forEach((u) => userMap.set(u.id, u));

  // 1. Saqlangan kontaktlar
  const targetUserIds = new Set<string>();
  store.savedContacts
    .filter((c) => c.ownerId === userId)
    .forEach((c) => targetUserIds.add(c.targetUserId));

  // 2. Yozishmalar tarixi bo'yicha hamkorlar
  store.messages.forEach((m) => {
    if (m.senderId === userId) targetUserIds.add(m.receiverId);
    if (m.receiverId === userId) targetUserIds.add(m.senderId);
  });

  const result: SavedContactEntry[] = [];

  for (const tId of Array.from(targetUserIds)) {
    const isSelf = tId === userId;
    const u = userMap.get(tId);

    // Bu inson bilan oxirgi xabar va o'qilmagan xabarlar soni
    const conversation = store.messages
      .filter((m) => {
        if (isSelf) {
          return m.senderId === userId && m.receiverId === userId;
        }
        return (
          (m.senderId === userId && m.receiverId === tId) ||
          (m.senderId === tId && m.receiverId === userId)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const lastMsg = conversation[0];
    const unreadCount = conversation.filter((m) => m.senderId === tId && m.receiverId === userId && !m.read).length;

    const targetName = u?.name || lastMsg?.senderName || lastMsg?.receiverName || 'Talaba';

    result.push({
      ownerId: userId,
      targetUserId: tId,
      targetName,
      targetPhone: u?.phone || (lastMsg?.senderId === tId ? lastMsg.senderPhone : lastMsg?.receiverPhone),
      targetEmail: u?.email,
      targetTelegram: u?.telegramUsername,
      targetUniversity: u?.university || "O'zbekiston Milliy Universiteti",
      targetFaculty: u?.faculty || 'Axborot texnologiyalari',
      targetGroup: u?.group || 'Talaba',
      targetPlan: u?.plan || 'free',
      addedAt: lastMsg?.createdAt || new Date().toISOString(),
      lastMessage: lastMsg?.text || 'Yangi suhbat',
      lastMessageTime: lastMsg?.createdAt,
      unreadCount: isSelf ? 0 : unreadCount,
    });
  }

  // Eng so'nggi xabarlar tepada turadi
  return result.sort((a, b) => {
    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
    return timeB - timeA;
  });
}

/**
 * Kontaktlarga saqlash
 */
export async function saveContactForUser(ownerId: string, targetUserId: string): Promise<boolean> {
  if (!ownerId || !targetUserId) return false;

  const store = await loadChatsStore();
  const exists = store.savedContacts.some(
    (c) => c.ownerId === ownerId && c.targetUserId === targetUserId
  );

  if (!exists) {
    store.savedContacts.push({
      ownerId,
      targetUserId,
      addedAt: new Date().toISOString(),
    });
    await saveChatsStore(store);
  }

  return true;
}

/**
 * Kontaktni va u bilan bo'lgan yozishmalarni butunlay o'chirish
 */
export async function deleteContactAndMessages(ownerId: string, targetUserId: string): Promise<boolean> {
  if (!ownerId || !targetUserId) return false;

  const store = await loadChatsStore();

  // 1. Saqlangan kontaktlardan o'chirish
  store.savedContacts = store.savedContacts.filter(
    (c) => !(c.ownerId === ownerId && c.targetUserId === targetUserId)
  );

  // 2. Yozishmalarni o'chirish
  if (ownerId === targetUserId) {
    store.messages = store.messages.filter(
      (m) => !(m.senderId === ownerId && m.receiverId === ownerId)
    );
  } else {
    store.messages = store.messages.filter(
      (m) =>
        !(
          (m.senderId === ownerId && m.receiverId === targetUserId) ||
          (m.senderId === targetUserId && m.receiverId === ownerId)
        )
    );
  }

  await saveChatsStore(store);
  return true;
}
