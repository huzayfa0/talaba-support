import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const DATA_DIR = path.join(projectRoot, 'src', 'data');
const OTP_FILE = path.join(DATA_DIR, 'otp-store.json');
const SECURITY_FILE = path.join(DATA_DIR, 'security-store.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin-store.json');

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
async function findUserInAdminStore(phone, username, chatId) {
  try {
    const content = await fs.readFile(ADMIN_FILE, 'utf-8');
    const store = JSON.parse(content);
    if (!Array.isArray(store.users)) return null;

    const clean = phone ? cleanPhoneNumber(phone) : '';
    const clean9 = clean.slice(-9);
    const clean7 = clean.slice(-7);
    const lowerTg = (username || '').toLowerCase().replace(/^@/, '');

    // 1. Telefon raqam bo'yicha qidiruv
    if (clean.length >= 7) {
      const u = store.users.find((user) => {
        if (!user.phone) return false;
        const uClean = cleanPhoneNumber(user.phone);
        if (uClean === clean) return true;
        if (clean9.length === 9 && uClean.slice(-9) === clean9) return true;
        if (clean7.length === 7 && uClean.slice(-7) === clean7) return true;
        return false;
      });
      if (u) return { user: u, store };
    }

    // 2. Telegram username bo'yicha qidiruv
    if (lowerTg) {
      const u = store.users.find((user) => {
        if (!user.telegramUsername) return false;
        return user.telegramUsername.toLowerCase().replace(/^@/, '') === lowerTg;
      });
      if (u) return { user: u, store };
    }

    return null;
  } catch (err) {
    console.error('findUserInAdminStore xatolik:', err);
    return null;
  }
}

async function sendCredentialsMessage(chatId, user) {
  const replyMarkup = {
    keyboard: [
      [{ text: '🔑 Mening login va parolim' }],
      [{ text: '📱 Telefon raqamimni yuborish', request_contact: true }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  };

  await sendTelegramMessage(
    chatId,
    `🎓 <b>TalabaAI — Shaxsiy hisobingiz ma’lumotlari:</b>\n\n` +
    `Assalomu alaykum, <b>${user.name || 'Talaba'}</b>!\n` +
    `Sizning tizimga kirish uchun login va parolingiz:\n\n` +
    `👤 <b>Login:</b> <code>${user.username || user.phone}</code>\n` +
    `🔑 <b>Parol:</b> <code>${user.passwordHash}</code>\n` +
    `🏫 <b>OTM:</b> ${user.university || 'TATU'}\n` +
    `📱 <b>Telefon:</b> ${user.phone}\n\n` +
    `👉 <b>Saytga kirish:</b> <a href="https://huzayfa0.uz/login">huzayfa0.uz/login</a>\n\n` +
    `⚠️ <i>Xavfsizligingiz uchun ushbu login va parolni begonalarga bermang!</i>`,
    replyMarkup
  );
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

            // Foydalanuvchini bazadan qidiramiz
            let found = await findUserInAdminStore(cleanPhone, username, chatId);

            if (found) {
              const { user, store } = found;
              user.phone = `+${cleanPhone}`;
              if (username) user.telegramUsername = username;
              user.updatedAt = new Date().toISOString();
              try {
                await fs.writeFile(ADMIN_FILE, JSON.stringify(store, null, 2), 'utf-8');
              } catch {}
              await sendCredentialsMessage(chatId, user);
            } else {
              // Agar bazada topilmasa, ushbu tasdiqlangan telegram foydalanuvchi uchun avtomatik profil yaratamiz
              try {
                const content = await fs.readFile(ADMIN_FILE, 'utf-8');
                const store = JSON.parse(content);
                if (!Array.isArray(store.users)) store.users = [];

                const newUser = {
                  id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  name: userFirstName || 'Talaba',
                  username: username || `talaba_${cleanPhone.slice(-4)}`,
                  email: `${cleanPhone}@talaba.uz`,
                  phone: `+${cleanPhone}`,
                  telegramUsername: username || '',
                  passwordHash: `talaba_${cleanPhone.slice(-4)}`,
                  university: 'Muhammad al-Xorazmiy nomidagi Toshkent axborot texnologiyalari universiteti (TATU)',
                  faculty: 'Axborot texnologiyalari',
                  group: '304-guruh',
                  plan: 'free',
                  tokens: 10,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  isBlocked: false,
                  failedAttempts: 0,
                  customNotes: 'Telegram bot orqali avtomatik ro‘yxatdan o‘tgan talaba',
                };

                store.users.unshift(newUser);
                await fs.writeFile(ADMIN_FILE, JSON.stringify(store, null, 2), 'utf-8');
                await sendCredentialsMessage(chatId, newUser);
              } catch (err) {
                console.error('Yangi user yaratishda xatolik:', err);
              }
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

          // 1.3 Login va parol so'rash buyrug'i
          if (
            text === '🔑 Mening login va parolim' ||
            text === '/login' ||
            text === '/parol' ||
            text === '/hisob' ||
            text.toLowerCase().includes('login') ||
            text.toLowerCase().includes('parol')
          ) {
            const store = await loadOtpStore();
            const savedPhone = store.chatPhoneMap ? store.chatPhoneMap[String(chatId)] : null;
            const found = await findUserInAdminStore(savedPhone, username, chatId);

            if (found) {
              await sendCredentialsMessage(chatId, found.user);
            } else {
              await sendTelegramMessage(
                chatId,
                `Hisob ma’lumotlaringizni aniqlash uchun iltimos, pastdagi <b>"📱 Telefon raqamimni yuborish"</b> tugmasini bosing:`,
                {
                  keyboard: [
                    [{ text: '📱 Telefon raqamimni yuborish', request_contact: true }],
                  ],
                  resize_keyboard: true,
                  one_time_keyboard: false,
                }
              );
            }
            continue;
          }

          // 2. /start yoki /help buyrug'i
          if (text.startsWith('/start') || text === '/help') {
            const store = await loadOtpStore();
            const savedPhone = store.chatPhoneMap ? store.chatPhoneMap[String(chatId)] : null;
            const found = await findUserInAdminStore(savedPhone, username, chatId);

            if (found) {
              await sendCredentialsMessage(chatId, found.user);
            } else {
              await sendTelegramMessage(
                chatId,
                `Assalomu alaykum, <b>${userFirstName}</b>! 🎓\n\n` +
                `<b>TalabaAI</b> platformasining rasmiy botiga xush kelibsiz.\n\n` +
                `Saytdagi shaxsiy profilingiz, login va parolingizni bilish yoki tasdiqlash kodini olish uchun pastdagi tugmani bosing:`,
                {
                  keyboard: [
                    [{ text: '🔑 Mening login va parolim' }],
                    [{ text: '📱 Telefon raqamimni yuborish', request_contact: true }],
                  ],
                  resize_keyboard: true,
                  one_time_keyboard: false,
                }
              );
            }
            continue;
          }

          // 3. Matn ko'rinishida telefon raqami yuborilgan holat
          const digitsOnly = text.replace(/[^0-9]/g, '');
          if (digitsOnly.length >= 9) {
            const cleanPhone = cleanPhoneNumber(text);

            await saveChatPhoneMapping(chatId, cleanPhone);
            console.log(`[TELEFON ULANDI] Tel: +${cleanPhone} <-> ChatId: ${chatId}`);

            const found = await findUserInAdminStore(cleanPhone, username, chatId);
            if (found) {
              const { user, store } = found;
              user.phone = `+${cleanPhone}`;
              if (username) user.telegramUsername = username;
              user.updatedAt = new Date().toISOString();
              try {
                await fs.writeFile(ADMIN_FILE, JSON.stringify(store, null, 2), 'utf-8');
              } catch {}
              await sendCredentialsMessage(chatId, user);
            } else {
              await sendTelegramMessage(
                chatId,
                `✅ <b>Telefon raqamingiz muvaffaqiyatli ulandi!</b>\n\n` +
                `📱 <b>Raqamingiz:</b> <code>+${cleanPhone}</code>\n\n` +
                `Endi saytga (<b>huzayfa0.uz</b>) o‘tib, ro‘yxatdan o‘tish yoki tizimga kirishda ushbu raqamingizni kiritishingiz mumkin.`
              );
            }
            continue;
          }

          // 4. Boshqa matn yozilgan holat
          const store = await loadOtpStore();
          const savedPhone = store.chatPhoneMap ? store.chatPhoneMap[String(chatId)] : null;
          const found = await findUserInAdminStore(savedPhone, username, chatId);

          if (found) {
            await sendCredentialsMessage(chatId, found.user);
          } else {
            // Telefon yuborishni so'raymiz
            await sendTelegramMessage(
              chatId,
              `Iltimos, hisobingiz ma’lumotlarini olish uchun pastdagi <b>"📱 Telefon raqamimni yuborish"</b> tugmasini bosing:`,
              {
                keyboard: [
                  [{ text: '🔑 Mening login va parolim' }],
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
