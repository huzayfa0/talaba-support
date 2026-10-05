import fs from 'fs/promises';
import path from 'path';
import { StudyGroup, ChatMessage, UserPlan } from '@/types';

export interface MessengerStoreData {
  groups: StudyGroup[];
  messages: ChatMessage[];
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'messenger-store.json');

const INITIAL_GROUPS: StudyGroup[] = [
  {
    id: 'group-it-304',
    name: '304-guruh: Dasturiy Injiniring',
    description: 'Kurs ishlari, dasturlash masalalari va umumiy amaliy darslar',
    category: 'IT & Dasturlash',
    membersCount: 28,
    avatarIcon: '💻',
    isLive: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'group-cyber-sec',
    name: 'Kiberxavfsizlik va Tarmoqlar',
    description: 'Axborot xavfsizligi, shifrlash va xakerlikdan himoyalanish laboratoriyasi',
    category: 'Kiberxavfsizlik',
    membersCount: 19,
    avatarIcon: '🛡️',
    isLive: true,
    currentSpeaker: {
      name: 'Yo‘ldoshev Jasur',
      plan: 'ultra',
      hasScreenShare: true,
      hasCamera: true,
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'group-econ-moliya',
    name: 'Iqtisodiyot va Moliya Klubi',
    description: 'Referatlar, diplom oldi amaliyoti va hisob-kitoblar',
    category: 'Iqtisodiyot',
    membersCount: 34,
    avatarIcon: '📊',
    isLive: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'group-ielts-room',
    name: 'IELTS & Ingliz tili Study Room',
    description: 'Prezintatsiyalarni ingliz tilida tayyorlash va speaking mashg‘ulotlari',
    category: 'Xorijiy tillar',
    membersCount: 45,
    avatarIcon: '🇬🇧',
    isLive: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-01',
    groupId: 'group-it-304',
    senderId: 'user-jasur-03',
    senderName: 'Yo‘ldoshev Jasur',
    senderRole: 'Guruh sardori',
    senderPlan: 'ultra',
    text: 'Salom hammaga! Bugungi amaliy mashg‘ulot bo‘yicha slaydlar tayyormi? Kimga yordam kerak bo‘lsa ekranimni share qilib ko‘rsatib berishim mumkin.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'msg-02',
    groupId: 'group-it-304',
    senderId: 'user-sardor-02',
    senderName: 'Abdullayev Sardor',
    senderRole: 'Talaba',
    senderPlan: 'premium',
    text: 'Men TalabaAI da 15 slaydlik Gamma taqdimot yaratdim, juda ajoyib chiqdi! Hozir boblarini mustaqil ishga ham joylayapman.',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'msg-03',
    groupId: 'group-it-304',
    senderId: 'user-jasur-03',
    senderName: 'Yo‘ldoshev Jasur',
    senderRole: 'Guruh sardori',
    senderPlan: 'ultra',
    text: 'Ajoyib! Jonli darsxona tugmasini bosib ekranni ko‘rsatib beraman, hamma kirib ko‘rishi mumkin.',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'msg-04',
    groupId: 'group-cyber-sec',
    senderId: 'user-jasur-03',
    senderName: 'Yo‘ldoshev Jasur',
    senderRole: 'Moderator',
    senderPlan: 'ultra',
    text: 'Efir boshlandi! Hozir SSL shifrlash va sertifikatlar mavzusini o‘z ekranimda tushuntiryapman.',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

const INITIAL_STORE: MessengerStoreData = {
  groups: INITIAL_GROUPS,
  messages: INITIAL_MESSAGES,
};

const ADMIN_FILE = path.join(DATA_DIR, 'admin-store.json');

async function loadAllUsers(): Promise<any[]> {
  try {
    const content = await fs.readFile(ADMIN_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed.users || [];
  } catch {
    return [];
  }
}

async function ensureStore(): Promise<MessengerStoreData> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const store = JSON.parse(content) as MessengerStoreData;
    let modified = false;
    for (const g of store.groups) {
      if (!Array.isArray(g.memberIds)) {
        g.memberIds = [];
        modified = true;
      }
    }
    if (modified) {
      await saveStore(store);
    }
    return store;
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_STORE, null, 2), 'utf-8');
    return INITIAL_STORE;
  }
}

async function saveStore(store: MessengerStoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/**
 * O'quv guruhlarini olish
 * @param userId - foydalanuvchi identifikatori
 * @param mode - 'my' (faqat o'zi a'zo bo'lgan guruhlar) yoki 'all' (barcha mavjud guruhlar)
 */
export async function getStudyGroups(userId?: string, mode: 'my' | 'all' = 'my'): Promise<StudyGroup[]> {
  const store = await ensureStore();
  if (mode === 'all') {
    return store.groups;
  }
  if (!userId) {
    return [];
  }
  return store.groups.filter((g) => {
    return (
      (Array.isArray(g.memberIds) && g.memberIds.includes(userId)) ||
      g.creatorId === userId
    );
  });
}

/**
 * Guruhga a'zo bo'lib qo'shilish
 */
export async function joinStudyGroup(groupId: string, userId: string, userName?: string): Promise<StudyGroup | null> {
  if (!groupId || !userId) return null;
  const store = await ensureStore();
  const group = store.groups.find((g) => g.id === groupId);
  if (!group) return null;

  if (!Array.isArray(group.memberIds)) {
    group.memberIds = [];
  }

  if (!group.memberIds.includes(userId)) {
    group.memberIds.push(userId);
    group.membersCount = group.memberIds.length;

    // Guruhga xush kelibsiz bildirishnomasi
    if (userName) {
      store.messages.push({
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        groupId: group.id,
        senderId: 'system',
        senderName: 'Tizim',
        senderRole: 'Tizim',
        senderPlan: 'free',
        text: `👋 ${userName} guruhga a‘zo bo‘lib qo‘shildi.`,
        createdAt: new Date().toISOString(),
      });
    }

    await saveStore(store);
  }

  return group;
}

/**
 * Guruhdan chiqish
 */
export async function leaveStudyGroup(groupId: string, userId: string): Promise<StudyGroup | null> {
  if (!groupId || !userId) return null;
  const store = await ensureStore();
  const group = store.groups.find((g) => g.id === groupId);
  if (!group) return null;

  if (Array.isArray(group.memberIds)) {
    group.memberIds = group.memberIds.filter((id) => id !== userId);
    group.membersCount = Math.max(0, group.memberIds.length);
    await saveStore(store);
  }

  return group;
}

/**
 * Boshqa talabani guruhga a'zo qilib qo'shish (Telefon raqam yoki ID orqali)
 */
export async function addMemberToGroup(
  groupId: string,
  targetQuery: string,
  addedByName?: string
): Promise<{ success: boolean; message: string; group?: StudyGroup; addedUser?: any }> {
  if (!groupId || !targetQuery.trim()) {
    return { success: false, message: 'Guruh yoki foydalanuvchi kiritilmadi' };
  }

  const store = await ensureStore();
  const group = store.groups.find((g) => g.id === groupId);
  if (!group) {
    return { success: false, message: 'Guruh topilmadi' };
  }

  const allUsers = await loadAllUsers();
  const cleanQ = targetQuery.trim().toLowerCase().replace(/[\s\-\(\)]/g, '');

  const matchedUser = allUsers.find((u) => {
    if (u.id === targetQuery.trim()) return true;
    if (u.phone && u.phone.replace(/[\s\-\(\)]/g, '').includes(cleanQ)) return true;
    if (u.email && u.email.toLowerCase() === targetQuery.trim().toLowerCase()) return true;
    if (u.telegramUsername && u.telegramUsername.toLowerCase().replace(/^@/, '') === cleanQ.replace(/^@/, '')) return true;
    if (targetQuery.trim().length >= 3 && u.name?.toLowerCase().includes(targetQuery.trim().toLowerCase())) return true;
    return false;
  });

  if (!matchedUser) {
    return { success: false, message: 'Bunday talaba topilmadi. Telefon raqamini to‘g‘ri kiriting (+998...)' };
  }

  if (!Array.isArray(group.memberIds)) {
    group.memberIds = [];
  }

  if (group.memberIds.includes(matchedUser.id)) {
    return { success: false, message: `${matchedUser.name} allaqachon ushbu guruh a‘zosi!` };
  }

  group.memberIds.push(matchedUser.id);
  group.membersCount = group.memberIds.length;

  // Guruhga xabar qoldiramiz
  store.messages.push({
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    groupId: group.id,
    senderId: 'system',
    senderName: 'Tizim bildirishnomasi',
    senderRole: 'Tizim',
    senderPlan: 'free',
    text: `🔔 ${matchedUser.name} ${addedByName ? `(${addedByName} tomonidan)` : ''} guruhga qo‘shildi.`,
    createdAt: new Date().toISOString(),
  });

  await saveStore(store);
  return {
    success: true,
    message: `${matchedUser.name} muvaffaqiyatli guruhga qo‘shildi!`,
    group,
    addedUser: {
      id: matchedUser.id,
      name: matchedUser.name,
      phone: matchedUser.phone,
    },
  };
}

/**
 * Yangi guruh ochish
 */
export async function createStudyGroup(data: {
  name: string;
  description: string;
  category: string;
  avatarIcon?: string;
  creatorId?: string;
  creatorName?: string;
}): Promise<StudyGroup> {
  const store = await ensureStore();
  const creatorId = data.creatorId;
  const newGroup: StudyGroup = {
    id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    description: data.description.trim(),
    category: data.category.trim() || 'Umumiy',
    membersCount: 1,
    avatarIcon: data.avatarIcon || '📚',
    isLive: false,
    creatorId: creatorId,
    creatorName: data.creatorName,
    memberIds: creatorId ? [creatorId] : [],
    createdAt: new Date().toISOString(),
  };

  store.groups.unshift(newGroup);
  await saveStore(store);
  return newGroup;
}

/**
 * Guruhdagi xabarlarni olish
 */
export async function getGroupMessages(groupId: string): Promise<ChatMessage[]> {
  const store = await ensureStore();
  return store.messages
    .filter((m) => m.groupId === groupId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Yangi xabar yuborish
 */
export async function sendGroupMessage(data: {
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderPlan: UserPlan;
  text: string;
  attachment?: {
    type: 'code' | 'file' | 'link';
    title: string;
    url?: string;
  };
}): Promise<ChatMessage> {
  const store = await ensureStore();
  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    groupId: data.groupId,
    senderId: data.senderId,
    senderName: data.senderName,
    senderRole: data.senderRole || 'Talaba',
    senderPlan: data.senderPlan,
    text: data.text.trim(),
    attachment: data.attachment,
    createdAt: new Date().toISOString(),
  };

  store.messages.push(newMessage);
  await saveStore(store);
  return newMessage;
}

/**
 * Jonli efir (Live Session) holatini yangilash
 */
export async function updateGroupLiveState(
  groupId: string,
  isLive: boolean,
  speaker?: {
    name: string;
    plan: UserPlan;
    hasScreenShare: boolean;
    hasCamera: boolean;
  }
): Promise<StudyGroup | null> {
  const store = await ensureStore();
  const group = store.groups.find((g) => g.id === groupId);
  if (!group) return null;

  group.isLive = isLive;
  group.currentSpeaker = isLive ? speaker : undefined;
  await saveStore(store);
  return group;
}
