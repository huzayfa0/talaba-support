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
    let user = await findUserByPhone(cleanPhone);

    const settings = await getSecuritySettings();
    const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
    const botUsername = settings.telegramBotUsername || process.env.TELEGRAM_BOT_USERNAME || DEFAULT_BOT_USERNAME;

    // Saqlangan chatId bormi?
    const targetChatId = await getChatIdByPhone(cleanPhone);

    // Agar user topilmagan bo'lsa, lekin chatId bo'lsa - Telegram orqali tekshiramiz
    if (!user && targetChatId && botToken) {
      try {
        const chatRes = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${targetChatId}`);
        const chatData = await chatRes.json();
        if (chatData.ok && chatData.result) {
          const tgUsername = chatData.result.username;
          if (tgUsername) {
            user = await findUserByPhone(tgUsername);
          }
        }
      } catch (e) {
        console.warn('getChat error:', e);
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          error: `Ushbu telefon raqam bilan ro‘yxatdan o‘tgan hisob topilmadi. Telegramda @${botUsername} botini ochib, telefon raqamingizni yuboring va qayta urinib ko‘ring.`,
          botUsername,
        },
        { status: 404 }
      );
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
          `🏫 <b>Universitet:</b> ${user.university || 'TATU'}\n` +
          `📱 <b>Telefon:</b> ${user.phone}\n\n` +
          `👉 <i>Saytga kirish:</i> <a href="https://huzayfa0.uz/login">huzayfa0.uz/login</a>\n\n` +
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
      password: !telegramSent ? user.passwordHash : undefined,
      botUsername,
      message: telegramSent
        ? `Hisobingiz ma’lumotlari (login va parol) @${botUsername} orqali Telegramingizga muvaffaqiyatli yuborildi!`
        : `Login va parolingiz tayyor! Login: ${user.username || user.phone}, Parol: ${user.passwordHash}. Telegramda @${botUsername} botiga kiring.`,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Parolni tiklashda server xatoligi yuz berdi' },
      { status: 500 }
    );
  }
}
