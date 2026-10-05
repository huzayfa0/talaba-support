import { NextRequest, NextResponse } from 'next/server';
import {
  generateBackupData,
  restoreBackupData,
  getBackupConfig,
  saveBackupConfig,
  sendBackupToTelegram,
  resetDatabaseToClean,
} from '@/lib/backup-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'config';

    // 1. Faylni brauzerga to'g'ridan-to'g'ri yuklab olish (Download JSON)
    if (action === 'download') {
      const backupData = await generateBackupData();
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `talaba_backup_${dateStr}.json`;
      const jsonStr = JSON.stringify(backupData, null, 2);

      return new NextResponse(jsonStr, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // 2. Eksport JSON ob'ektini olish
    if (action === 'export') {
      const backupData = await generateBackupData();
      return NextResponse.json({
        success: true,
        backup: backupData,
      });
    }

    // 3. Konfiguratsiya va statistika
    const [config, backupData] = await Promise.all([
      getBackupConfig(),
      generateBackupData(),
    ]);

    return NextResponse.json({
      success: true,
      config,
      stats: backupData.stats,
      exportedAt: backupData.exportedAt,
    });
  } catch (error: any) {
    console.error('Backup GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Zaxira ma‘lumotlarini olishda xatolik' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // A: Agar FormData (Fayl yuklash orqali restore qilish) bo'lsa
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Zaxira fayli tanlanmadi' }, { status: 400 });
      }

      const text = await file.text();
      let payload: any;
      try {
        payload = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: 'Fayl yaroqli JSON formatida emas' }, { status: 400 });
      }

      const result = await restoreBackupData(payload);
      return NextResponse.json(result);
    }

    // B: JSON formatidagi so'rovlar
    const body = await req.json();
    const { action } = body;

    // 1. Zaxiradan tiklash (Restore)
    if (action === 'restore') {
      const { backupData } = body;
      if (!backupData) {
        return NextResponse.json({ error: 'Tiklash uchun zaxira ma‘lumotlari berilmadi' }, { status: 400 });
      }
      const result = await restoreBackupData(backupData);
      return NextResponse.json(result);
    }

    // 2. Telegram botga zaxira faylini yuborish
    if (action === 'send_telegram') {
      const { chatId, botToken } = body;
      const result = await sendBackupToTelegram(chatId, botToken);
      return NextResponse.json(result);
    }

    // 3. Konfiguratsiyani saqlash (Sozlamalar)
    if (action === 'save_config') {
      const { config } = body;
      if (!config) {
        return NextResponse.json({ error: 'Konfiguratsiya ma‘lumotlari kiritilmadi' }, { status: 400 });
      }
      const updated = await saveBackupConfig(config);
      return NextResponse.json({
        success: true,
        config: updated,
        message: 'Zaxira va Telegram bot sozlamalari muvaffaqiyatli saqlandi!',
      });
    }

    // 4. Barcha test ma'lumotlarini tozalash (Reset to Clean)
    if (action === 'reset_database') {
      const result = await resetDatabaseToClean();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Noma‘lum amal' }, { status: 400 });
  } catch (error: any) {
    console.error('Backup POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Zaxira amalini bajarishda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
