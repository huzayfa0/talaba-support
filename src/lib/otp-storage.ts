import fs from 'fs/promises';
import path from 'path';

export interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
  telegramUsername?: string;
  chatId?: string | number;
  createdAt: string;
}

export interface OtpStoreData {
  pendingOtps: Record<string, OtpRecord>;
  chatPhoneMap: Record<string, string>; // chatId -> phone
  phoneChatMap: Record<string, string | number>; // phone -> chatId
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const OTP_FILE = path.join(DATA_DIR, 'otp-store.json');

const INITIAL_STORE: OtpStoreData = {
  pendingOtps: {},
  chatPhoneMap: {},
  phoneChatMap: {},
};

/**
 * Telefon raqamini tozalash (faqat raqamlar)
 */
export function cleanPhoneNumber(phone: string): string {
  let cleaned = (phone || '').replace(/[^0-9]/g, '');
  // Agar 901234567 kiritilgan bo'lsa (9 ta raqam), oldiga 998 qo'shamiz
  if (cleaned.length === 9) {
    cleaned = '998' + cleaned;
  }
  return cleaned;
}

/**
 * Aynan 4 xonali tasdiqlash kodini generatsiya qilish (1000 - 9999)
 * Foydalanuvchi talabi: "to'rtxonalik raqam bilan kod borsin agar 5 xona va undan yuqori bo'lsa odamlar shubxalanadi"
 */
export function generateOtpCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Fayldan xavfsiz o'qish
 */
async function loadStore(): Promise<OtpStoreData> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(OTP_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      pendingOtps: parsed.pendingOtps || {},
      chatPhoneMap: parsed.chatPhoneMap || {},
      phoneChatMap: parsed.phoneChatMap || {},
    };
  } catch {
    return { ...INITIAL_STORE };
  }
}

/**
 * Faylga yozish
 */
async function saveStore(store: OtpStoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OTP_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/**
 * 4 xonali OTP kodini saqlash (5 daqiqa muddat)
 */
export async function savePendingOtp(
  phone: string,
  code: string,
  options?: { telegramUsername?: string; chatId?: string | number }
): Promise<OtpRecord> {
  const clean = cleanPhoneNumber(phone);
  const store = await loadStore();

  const record: OtpRecord = {
    phone: clean,
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 daqiqa
    telegramUsername: options?.telegramUsername?.replace(/^@/, '').trim(),
    chatId: options?.chatId,
    createdAt: new Date().toISOString(),
  };

  store.pendingOtps[clean] = record;

  if (options?.chatId) {
    store.chatPhoneMap[String(options.chatId)] = clean;
    store.phoneChatMap[clean] = options.chatId;
  }

  await saveStore(store);
  return record;
}

/**
 * Kutilayotgan OTP ni olish
 */
export async function getPendingOtp(phone: string): Promise<OtpRecord | null> {
  const clean = cleanPhoneNumber(phone);
  const store = await loadStore();
  const record = store.pendingOtps[clean];

  if (!record) return null;

  if (Date.now() > record.expiresAt) {
    delete store.pendingOtps[clean];
    await saveStore(store);
    return null;
  }

  return record;
}

/**
 * OTP ni o'chirish (muvaffaqiyatli tekshirilgach)
 */
export async function deletePendingOtp(phone: string): Promise<void> {
  const clean = cleanPhoneNumber(phone);
  const store = await loadStore();
  if (store.pendingOtps[clean]) {
    delete store.pendingOtps[clean];
    await saveStore(store);
  }
}

/**
 * Telegram chatId va telefon raqami o'rtasidagi bog'liqlikni saqlash
 */
export async function saveUserChatMapping(
  chatId: string | number,
  phone: string
): Promise<void> {
  const clean = cleanPhoneNumber(phone);
  const store = await loadStore();
  store.chatPhoneMap[String(chatId)] = clean;
  store.phoneChatMap[clean] = chatId;
  await saveStore(store);
}

/**
 * Telefon raqami bo'yicha Telegram chatId ni topish
 */
export async function getChatIdByPhone(phone: string): Promise<string | number | null> {
  const clean = cleanPhoneNumber(phone);
  const store = await loadStore();
  return store.phoneChatMap[clean] || null;
}
