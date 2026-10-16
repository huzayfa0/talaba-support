import { NextRequest, NextResponse } from 'next/server';
import { findUserByPhone } from '@/lib/admin-storage';
import { getSecuritySettings } from '@/lib/security-storage';
import { cleanPhoneNumber, getChatIdByPhone, saveUserChatMapping } from '@/lib/otp-storage';

const DEFAULT_BOT_TOKEN = '8222935062:AAH7vuajffGpGH-I0VvNPebbF41qVeWEgZ0';
const DEFAULT_BOT_USERNAME = 'darsliklar_ai_bot';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.trim().length < 7) {
      return NextResponse.json(
        { error: 'Iltimos, ro‘yxatdan o‘tgan telefon raqamingizni to‘liq kiriting' },
        { status: 400 }
      );
    }

    const cleanPhone = cleanPhoneNumber(phone);
    const user = await findUserByPhone(cleanPhone);

    if (!user) {
      return NextResponse.json(
        {
          error: 'Ushbu telefon raqam bilan ro‘yxatdan o‘tgan hisob topilmadi. Iltimos, raqamni tekshirib qayta kiriting yoki yangi hisob oching.',
        },
        { status: 404 }
      );
    }

    const settings = await getSecuritySettings();
    const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
    const botUsername = settings.telegramBotUsername || process.env.TELEGRAM_BOT_USERNAME || DEFAULT_BOT_USERNAME;

    // Saqlangan chatId bormi?
    let targetChatId = await getChatIdByPhone(cleanPhone);

    // Agar chatId topilmagan bo'lsa, Telegram getUpdates orqali botga yozgan foydalanuvchilar orasidan tekshirib ko'ramiz
    if (!targetChatId && botToken && botToken.length > 10) {
      try {
        const updatesRes = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=50&offset=-50`);
        const updatesData = await updatesRes.json();
        if (updatesData.ok && Array.isArray(updatesData.result)) {
          for (const upd of updatesData.result.reverse()) {
            const msg = upd.message;
            if (!msg) continue;
            const cid = msg.chat?.id;
            const contactPhone = msg.contact?.phone_number ? cleanPhoneNumber(msg.contact.phone_number) : '';
            const msgText = msg.text ? cleanPhoneNumber(msg.text) : '';
            const fromUser = msg.from?.username?.toLowerCase();
            const storedUser = user.telegramUsername?.toLowerCase().replace(/^@/, '');

            if (
              (contactPhone && contactPhone === cleanPhone) ||
              (msgText && msgText === cleanPhone) ||
              (fromUser && storedUser && fromUser === storedUser)
            ) {
              targetChatId = cid;
              await saveUserChatMapping(cid, cleanPhone);
              break;
            }
          }
        }
      } catch (err) {
        console.warn('Telegram updates check error:', err);
      }
    }

    let telegramSent = false;

    // Telegramga xabar yuborish
    if (botToken && botToken.trim().length > 10 && targetChatId) {
      try {
        const textMessage =
          `🎓 <b>TalabaAI — Hisob Ma’lumotlarini Tiklash</b>\n\n` +
          `Assalomu alaykum, <b>${user.name}</b>!\n` +
          `Sizning TalabaAI platformasidagi shaxsiy hisobingiz ma’lumotlari:\n\n` +
          `👤 <b>Login:</b> <code>${user.username || user.phone}</code>\n` +
          `🔑 <b>Parol:</b> <code>${user.passwordHash}</code>\n` +
          `🏫 <b>Universitet:</b> ${user.university || 'Belgilanmagan'}\n` +
          `📱 <b>Telefon:</b> ${user.phone}\n\n` +
          `👉 <i>Saytga kirish:</i> <a href="https://talaba.uz/login">talaba.uz/login</a>\n\n` +
          `⚠️ <i>Xavfsizligingiz uchun ushbu login va parolni hech kimga bermang!</i>`;

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
          telegramSent = true;
        }
      } catch (err) {
        console.warn('Telegram sendMessage error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      telegramSent,
      username: user.username || user.phone,
      botUsername,
      message: telegramSent
        ? `Hisobingiz ma’lumotlari @${botUsername} orqali Telegramingizga muvaffaqiyatli yuborildi!`
        : `Login va parolingiz tayyorlandi! Telegramda @${botUsername} botini ochib /start bosing yoki quyidagi ma'lumotlar bilan kiring.`,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Parolni tiklashda server xatoligi yuz berdi' },
      { status: 500 }
    );
  }
}
