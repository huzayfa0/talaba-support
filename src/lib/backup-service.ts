import fs from 'fs/promises';
import path from 'path';

export interface BackupConfig {
  isAutoBackupEnabled: boolean;
  telegramBotToken?: string;
  telegramAdminChatId?: string;
  schedule: 'daily_midnight' | 'daily_custom' | 'every_12h' | 'every_6h' | 'weekly';
  customTime?: string;
  lastBackupAt?: string;
  lastBackupStatus?: 'success' | 'error';
  lastBackupMessage?: string;
}

export interface BackupDataPayload {
  version: string;
  exportedAt: string;
  system: string;
  stats: {
    usersCount: number;
    subjectsCount: number;
    lessonsCount: number;
    groupsCount: number;
    directChatsCount: number;
  };
  stores: {
    adminStore: any;
    coursesStore: any;
    messengerStore: any;
    directChatsStore: any;
    securityStore: any;
  };
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const BACKUP_CONFIG_FILE = path.join(DATA_DIR, 'backup-config.json');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

const DEFAULT_CONFIG: BackupConfig = {
  isAutoBackupEnabled: true,
  telegramBotToken: '8222935062:AAH7vuajffGpGH-I0VvNPebbF41qVeWEgZ0',
  telegramAdminChatId: '',
  schedule: 'daily_midnight',
  customTime: '00:00',
  lastBackupAt: undefined,
  lastBackupStatus: undefined,
};

async function readJsonSafe<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

export async function getBackupConfig(): Promise<BackupConfig> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  return readJsonSafe<BackupConfig>(BACKUP_CONFIG_FILE, DEFAULT_CONFIG);
}

export async function saveBackupConfig(config: Partial<BackupConfig>): Promise<BackupConfig> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const current = await getBackupConfig();
  const updated: BackupConfig = {
    ...current,
    ...config,
  };
  await fs.writeFile(BACKUP_CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export async function generateBackupData(): Promise<BackupDataPayload> {
  const adminStore = await readJsonSafe(path.join(DATA_DIR, 'admin-store.json'), { users: [] });
  const coursesStore = await readJsonSafe(path.join(DATA_DIR, 'courses-store.json'), { subjects: [], lessons: [] });
  const messengerStore = await readJsonSafe(path.join(DATA_DIR, 'messenger-store.json'), { groups: [], messages: {} });
  const directChatsStore = await readJsonSafe(path.join(DATA_DIR, 'direct-chats-store.json'), { messages: {} });
  const securityStore = await readJsonSafe(path.join(DATA_DIR, 'security-store.json'), { settings: {}, blockedDevices: [] });

  const usersCount = Array.isArray(adminStore.users) ? adminStore.users.length : 0;
  const subjectsCount = Array.isArray(coursesStore.subjects) ? coursesStore.subjects.length : 0;
  const lessonsCount = Array.isArray(coursesStore.lessons) ? coursesStore.lessons.length : 0;
  const groupsCount = Array.isArray(messengerStore.groups) ? messengerStore.groups.length : 0;
  
  let directChatsCount = 0;
  if (directChatsStore.messages && typeof directChatsStore.messages === 'object') {
    directChatsCount = Object.keys(directChatsStore.messages).length;
  }

  const payload: BackupDataPayload = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    system: 'TalabaAI Ta\'lim Platformasi',
    stats: {
      usersCount,
      subjectsCount,
      lessonsCount,
      groupsCount,
      directChatsCount,
    },
    stores: {
      adminStore,
      coursesStore,
      messengerStore,
      directChatsStore,
      securityStore,
    },
  };

  return payload;
}

export async function restoreBackupData(payload: any): Promise<{
  success: boolean;
  message: string;
  restoredStats?: any;
}> {
  if (!payload || !payload.stores) {
    throw new Error('Yaroqsiz zaxira fayli: "stores" maydoni topilmadi');
  }

  await fs.mkdir(BACKUPS_DIR, { recursive: true });

  const currentBackup = await generateBackupData();
  const safetyFileName = `pre_restore_${Date.now()}.json`;
  await fs.writeFile(
    path.join(BACKUPS_DIR, safetyFileName),
    JSON.stringify(currentBackup, null, 2),
    'utf-8'
  );

  const { stores } = payload;

  if (stores.adminStore) {
    await fs.writeFile(
      path.join(DATA_DIR, 'admin-store.json'),
      JSON.stringify(stores.adminStore, null, 2),
      'utf-8'
    );
  }

  if (stores.coursesStore) {
    await fs.writeFile(
      path.join(DATA_DIR, 'courses-store.json'),
      JSON.stringify(stores.coursesStore, null, 2),
      'utf-8'
    );
  }

  if (stores.messengerStore) {
    await fs.writeFile(
      path.join(DATA_DIR, 'messenger-store.json'),
      JSON.stringify(stores.messengerStore, null, 2),
      'utf-8'
    );
  }

  if (stores.directChatsStore) {
    await fs.writeFile(
      path.join(DATA_DIR, 'direct-chats-store.json'),
      JSON.stringify(stores.directChatsStore, null, 2),
      'utf-8'
    );
  }

  if (stores.securityStore) {
    await fs.writeFile(
      path.join(DATA_DIR, 'security-store.json'),
      JSON.stringify(stores.securityStore, null, 2),
      'utf-8'
    );
  }

  return {
    success: true,
    message: 'Barcha ma\'lumotlar zaxira faylidan muvaffaqiyatli qayta tiklandi!',
    restoredStats: payload.stats || {},
  };
}

export async function resetDatabaseToClean(): Promise<{
  success: boolean;
  message: string;
  backupFileName: string;
}> {
  await fs.mkdir(BACKUPS_DIR, { recursive: true });

  // 1. Tozalashdan oldin xavfsizlik uchun to'liq avtomatik backup olamiz
  const currentBackup = await generateBackupData();
  const safetyFileName = `backup_before_reset_${Date.now()}.json`;
  await fs.writeFile(
    path.join(BACKUPS_DIR, safetyFileName),
    JSON.stringify(currentBackup, null, 2),
    'utf-8'
  );

  // 2. Admin ma'lumotlarini saqlab qolgan holda foydalanuvchilarni tozalaymiz
  const adminStore = await readJsonSafe(path.join(DATA_DIR, 'admin-store.json'), {
    adminConfig: {
      username: 'admin',
      passwordHash: 'talabaai_admin_2026!',
      updatedAt: new Date().toISOString(),
    },
    users: [],
  });

  const cleanAdminStore = {
    adminConfig: adminStore.adminConfig || {
      username: 'admin',
      passwordHash: 'talabaai_admin_2026!',
      updatedAt: new Date().toISOString(),
    },
    users: [],
  };

  await fs.writeFile(
    path.join(DATA_DIR, 'admin-store.json'),
    JSON.stringify(cleanAdminStore, null, 2),
    'utf-8'
  );

  // 3. Kurslar va darsliklarni tozalash
  await fs.writeFile(
    path.join(DATA_DIR, 'courses-store.json'),
    JSON.stringify({ subjects: [], lessons: [] }, null, 2),
    'utf-8'
  );

  // 4. Guruhlar va messenjer xabarlarini tozalash
  await fs.writeFile(
    path.join(DATA_DIR, 'messenger-store.json'),
    JSON.stringify({ groups: [], messages: {} }, null, 2),
    'utf-8'
  );

  // 5. Shaxsiy yozishmalarni tozalash
  await fs.writeFile(
    path.join(DATA_DIR, 'direct-chats-store.json'),
    JSON.stringify({ messages: {} }, null, 2),
    'utf-8'
  );

  // 6. OTP kodlar bazasini tozalash
  await fs.writeFile(
    path.join(DATA_DIR, 'otp-store.json'),
    JSON.stringify({ pendingOtps: {}, chatPhoneMap: {}, phoneChatMap: {} }, null, 2),
    'utf-8'
  );

  return {
    success: true,
    message: 'Barcha test ma‘lumotlari tozalandi! Tizim noldan toza holatda boshlandi. Xavfsizlik zaxirasi saqlab qo‘yildi.',
    backupFileName: safetyFileName,
  };
}


export async function sendBackupToTelegram(
  targetChatId?: string,
  customToken?: string
): Promise<{ success: boolean; message: string }> {
  const config = await getBackupConfig();
  const token = customToken || config.telegramBotToken;
  const chatId = targetChatId || config.telegramAdminChatId;

  if (!token) {
    throw new Error('Telegram Bot Token kiritilmagan');
  }

  if (!chatId) {
    throw new Error('Admin Telegram Chat ID kiritilmagan. Iltimos, Chat ID ni kiriting.');
  }

  // Agar foydalanuvchi Bot Token kiritgan bo'lsa (ichida ':' belgisi bo'ladi)
  if (chatId.includes(':')) {
    throw new Error(
      'Xatolik: Siz Chat ID maydoniga Bot Token kiritdingiz! Chat ID faqat raqamlardan iborat bo‘ladi (masalan: 542198765). Bot tokenini yuqoridagi "Telegram Bot Token" maydoniga kiriting.'
    );
  }

  const backupData = await generateBackupData();
  const dateStr = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
  const fileName = `talaba_backup_${dateStr}.json`;
  const fileContent = JSON.stringify(backupData, null, 2);

  const caption =
    `📦 <b>TalabaAI Tizimi Zaxira Nusxasi (Backup)</b>\n\n` +
    `📅 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
    `👥 <b>Talabalar:</b> ${backupData.stats.usersCount} ta\n` +
    `📚 <b>Fanlar:</b> ${backupData.stats.subjectsCount} ta\n` +
    `🎓 <b>Video Darslar:</b> ${backupData.stats.lessonsCount} ta\n` +
    `👥 <b>Guruhlar:</b> ${backupData.stats.groupsCount} ta\n` +
    `💬 <b>Muloqotlar:</b> ${backupData.stats.directChatsCount} ta\n\n` +
    `💾 <i>Ushbu fayl butun platformangiz ma‘lumotlar bazasini o‘z ichiga oladi. Yangi serverga ko‘chganingizda ushbu fayl orqali 1 bosishda barchasini tiklashingiz mumkin.</i>`;

  const formData = new FormData();
  formData.append('chat_id', chatId);
  const blob = new Blob([fileContent], { type: 'application/json' });
  formData.append('document', blob, fileName);
  formData.append('caption', caption);
  formData.append('parse_mode', 'HTML');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    body: formData,
  });

  const resData = await res.json();

  if (!resData.ok) {
    let errorDetail = resData.description || 'Telegramga yuborishda xatolik';
    if (resData.description?.includes('chat not found')) {
      errorDetail = `Telegram API xatosi: Kiritilgan Chat ID (${chatId}) topilmadi! Iltimos, Telegramda o‘z botingizga avval biron marta /start deb yozing, yoki to‘g‘ri raqamli Chat ID kiriting (bilib olish uchun @userinfobot ga kiring).`;
    }
    await saveBackupConfig({
      lastBackupAt: new Date().toISOString(),
      lastBackupStatus: 'error',
      lastBackupMessage: errorDetail,
    });
    throw new Error(errorDetail);
  }

  await saveBackupConfig({
    lastBackupAt: new Date().toISOString(),
    lastBackupStatus: 'success',
    lastBackupMessage: 'Muvaffaqiyatli Telegramga yuborildi',
  });

  return {
    success: true,
    message: `Zaxira fayli (@${chatId}) Telegram chatiga muvaffaqiyatli yuborildi!`,
  };
}
