import fs from 'fs/promises';
import path from 'path';
import { AdminUserRecord, AdminStats, UserPlan, UserProfile, AdminSessionRecord } from '@/types';

export interface AdminStoreData {
  adminConfig: {
    username: string;
    passwordHash: string; // Oddiy yoki shifrlangan
    updatedAt: string;
  };
  adminSessions?: AdminSessionRecord[];
  users: AdminUserRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'admin-store.json');

const INITIAL_STORE: AdminStoreData = {
  adminConfig: {
    username: 'admin',
    passwordHash: 'talabaai_admin_2026!',
    updatedAt: new Date().toISOString(),
  },
  adminSessions: [],
  users: [
    {
      id: 'user-samandar-01',
      name: 'Samandar Ismoilov',
      email: 'talaba@edu.uz',
      university: 'Toshkent Axborot texnologiyalari universiteti',
      faculty: 'Dasturiy injiniring',
      group: '304-guruh',
      plan: 'free',
      tokens: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBlocked: false,
      customNotes: 'Dasturiy injiniring 3-kurs talabasi',
    },
    {
      id: 'user-sardor-02',
      name: 'Abdullayev Sardor',
      email: 'sardor@mail.uz',
      university: "O'zbekiston Milliy Universiteti",
      faculty: 'Axborot texnologiyalari',
      group: '210-guruh',
      plan: 'premium',
      tokens: 100,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      isBlocked: false,
      customNotes: 'Iqtidorli talaba, referat va slaydlar uchun',
    },
    {
      id: 'user-jasur-03',
      name: 'Yo‘ldoshev Jasur Shavkatovich',
      email: 'jasur@nuu.uz',
      university: 'Toshkent Davlat Iqtisodiyot Universiteti',
      faculty: 'Moliya va bank ishi',
      group: '412-guruh',
      plan: 'ultra',
      tokens: 999999,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
      isBlocked: false,
      customNotes: 'Diplom va kurs ishlari uchun cheksiz VIP',
    },
  ],
};

async function ensureStore(): Promise<AdminStoreData> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content) as AdminStoreData;
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_STORE, null, 2), 'utf-8');
    return INITIAL_STORE;
  }
}

async function saveStore(store: AdminStoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/**
 * Admin login va parolini tekshirish
 */
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const store = await ensureStore();
  return (
    store.adminConfig.username.trim() === username.trim() &&
    store.adminConfig.passwordHash.trim() === password.trim()
  );
}

/**
 * Admin joriy parolini tekshirish
 */
export async function verifyCurrentAdminPassword(password: string): Promise<boolean> {
  const store = await ensureStore();
  return store.adminConfig.passwordHash.trim() === password.trim();
}

/**
 * Admin login va parolini yangilash
 */
export async function updateAdminCredentials(newUsername: string, newPassword: string): Promise<boolean> {
  if (!newUsername.trim() || !newPassword.trim()) return false;
  const store = await ensureStore();
  store.adminConfig.username = newUsername.trim();
  store.adminConfig.passwordHash = newPassword.trim();
  store.adminConfig.updatedAt = new Date().toISOString();
  await saveStore(store);
  return true;
}

/**
 * Barcha foydalanuvchilar va statistikani olish
 */
export async function getAdminUsersAndStats(): Promise<{
  users: AdminUserRecord[];
  stats: AdminStats;
}> {
  const store = await ensureStore();
  const users = store.users;

  const freeUsers = users.filter((u) => u.plan === 'free').length;
  const premiumUsers = users.filter((u) => u.plan === 'premium').length;
  const ultraUsers = users.filter((u) => u.plan === 'ultra').length;
  const totalTokensIssued = users.reduce((acc, u) => acc + (u.tokens > 99999 ? 1000 : u.tokens), 0);

  return {
    users,
    stats: {
      totalUsers: users.length,
      freeUsers,
      premiumUsers,
      ultraUsers,
      totalTokensIssued,
    },
  };
}

/**
 * Foydalanuvchiga qo'lda tarif berish yoki yangilash
 */
export async function updateUserPlan(
  userId: string,
  newPlan: UserPlan,
  tokens?: number,
  isBlocked?: boolean,
  notes?: string
): Promise<AdminUserRecord | null> {
  const store = await ensureStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return null;

  user.plan = newPlan;
  user.updatedAt = new Date().toISOString();

  if (typeof tokens === 'number') {
    user.tokens = tokens;
  } else {
    // Standart qoida: agar ultra berilsa cheksiz (999999), premium berilsa 100, free bo'lsa 10
    if (newPlan === 'ultra') user.tokens = 999999;
    else if (newPlan === 'premium' && user.tokens < 100) user.tokens = 100;
  }

  if (typeof isBlocked === 'boolean') {
    user.isBlocked = isBlocked;
  }

  if (typeof notes === 'string') {
    user.customNotes = notes;
  }

  await saveStore(store);
  return user;
}

/**
 * Yangi foydalanuvchi qo'shish
 */
export async function createAdminUser(data: {
  name: string;
  email: string;
  university?: string;
  faculty?: string;
  group?: string;
  plan?: UserPlan;
  tokens?: number;
  customNotes?: string;
}): Promise<AdminUserRecord> {
  const store = await ensureStore();
  const plan = data.plan || 'free';
  const defaultTokens = plan === 'ultra' ? 999999 : plan === 'premium' ? 100 : 10;

  const newUser: AdminUserRecord = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: data.name.trim() || 'Hurmatli Talaba',
    email: data.email.trim().toLowerCase(),
    university: data.university || "O'zbekiston Milliy Universiteti",
    faculty: data.faculty || 'Axborot texnologiyalari',
    group: data.group || '1-guruh',
    plan,
    tokens: typeof data.tokens === 'number' ? data.tokens : defaultTokens,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBlocked: false,
    customNotes: data.customNotes || '',
  };

  store.users.unshift(newUser);
  await saveStore(store);
  return newUser;
}

/**
 * Foydalanuvchini o'chirish
 */
export async function deleteAdminUser(userId: string): Promise<boolean> {
  const store = await ensureStore();
  const initialLength = store.users.length;
  store.users = store.users.filter((u) => u.id !== userId);
  if (store.users.length !== initialLength) {
    await saveStore(store);
    return true;
  }
  return false;
}

/**
 * Talaba saytni ochganda uning profilini sinxronlash
 * Agar admin unga Premium yoki Ultra bergan bo'lsa, mijoz darhol yangilanadi!
 */
export async function syncStudentProfile(profile: UserProfile): Promise<UserProfile> {
  const store = await ensureStore();

  // Agar foydalanuvchi tizimdan chiqqan bo'lsa (isLoggedIn === false), bepul mehmon rejimida qoladi
  if (profile.isLoggedIn === false) {
    return {
      ...profile,
      name: profile.name || 'Talaba',
      email: '',
      plan: 'free',
      tokens: 10,
      isLoggedIn: false,
    };
  }

  const searchEmail = (profile.email || '').trim().toLowerCase();
  const searchName = (profile.name || '').trim().toLowerCase();

  let existingUser = store.users.find(
    (u) =>
      (profile.id && u.id === profile.id) ||
      (searchEmail && u.email.toLowerCase() === searchEmail) ||
      (searchName && searchName !== 'talaba' && (u.name.toLowerCase() === searchName || u.name.toLowerCase().includes(searchName) || searchName.includes(u.name.toLowerCase())))
  );

  // Agar aniq topilmagan bo'lsa va nomi 'Talaba' yoki bo'sh bo'lsa,
  // admin bazasidagi Ultra VIP yoki birinchi faol foydalanuvchini ulaymiz!
  if (!existingUser && (!searchEmail || searchName === 'talaba')) {
    existingUser = store.users.find((u) => u.plan === 'ultra' && !u.isBlocked) || store.users[0];
  }

  if (existingUser) {
    // Agar foydalanuvchi bloklangan bo'lsa
    if (existingUser.isBlocked) {
      return {
        ...profile,
        id: existingUser.id,
        plan: 'free',
        tokens: 0,
        isBlocked: true,
      };
    }

    return {
      ...profile,
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      university: existingUser.university || profile.university,
      faculty: existingUser.faculty || profile.faculty,
      group: existingUser.group || profile.group,
      plan: existingUser.plan,
      tokens: existingUser.tokens,
      isBlocked: false,
    };
  }

  // Agar mavjud bo'lmasa, uni avtomatik bazaga Free sifatida kiritib qo'yamiz
  const newUser: AdminUserRecord = {
    id: `user-${Date.now()}`,
    name: profile.name || 'Talaba',
    email: searchEmail || `talaba_${Date.now()}@edu.uz`,
    university: profile.university || "O'zbekiston Milliy Universiteti",
    faculty: profile.faculty || 'Axborot texnologiyalari',
    group: profile.group || '304-guruh',
    plan: profile.plan || 'free',
    tokens: profile.tokens || 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBlocked: false,
  };

  store.users.unshift(newUser);
  await saveStore(store);

  return {
    ...profile,
    id: newUser.id,
    plan: newUser.plan,
    tokens: newUser.tokens,
    isBlocked: false,
  };
}

/**
 * Telefon raqami bo'yicha foydalanuvchini topish
 */
export async function findUserByPhone(phone: string): Promise<AdminUserRecord | null> {
  const store = await ensureStore();
  const clean = phone.replace(/[^0-9]/g, '');
  return (
    store.users.find((u) => {
      if (!u.phone) return false;
      return u.phone.replace(/[^0-9]/g, '') === clean;
    }) || null
  );
}

/**
 * Telefon raqam orqali ro'yxatdan o'tish (Telegram tasdiqidan so'ng)
 */
export async function registerStudentWithPhone(data: {
  name: string;
  phone: string;
  password: string;
  telegramUsername?: string;
  email?: string;
}): Promise<AdminUserRecord> {
  const store = await ensureStore();
  const cleanPhone = data.phone.trim();
  const cleanTelegram = (data.telegramUsername || '').replace(/^@/, '').trim();

  // Agar mavjud bo'lsa yangilaymiz, bo'lmasa yaratamiz
  const existingIndex = store.users.findIndex((u) => {
    if (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '')) return true;
    return false;
  });

  if (existingIndex >= 0) {
    const u = store.users[existingIndex];
    u.name = data.name.trim() || u.name;
    u.passwordHash = data.password.trim();
    if (cleanTelegram) u.telegramUsername = cleanTelegram;
    if (data.email) u.email = data.email.trim();
    u.updatedAt = new Date().toISOString();
    u.failedAttempts = 0;
    await saveStore(store);
    return u;
  }

  const newUser: AdminUserRecord = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: data.name.trim() || 'Hurmatli Talaba',
    email: data.email?.trim() || `${cleanPhone.replace(/[^0-9]/g, '')}@talaba.uz`,
    phone: cleanPhone,
    telegramUsername: cleanTelegram,
    passwordHash: data.password.trim(),
    university: "O'zbekiston Milliy Universiteti",
    faculty: 'Axborot texnologiyalari',
    group: '304-guruh',
    plan: 'free',
    tokens: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBlocked: false,
    failedAttempts: 0,
    customNotes: 'Telegram bot orqali ro‘yxatdan o‘tgan talaba',
  };

  store.users.unshift(newUser);
  await saveStore(store);
  return newUser;
}

/**
 * Telefon raqam va parol bilan kirishni tekshirish
 */
export async function verifyStudentLogin(
  phone: string,
  password: string
): Promise<{ success: boolean; user?: AdminUserRecord; message: string; notFound?: boolean }> {
  const store = await ensureStore();
  const clean = phone.replace(/[^0-9]/g, '');

  const user = store.users.find((u) => {
    if (!u.phone) return false;
    return u.phone.replace(/[^0-9]/g, '') === clean;
  });

  if (!user) {
    return {
      success: false,
      notFound: true,
      message: 'Ushbu telefon raqam bilan ro‘yxatdan o‘tilmagan. Iltimos, avval ro‘yxatdan o‘ting.',
    };
  }

  if (user.isBlocked) {
    return {
      success: false,
      message: 'Ushbu hisob admin tomonidan bloklangan!',
    };
  }

  // Agar foydalanuvchida hali parol o'rnatilmagan bo'lsa yoki parol mos kelsa
  if (user.passwordHash && user.passwordHash.trim() !== password.trim()) {
    user.failedAttempts = (user.failedAttempts || 0) + 1;
    user.lastFailedAt = new Date().toISOString();
    await saveStore(store);
    return {
      success: false,
      message: 'Telefon raqam yoki parol noto‘g‘ri kiritildi!',
    };
  }

  // Muvaffaqiyatli kirish: xatoliklar sonini 0 ga tushiramiz
  user.failedAttempts = 0;
  await saveStore(store);

  return {
    success: true,
    user,
    message: 'Muvaffaqiyatli tizimga kirdingiz!',
  };
}

/**
 * Admin sessiyalarini olish
 */
export async function getAdminSessions(): Promise<AdminSessionRecord[]> {
  const store = await ensureStore();
  return store.adminSessions || [];
}

/**
 * Yangi admin sessiyasini yozish
 */
export async function addAdminSession(session: AdminSessionRecord): Promise<void> {
  const store = await ensureStore();
  if (!store.adminSessions) store.adminSessions = [];
  store.adminSessions.unshift(session);
  if (store.adminSessions.length > 50) {
    store.adminSessions = store.adminSessions.slice(0, 50);
  }
  await saveStore(store);
}

/**
 * Admin sessiyasini bekor qilish
 */
export async function revokeAdminSession(sessionId: string): Promise<boolean> {
  const store = await ensureStore();
  if (!store.adminSessions) return false;
  const sess = store.adminSessions.find((s) => s.id === sessionId);
  if (sess) {
    sess.isActive = false;
    await saveStore(store);
    return true;
  }
  return false;
}

/**
 * Foydalanuvchi parolini yangilash (Admin tomonidan)
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<AdminUserRecord | null> {
  const store = await ensureStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return null;

  user.passwordHash = newPassword.trim();
  user.updatedAt = new Date().toISOString();
  await saveStore(store);
  return user;
}

