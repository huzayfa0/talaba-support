import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Video fayl tanlanmadi' }, { status: 400 });
    }

    // Fayl hajmi va formati tekshiruvi
    const mimeType = file.type;
    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase() || '.mp4';

    const validExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.mkv', '.avi'];
    if (!validExtensions.includes(ext) && !mimeType.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Faqat video formatidagi fayllarni yuklash mumkin (MP4, WebM, MOV, MKV).' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'courses');
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const filename = `dars_${timestamp}_${safeBaseName}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    const videoUrl = `/uploads/courses/${filename}`;
    const streamUrl = `/api/courses/stream?file=${filename}`;

    return NextResponse.json({
      success: true,
      videoUrl,
      streamUrl,
      filename,
      sizeMb: (buffer.length / (1024 * 1024)).toFixed(2),
      message: 'Video fayl muvaffaqiyatli yuklandi!',
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Videoni yuklash jarayonida serverda xatolik yuz berdi' },
      { status: 500 }
    );
  }
}
