import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { CourseSubject, CourseLesson } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const COURSES_FILE = path.join(DATA_DIR, 'courses-store.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin-store.json');

interface CoursesStoreData {
  subjects: CourseSubject[];
  lessons: CourseLesson[];
}

async function getAdminPassword(): Promise<string> {
  try {
    const content = await fs.readFile(ADMIN_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed.adminConfig?.passwordHash || 'talabaai_admin_2026!';
  } catch {
    return 'talabaai_admin_2026!';
  }
}

async function getStore(): Promise<CoursesStoreData> {
  try {
    const content = await fs.readFile(COURSES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { subjects: [], lessons: [] };
  }
}

async function saveStore(data: CoursesStoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(COURSES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  try {
    const store = await getStore();
    return NextResponse.json({ success: true, subjects: store.subjects, lessons: store.lessons });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Darslarni yuklashda xatolik yuz berdi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, adminPassword, adminToken } = body;

    // Admin tekshiruvi: parol yoki faol admin sessiya tokeni
    const expectedPassword = await getAdminPassword();
    const isTokenValid = typeof adminToken === 'string' && adminToken.startsWith('adm_token_');
    const isPasswordValid = typeof adminPassword === 'string' && adminPassword.trim() === expectedPassword.trim();

    if (!isPasswordValid && !isTokenValid) {
      return NextResponse.json(
        { error: 'Darslarni faqat Administrator yuklay oladi. Admin paroli yoki sessiyasi talab qilinadi!' },
        { status: 403 }
      );
    }

    const store = await getStore();

    // 1. Yangi dars yuklash
    if (action === 'add_lesson') {
      const { courseId, title, description, videoUrl, durationMinutes } = body;
      if (!courseId || !title || !videoUrl) {
        return NextResponse.json({ error: 'Fan, dars mavzusi va video havolasi kiritilishi shart' }, { status: 400 });
      }

      const subject = store.subjects.find((s) => s.id === courseId);
      if (!subject) {
        return NextResponse.json({ error: 'Tanlangan fan topilmadi' }, { status: 404 });
      }

      // Ushbu fanga tegishli mavjud darslar soni
      const existingLessons = store.lessons.filter((l) => l.courseId === courseId);
      const nextLessonNumber = existingLessons.length + 1;

      // Talab bo'yicha: 1-5 darslar bepul, 6+ darslar pullik!
      const isFree = nextLessonNumber <= 5;

      // Video linkni embed formatga o'tkazish (YouTube bo'lsa)
      let formattedVideoUrl = videoUrl.trim();
      if (formattedVideoUrl.includes('youtube.com/watch?v=')) {
        const videoId = formattedVideoUrl.split('watch?v=')[1]?.split('&')[0];
        if (videoId) formattedVideoUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (formattedVideoUrl.includes('youtu.be/')) {
        const videoId = formattedVideoUrl.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) formattedVideoUrl = `https://www.youtube.com/embed/${videoId}`;
      }

      const newLesson: CourseLesson = {
        id: `lesson-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        courseId,
        lessonNumber: nextLessonNumber,
        title: `${nextLessonNumber}-Dars: ${title.trim()}`,
        description: description?.trim() || 'Amaliy video darslik va konspekt',
        videoUrl: formattedVideoUrl,
        durationMinutes: Number(durationMinutes) || 30,
        isFree,
        createdAt: new Date().toISOString(),
      };

      store.lessons.push(newLesson);
      subject.totalLessons = existingLessons.length + 1;

      await saveStore(store);
      return NextResponse.json({ success: true, lesson: newLesson });
    }

    // 2. Yangi fan (kurs) yaratish
    if (action === 'create_course') {
      const { title, category, description, icon, instructorName } = body;
      if (!title || !title.trim()) {
        return NextResponse.json({ error: 'Fan nomi kiritilishi shart' }, { status: 400 });
      }

      const newSubject: CourseSubject = {
        id: `course-${Date.now()}`,
        title: title.trim(),
        category: category || 'Umumiy',
        description: description?.trim() || 'Oliy ta‘lim va amaliy fanlar kursi',
        icon: icon || '🎓',
        instructorName: instructorName?.trim() || 'TalabaAI O‘qituvchisi',
        totalLessons: 0,
        freeLessonsCount: 5,
        createdAt: new Date().toISOString(),
      };

      store.subjects.push(newSubject);
      await saveStore(store);
      return NextResponse.json({ success: true, subject: newSubject });
    }

    // 3. Darsni o'chirish
    if (action === 'delete_lesson') {
      const { lessonId } = body;
      const lesson = store.lessons.find((l) => l.id === lessonId);
      if (!lesson) {
        return NextResponse.json({ error: 'Dars topilmadi' }, { status: 404 });
      }

      store.lessons = store.lessons.filter((l) => l.id !== lessonId);
      const subject = store.subjects.find((s) => s.id === lesson.courseId);
      if (subject) {
        subject.totalLessons = Math.max(0, store.lessons.filter((l) => l.courseId === subject.id).length);
      }

      await saveStore(store);
      return NextResponse.json({ success: true });
    }

    // 4. Fanni o'chirish
    if (action === 'delete_course') {
      const { courseId } = body;
      if (!courseId) {
        return NextResponse.json({ error: 'courseId ko‘rsatilmadi' }, { status: 400 });
      }
      store.subjects = store.subjects.filter((s) => s.id !== courseId);
      store.lessons = store.lessons.filter((l) => l.courseId !== courseId);
      await saveStore(store);
      return NextResponse.json({ success: true, message: 'Fan va unga tegishli darslar o‘chirildi' });
    }

    return NextResponse.json({ error: 'Noma‘lum amal' }, { status: 400 });
  } catch (error) {
    console.error('Error in courses route:', error);
    return NextResponse.json({ error: 'Amalni bajarishda xatolik yuz berdi' }, { status: 500 });
  }
}
