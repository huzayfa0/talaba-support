import { getSecuritySettings } from './security-storage';
import {
  generateOtpCode,
  savePendingOtp,
  getPendingOtp,
  deletePendingOtp,
  getChatIdByPhone,
  cleanPhoneNumber,
} from './otp-storage';

export { generateOtpCode };

const DEFAULT_BOT_TOKEN = '8222935062:AAH7vuajffGpGH-I0VvNPebbF41qVeWEgZ0';
const DEFAULT_BOT_USERNAME = 'darsliklar_ai_bot';

/**
 * Foydalanuvchining telefon yoki Telegramiga 4 xonali kod yuborish
 */
export async function sendTelegramOtp(
  phone: string,
  telegramUsername?: string
): Promise<{
  success: boolean;
  code?: string;
  isSimulated: boolean;
  message: string;
  botUsername: string;
}> {
  const cleanPhone = cleanPhoneNumber(phone);
  const cleanTelegram = (telegramUsername || '').replace(/^@/, '').trim();
  
  // Aynan 4 xonali tasdiqlash kodi
  const code = generateOtpCode();

  const settings = await getSecuritySettings();
  const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  const botUsername = settings.telegramBotUsername || process.env.TELEGRAM_BOT_USERNAME || DEFAULT_BOT_USERNAME;

  // Saqlangan chatId bormi?
  let targetChatId = await getChatIdByPhone(cleanPhone);

  // Agar telegramUsername chat ID yoki numeric ID bo'lsa
  if (!targetChatId && /^\d+$/.test(cleanTelegram)) {
    targetChatId = cleanTelegram;
  }

  // 4 xonali kodni umumiy xotiraga (faylga) saqlaymiz (5 daqiqa)
  await savePendingOtp(cleanPhone, code, {
    telegramUsername: cleanTelegram,
    chatId: targetChatId || undefined,
  });

  // Agar bot tokeni va targetChatId mavjud bo'lsa, Telegram Bot API orqali to'g'ridan-to'g'ri xabar jo'natamiz
  if (botToken && botToken.trim().length > 10 && targetChatId) {
    try {
      const textMessage = `🎓 <b>TalabaAI Tasdiqlash Kodi:</b> <code>${code}</code>\n\nUshbu 4 xonali tasdiqlash kodini saytda ro‘yxatdan o‘tish oynasiga kiriting.\n⏳ Amal qilish muddati: 5 daqiqa.\n<i>Xavfsizlik uchun kodni hech kimga bermang!</i>`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text: textMessage,
          parse_mode: 'HTML',
        }),
      });

      const resData = await response.json();
      if (resData.ok) {
        return {
          success: true,
          code,
          isSimulated: false,
          message: `4 xonali tasdiqlash kodi Telegram botingizga yuborildi!`,
          botUsername,
        };
      }
    } catch (err) {
      console.warn('Telegram bot API request error:', err);
    }
  }

  // Agar bot hali to'g'ridan-to'g'ri chat ochmagan bo'lsa:
  // Foydalanuvchiga botga kirish tavsiya qilinadi va qulaylik uchun demoCode ham taqdim etiladi
  return {
    success: true,
    code,
    isSimulated: true,
    message: `Tasdiqlash kodi tayyorlandi! Telegramda @${botUsername} botiga /start bosing yoki ushbu kodni kiriting: ${code}`,
    botUsername,
  };
}

/**
 * Kiritilgan 4 xonali tasdiqlash kodini tekshirish
 */
export async function verifyOtpCode(
  phone: string,
  inputCode: string
): Promise<{ valid: boolean; message: string }> {
  const cleanPhone = cleanPhoneNumber(phone);
  const entry = await getPendingOtp(cleanPhone);

  if (!entry) {
    return {
      valid: false,
      message: 'Tasdiqlash kodi topilmadi yoki muddati o‘tgan. Iltimos, qayta kod so‘rang.',
    };
  }

  if (Date.now() > entry.expiresAt) {
    await deletePendingOtp(cleanPhone);
    return {
      valid: false,
      message: 'Kodingizning 5 daqiqalik muddati tugadi. Iltimos, yangi kod oling.',
    };
  }

  if (entry.code !== inputCode.trim()) {
    return {
      valid: false,
      message: 'Kiritilgan 4 xonali tasdiqlash kodi noto‘g‘ri. Iltimos, tekshirib qayta tering.',
    };
  }

  // Muvaffaqiyatli tasdiqlandi, bittalik kodni tozalaymiz
  await deletePendingOtp(cleanPhone);

  return {
    valid: true,
    message: 'Kod muvaffaqiyatli tasdiqlandi!',
  };
}
