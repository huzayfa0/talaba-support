import fs from 'fs/promises';
import path from 'path';
import { BlockedDeviceRecord, SecuritySettings } from '@/types';

interface SecurityStoreData {
  settings: SecuritySettings;
  blockedDevices: BlockedDeviceRecord[];
  failedAttemptRecords: Record<
    string,
    {
      deviceId: string;
      ip?: string;
      phone?: string;
      count: number;
      lastAttempt: string;
    }
  >;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE = path.join(DATA_DIR, 'security-store.json');

const INITIAL_SECURITY_STORE: SecurityStoreData = {
  settings: {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME || 'TalabaAIBot',
    maxFailedAttempts: 20,
  },
  blockedDevices: [],
  failedAttemptRecords: {},
};

async function ensureStore(): Promise<SecurityStoreData> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content) as SecurityStoreData;
    return {
      ...INITIAL_SECURITY_STORE,
      ...parsed,
      settings: {
        ...INITIAL_SECURITY_STORE.settings,
        ...(parsed.settings || {}),
      },
    };
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_SECURITY_STORE, null, 2), 'utf-8');
    return INITIAL_SECURITY_STORE;
  }
}

async function saveStore(store: SecurityStoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/**
 * Qurilma yoki IP bloklanganligini tekshirish
 */
export async function isDeviceBlocked(deviceId: string, ip?: string): Promise<{ blocked: boolean; record?: BlockedDeviceRecord }> {
  const store = await ensureStore();

  const record = store.blockedDevices.find((b) => {
    if (deviceId && b.deviceId === deviceId) return true;
    if (ip && b.ip && b.ip !== '::1' && b.ip !== '127.0.0.1' && b.ip === ip) return true;
    return false;
  });

  return {
    blocked: !!record,
    record,
  };
}

/**
 * Noto'g'ri urinishni qayd etish
 * 20 taga yetganda avtomatik bloklaydi
 */
export async function recordFailedAttempt(
  deviceId: string,
  ip?: string,
  phone?: string
): Promise<{ attempts: number; maxAttempts: number; isBlockedNow: boolean }> {
  const store = await ensureStore();
  const max = store.settings.maxFailedAttempts || 20;

  const key = deviceId || ip || phone || 'unknown-device';
  const existing = store.failedAttemptRecords[key] || {
    deviceId,
    ip,
    phone,
    count: 0,
    lastAttempt: new Date().toISOString(),
  };

  existing.count += 1;
  existing.lastAttempt = new Date().toISOString();
  if (phone) existing.phone = phone;
  if (ip) existing.ip = ip;
  store.failedAttemptRecords[key] = existing;

  let isBlockedNow = false;

  // Agar 20 marta xato terilsa -> AVTO BLOK
  if (existing.count >= max) {
    isBlockedNow = true;
    // Bloklangan qurilmalar ro'yxatiga kiritish (agar mavjud bo'lmasa)
    const alreadyBlocked = store.blockedDevices.find((b) => b.deviceId === deviceId);
    if (!alreadyBlocked) {
      store.blockedDevices.push({
        id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        deviceId: deviceId || 'unknown-device',
        ip: ip || '',
        phone: phone || '',
        attempts: existing.count,
        reason: `${max} marta ketma-ket noto'g'ri parol terilgani sababli tizim tomonidan avto-bloklandi`,
        blockedAt: new Date().toISOString(),
      });
    }
  }

  await saveStore(store);

  return {
    attempts: existing.count,
    maxAttempts: max,
    isBlockedNow,
  };
}

/**
 * Muvaffaqiyatli kirganda urinishlar hisoblagichini tozalash
 */
export async function clearFailedAttempts(deviceId: string, ip?: string, phone?: string): Promise<void> {
  const store = await ensureStore();
  const keys = [deviceId, ip, phone].filter(Boolean) as string[];
  for (const k of keys) {
    if (store.failedAttemptRecords[k]) {
      delete store.failedAttemptRecords[k];
    }
  }
  await saveStore(store);
}

/**
 * Qurilmani blokdan chiqarish (Admin uchun)
 */
export async function unblockDevice(deviceIdOrId: string): Promise<boolean> {
  const store = await ensureStore();
  const initialLen = store.blockedDevices.length;
  store.blockedDevices = store.blockedDevices.filter(
    (b) => b.id !== deviceIdOrId && b.deviceId !== deviceIdOrId
  );

  // Shuningdek urinishlar tarixini ham o'chiramiz
  for (const k of Object.keys(store.failedAttemptRecords)) {
    if (store.failedAttemptRecords[k].deviceId === deviceIdOrId) {
      delete store.failedAttemptRecords[k];
    }
  }

  if (store.blockedDevices.length !== initialLen) {
    await saveStore(store);
    return true;
  }
  return false;
}

/**
 * Barcha bloklangan qurilmalar ro'yxatini olish
 */
export async function getBlockedDevices(): Promise<BlockedDeviceRecord[]> {
  const store = await ensureStore();
  return store.blockedDevices;
}

/**
 * Xavfsizlik sozlamalarini olish
 */
export async function getSecuritySettings(): Promise<SecuritySettings> {
  const store = await ensureStore();
  return store.settings;
}

/**
 * Xavfsizlik sozlamalarini yangilash (Telegram bot token, username va h.k.)
 */
export async function updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
  const store = await ensureStore();
  store.settings = {
    ...store.settings,
    ...settings,
  };
  await saveStore(store);
  return store.settings;
}
