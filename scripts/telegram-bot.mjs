import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const DATA_DIR = path.join(projectRoot, 'src', 'data');
const OTP_FILE = path.join(DATA_DIR, 'otp-store.json');
const SECURITY_FILE = path.join(DATA_DIR, 'security-store.json');

// Standart token
let BOT_TOKEN = '8222935062:AAH7vuajffGpGH-I0VvNPebbF41qVeWEgZ0';

function cleanPhoneNumber(phone) {
  let cleaned = (phone || '').replace(/[^0-9]/g, '');
  if (cleaned.length === 9) {
    cleaned = '998' + cleaned;
  }
  return cleaned;
}

// 4 xonali tasdiqlash kodi (1000 - 9999)
function generateOtpCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function loadOtpStore() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(OTP_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { pendingOtps: {}, chatPhoneMap: {}, phoneChatMap: {} };
  }
}

async function saveOtpStore(store) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OTP_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

async function savePendingOtp(phone, code, options = {}) {
  const clean = cleanPhoneNumber(phone);
  const store = await loadOtpStore();

  const record = {
    phone: clean,
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
    telegramUsername: options.telegramUsername || '',
    chatId: options.chatId || undefined,
    createdAt: new Date().toISOString(),
  };

  store.pendingOtps[clean] = record;
  if (options.chatId) {
    store.chatPhoneMap[String(options.chatId)] = clean;
    store.phoneChatMap[clean] = options.chatId;
  }

  await saveOtpStore(store);
  return record;
}

async function saveChatPhoneMapping(chatId, phone) {
  const clean = cleanPhoneNumber(phone);
  const store = await loadOtpStore();
  if (!store.chatPhoneMap) store.chatPhoneMap = {};
  if (!store.phoneChatMap) store.phoneChatMap = {};
  store.chatPhoneMap[String(chatId)] = clean;
  store.phoneChatMap[clean] = chatId;
  await saveOtpStore(store);
  return clean;
}

async function sendTelegramMessage(chatId, text, replyMarkup = null) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error('Xabar yuborishda xatolik:', err);
    return null;
  }
}

const BACKUP_CONFIG_FILE = path.join(DATA_DIR, 'backup-config.json');

async function loadBackupConfig() {
  try {
    const content = await fs.readFile(BACKUP_CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      isAutoBackupEnabled: true,
      telegramBotToken: BOT_TOKEN,
      telegramAdminChatId: '',
      schedule: 'daily_midnight',
      customTime: '00:00',
    };
  }
}

async function saveBackupConfig(config) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(BACKUP_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Backup config saqlashda xatolik:', err);
  }
}

async function generateBackupPayload() {
  const readJson = async (file, fallback) => {
    try {
      const c = await fs.readFile(file, 'utf-8');
      return JSON.parse(c);
    } catch {
      return fallback;
    }
  };

  const adminStore = await readJson(path.join(DATA_DIR, 'admin-store.json'), { users: [] });
  const coursesStore = await readJson(path.join(DATA_DIR, 'courses-store.json'), { subjects: [], lessons: [] });
  const messengerStore = await readJson(path.join(DATA_DIR, 'messenger-store.json'), { groups: [], messages: {} });
  const directChatsStore = await readJson(path.join(DATA_DIR, 'direct-chats-store.json'), { messages: {} });
  const securityStore = await readJson(path.join(DATA_DIR, 'security-store.json'), { settings: {}, blockedDevices: [] });

  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    system: 'TalabaAI Ta’lim Platformasi',
    stats: {
      usersCount: Array.isArray(adminStore.users) ? adminStore.users.length : 0,
      subjectsCount: Array.isArray(coursesStore.subjects) ? coursesStore.subjects.length : 0,
      lessonsCount: Array.isArray(coursesStore.lessons) ? coursesStore.lessons.length : 0,
      groupsCount: Array.isArray(messengerStore.groups) ? messengerStore.groups.length : 0,
      directChatsCount: directChatsStore.messages ? Object.keys(directChatsStore.messages).length : 0,
    },
    stores: {
      adminStore,
      coursesStore,
      messengerStore,
      directChatsStore,
      securityStore,
    },
  };
}

async function sendBackupDocumentToChat(chatId, token = BOT_TOKEN) {
  try {
    const backupData = await generateBackupPayload();
    const dateStr = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    const fileName = `talaba_backup_${dateStr}.json`;
    const jsonStr = JSON.stringify(backupData, null, 2);

    const caption =
      `📦 <b>TalabaAI Tizimi Zaxira Nusxasi (Backup)</b>\n\n` +
      `📅 <b>Vaqt:</b> ${new Date().toLocaleString('uz-UZ')}\n` +
      `👥 <b>Talabalar:</b> ${backupData.stats.usersCount} ta\n` +
      `📚 <b>Fanlar:</b> ${backupData.stats.subjectsCount} ta\n` +
      `🎓 <b>Video Darslar:</b> ${backupData.stats.lessonsCount} ta\n` +
      `👥 <b>Guruhlar:</b> ${backupData.stats.groupsCount} ta\n` +
      `💬 <b>Muloqotlar:</b> ${backupData.stats.directChatsCount} ta\n\n` +
      `💾 <i>Ushbu fayl platformangizning to‘liq bazasini o‘z ichiga oladi. Yangi serverga o‘tganingizda ushbu fayl orqali barchasini 1 soniyada tiklashingiz mumkin.</i>`;

    const formData = new FormData();
    formData.append('chat_id', chatId);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    formData.append('document', blob, fileName);
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');

    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  } catch (err) {
    console.error('Backup document yuborishda xatolik:', err);
    return null;
  }
}

let lastBackupCheck = 0;
async function checkScheduledAutoBackup() {
  const now = Date.now();
  if (now - lastBackupCheck < 60000) return;
  lastBackupCheck = now;

  try {
    const config = await loadBackupConfig();
    if (!config.isAutoBackupEnabled || !config.telegramAdminChatId) return;

    const token = config.telegramBotToken || BOT_TOKEN;
    const lastBackupTime = config.lastBackupAt ? new Date(config.lastBackupAt).getTime() : 0;
    const hoursSinceLast = (now - lastBackupTime) / (1000 * 60 * 60);

    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    let shouldTrigger = false;

    if (config.schedule === 'every_6h') {
      if (hoursSinceLast >= 6) shouldTrigger = true;
    } else if (config.schedule === 'every_12h') {
      if (hoursSinceLast >= 12) shouldTrigger = true;
    } else if (config.schedule === 'weekly') {
      if (hoursSinceLast >= 168 || (currentDate.getDay() === 0 && currentHour === 0 && hoursSinceLast > 20)) {
        shouldTrigger = true;
      }
    } else if (config.schedule === 'daily_custom' && config.customTime) {
      const [targetH, targetM] = config.customTime.split(':').map(Number);
      if (currentHour === targetH && Math.abs(currentMinute - (targetM || 0)) < 3 && hoursSinceLast > 20) {
        shouldTrigger = true;
      }
    } else {
      if (currentHour === 0 && hoursSinceLast > 20) {
        shouldTrigger = true;
      }
    }

    if (shouldTrigger) {
      console.log(`[AVTO-BEKUB] Rejali zaxira nusxasi yuborilmoqda: ChatID ${config.telegramAdminChatId}`);
      const res = await sendBackupDocumentToChat(config.telegramAdminChatId, token);
      if (res && res.ok) {
        config.lastBackupAt = new Date().toISOString();
        config.lastBackupStatus = 'success';
        config.lastBackupMessage = 'Muvaffaqiyatli Telegramga yuborildi';
        await saveBackupConfig(config);
        console.log('[AVTO-BEKUB] Zaxira nusxasi muvaffaqiyatli yetkazildi!');
      } else {
        config.lastBackupStatus = 'error';
        config.lastBackupMessage = res?.description || 'Yuborishda xatolik';
        await saveBackupConfig(config);
      }
    }
  } catch (e) {
    console.error('[AVTO-BEKUB] Tekshirishda xatolik:', e);
  }
}

async function startBot() {
  console.log('--- TalabaAI Telegram Bot ishga tushirilmoqda... ---');
  
  // Security store-dan eng so'nggi tokenni tekshirish
  try {
    const secContent = await fs.readFile(SECURITY_FILE, 'utf-8');
    const secData = JSON.parse(secContent);
    if (secData.settings?.telegramBotToken) {
      BOT_TOKEN = secData.settings.telegramBotToken;
    }
  } catch {}

  // Bot ma'lumotlarini olish
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const meData = await meRes.json();
    if (!meData.ok) {
      console.error('Bot tokeni yaroqsiz:', meData);
      return;
    }
    console.log(`Bot muvaffaqiyatli ulandi: @${meData.result.username} (${meData.result.first_name})`);
  } catch (err) {
    console.error('Telegram API ga ulanishda xatolik:', err);
  }

  let offset = 0;

  // Asosiy long-polling tsikli
  while (true) {
    try {
      await checkScheduledAutoBackup();

      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=25`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          const msg = update.message;
          if (!msg) continue;

          const chatId = msg.chat.id;
          const userFirstName = msg.from?.first_name || 'Foydalanuvchi';
          const username = msg.from?.username || '';

          // 1. Kontakt yuborilgan holat (Tugma bosilganda)
          if (msg.contact && msg.contact.phone_number) {
            const rawPhone = msg.contact.phone_number;
            const cleanPhone = cleanPhoneNumber(rawPhone);

            // Telefon raqam va Chat ID bog'lanishini saqlaymiz
            await saveChatPhoneMapping(chatId, cleanPhone);
            console.log(`[TELEFON ULANDI] Tel: +${cleanPhone} <-> ChatId: ${chatId}`);

            const store = await loadOtpStore();
            const pending = store.pendingOtps ? store.pendingOtps[cleanPhone] : null;

            // Agar oldinroq aynan shu raqam uchun saytdan kod so'ralgan bo'lsa va muddati o'tmagan bo'lsa
            if (pending && pending.code && pending.expiresAt > Date.now()) {
              await sendTelegramMessage(
                chatId,
                `🎓 <b>TalabaAI Tizimi</b>\n\n` +
                `🔐 Saytda so‘ralgan 4 xonali tasdiqlash kodingiz: <code>${pending.code}</code>\n\n` +
                `Ushbu kodni saytga kiriting va ro‘yxatdan o‘tishni yakunlang.\n` +
                `⏳ Amal qilish muddati: <b>5 daqiqa</b>\n\n` +
                `<i>⚠️ Xavfsizlik uchun kodni hech kimga bermang!</i>`
              );
            } else {
              // Foydalanuvchi faqat raqamini uladi, kod saytdan so'ralganda keladi
              await sendTelegramMessage(
                chatId,
                `✅ <b>Telefon raqamingiz muvaffaqiyatli ulandi!</b>\n\n` +
                `📱 <b>Raqamingiz:</b> <code>+${cleanPhone}</code>\n\n` +
                `Endi saytga (<b>huzayfa0.uz</b>) o‘tib, ro‘yxatdan o‘tish yoki tizimga kirishda ushbu raqamingizni kiritib <b>«Kodni olish»</b> tugmasini bosing.\n\n` +
                `📩 Tasdiqlash kodi avtomatik tarzda aynan shu yerga yuboriladi.`
              );
            }
            continue;
          }

          const text = (msg.text || '').trim();

          // 1.1 Chat ID buyrug'i (/id, /myid, /chatid)
          if (text === '/id' || text === '/myid' || text === '/chatid') {
            await sendTelegramMessage(
              chatId,
              `🆔 <b>Sizning Telegram Chat ID:</b> <code>${chatId}</code>\n\n` +
              `📋 Ushbu raqamni nusxalab, TalabaAI Admin Console dagi <b>"Zaxira Nusxa (Backup)"</b> bo‘limiga kiritib saqlasangiz, sayt ma‘lumotlar bazasi avtomatik ravishda shu profilingizga yuborib turiladi.`
            );
            continue;
          }

          // 1.2 Zaxira olish buyrug'i (/backup)
          if (text === '/backup') {
            const bConfig = await loadBackupConfig();
            if (String(chatId) === String(bConfig.telegramAdminChatId) || !bConfig.telegramAdminChatId) {
              await sendTelegramMessage(chatId, '⏳ <b>Zaxira nusxasi tayyorlanmoqda...</b>\nBaza ma‘lumotlari yig‘ilmoqda, 2 soniya kuting.');
              const sendRes = await sendBackupDocumentToChat(chatId, BOT_TOKEN);
              if (sendRes && sendRes.ok) {
                bConfig.lastBackupAt = new Date().toISOString();
                bConfig.lastBackupStatus = 'success';
                await saveBackupConfig(bConfig);
              }
              continue;
            }
          }

          // 2. /start yoki /help buyrug'i
          if (text.startsWith('/start') || text === '/help') {
            await sendTelegramMessage(
              chatId,
              `Assalomu alaykum, <b>${userFirstName}</b>! 🎓\n\n` +
              `<b>TalabaAI</b> platformasining rasmiy botiga xush kelibsiz.\n\n` +
              `Saytdan ro‘yxatdan o‘tishda tasdiqlash kodini olish uchun pastdagi <b>"📱 Telefon raqamimni yuborish"</b> tugmasini bosing yoki telefon raqamingizni yozib yuboring (masalan: <code>+998901234567</code>):\n\n` +
              `<i>💡 Chat ID raqamingizni bilish uchun <code>/id</code> deb yozing.</i>`,
              {
                keyboard: [
                  [{ text: '📱 Telefon raqamimni yuborish', request_contact: true }],
                ],
                resize_keyboard: true,
                one_time_keyboard: false,
              }
            );
            continue;
          }

          // 3. Matn ko'rinishida telefon raqami yuborilgan holat
          const digitsOnly = text.replace(/[^0-9]/g, '');
          if (digitsOnly.length >= 9) {
            const cleanPhone = cleanPhoneNumber(text);

            await saveChatPhoneMapping(chatId, cleanPhone);
            console.log(`[TELEFON ULANDI] Tel: +${cleanPhone} <-> ChatId: ${chatId}`);

            const store = await loadOtpStore();
            const pending = store.pendingOtps ? store.pendingOtps[cleanPhone] : null;

            if (pending && pending.code && pending.expiresAt > Date.now()) {
              await sendTelegramMessage(
                chatId,
                `🎓 <b>TalabaAI Tizimi</b>\n\n` +
                `🔐 Saytda so‘ralgan 4 xonali tasdiqlash kodingiz: <code>${pending.code}</code>\n\n` +
                `Ushbu kodni saytga kiriting va ro‘yxatdan o‘tishni yakunlang.\n` +
                `⏳ Amal qilish muddati: <b>5 daqiqa</b>\n\n` +
                `<i>⚠️ Xavfsizlik uchun kodni hech kimga bermang!</i>`
              );
            } else {
              await sendTelegramMessage(
                chatId,
                `✅ <b>Telefon raqamingiz muvaffaqiyatli ulandi!</b>\n\n` +
                `📱 <b>Raqamingiz:</b> <code>+${cleanPhone}</code>\n\n` +
                `Endi saytga (<b>huzayfa0.uz</b>) o‘tib, ro‘yxatdan o‘tish yoki tizimga kirishda ushbu raqamingizni kiritib <b>«Kodni olish»</b> tugmasini bosing.\n\n` +
                `📩 Tasdiqlash kodi avtomatik tarzda aynan shu yerga yuboriladi.`
              );
            }
            continue;
          }

          // 4. Boshqa matn yozilgan holat
          const store = await loadOtpStore();
          const savedPhone = store.chatPhoneMap ? store.chatPhoneMap[String(chatId)] : null;

          if (savedPhone) {
            await sendTelegramMessage(
              chatId,
              `ℹ️ <b>Sizning hisobingiz ulangan:</b> <code>+${savedPhone}</code>\n\n` +
              `Saytda (<b>huzayfa0.uz</b>) ro‘yxatdan o‘tish yoki kirishda ushbu telefon raqamni kiritsangiz, tasdiqlash kodi avtomatik tarzda shu yerga yuboriladi.\n\n` +
              `<i>💡 Chat ID raqamingizni bilish uchun <code>/id</code> deb yozing.</i>`
            );
          } else {
            // Telefon yuborishni so'raymiz
            await sendTelegramMessage(
              chatId,
              `Iltimos, profilingizni ulash uchun pastdagi <b>"📱 Telefon raqamimni yuborish"</b> tugmasini bosing yoki telefon raqamingizni yozib yuboring (masalan: <code>+998901234567</code>):`,
              {
                keyboard: [
                  [{ text: '📱 Telefon raqamimni yuborish', request_contact: true }],
                ],
                resize_keyboard: true,
                one_time_keyboard: false,
              }
            );
          }
        }
      }
    } catch (err) {
      console.warn('Long pollingda xatolik (qayta ulanmoqda):', err.message || err);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

startBot();
