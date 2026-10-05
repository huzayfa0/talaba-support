'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Play,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Trash2,
  Crown,
  Star,
  Search,
  Sparkles,
  Shield,
  KeyRound,
  X,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Film,
  ShoppingCart,
  CreditCard,
  Coins,
  Check,
  Zap,
} from 'lucide-react';
import { UserProfile, CourseSubject, CourseLesson } from '@/types';

interface VideoCoursesManagerProps {
  user: UserProfile;
  onOpenAuth: () => void;
}

export default function VideoCoursesManager({
  user,
  onOpenAuth,
}: VideoCoursesManagerProps) {
  const [subjects, setSubjects] = useState<CourseSubject[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('course-web-dev');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Xarid qilingan darslar va kurslar holati
  const getUserKey = () =>
    user.isLoggedIn && (user.id || user.phone || user.email)
      ? user.id || user.phone || user.email
      : 'guest';

  const [purchasedLessonIds, setPurchasedLessonIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const uKey =
          user.isLoggedIn && (user.id || user.phone || user.email)
            ? user.id || user.phone || user.email
            : 'guest';
        const saved = localStorage.getItem(`talaba_purchased_lessons_${uKey}`);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [purchasedCourseIds, setPurchasedCourseIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const uKey =
          user.isLoggedIn && (user.id || user.phone || user.email)
            ? user.id || user.phone || user.email
            : 'guest';
        const saved = localStorage.getItem(`talaba_purchased_courses_${uKey}`);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const uKey = getUserKey();
        const savedLessons = localStorage.getItem(`talaba_purchased_lessons_${uKey}`);
        const savedCourses = localStorage.getItem(`talaba_purchased_courses_${uKey}`);
        setPurchasedLessonIds(savedLessons ? JSON.parse(savedLessons) : []);
        setPurchasedCourseIds(savedCourses ? JSON.parse(savedCourses) : []);
      } catch {}
    }
  }, [user.id, user.phone, user.isLoggedIn]);

  // Sotib olish oynasi
  const [lessonToBuy, setLessonToBuy] = useState<CourseLesson | null>(null);
  const [buySuccessMsg, setBuySuccessMsg] = useState<string | null>(null);
  const [buyErrorMsg, setBuyErrorMsg] = useState<string | null>(null);

  // Admin yuklash modali
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('talaba_admin_session') || '';
    }
    return '';
  });
  const [newLessonCourseId, setNewLessonCourseId] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('30');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  // VIP Upgrade modali
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  // Darslarni yuklash
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) {
        setSubjects(data.subjects || []);
        setLessons(data.lessons || []);
        if (data.subjects && data.subjects.length > 0) {
          if (!selectedSubjectId || !data.subjects.some((s: CourseSubject) => s.id === selectedSubjectId)) {
            setSelectedSubjectId(data.subjects[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Darslarni yuklashda xatolik:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Tanlangan fanning darslari
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const currentLessons = lessons
    .filter((l) => l.courseId === currentSubject?.id)
    .sort((a, b) => a.lessonNumber - b.lessonNumber);

  // Dastlabki darsni tanlash
  useEffect(() => {
    if (currentLessons.length > 0 && (!activeLessonId || !currentLessons.some((l) => l.id === activeLessonId))) {
      setActiveLessonId(currentLessons[0].id);
    }
  }, [selectedSubjectId, currentLessons.length]);

  const activeLesson = currentLessons.find((l) => l.id === activeLessonId) || currentLessons[0];

  // Foydalanuvchi darsni ko'ra oladimi?
  // Qoida: 1-5 darslar mutlaqo bepul (isFree === true). 6+ darslar pullik (faqat Premium, Ultra VIP, yoki alohida sotib olganlar uchun).
  const canWatchLesson = (lesson: CourseLesson): boolean => {
    if (lesson.isFree) return true;
    if (user.isLoggedIn && (user.plan === 'ultra' || user.plan === 'premium')) return true;
    if (purchasedLessonIds.includes(lesson.id)) return true;
    if (purchasedCourseIds.includes(lesson.courseId)) return true;
    return false;
  };

  const isCurrentLessonAllowed = activeLesson ? canWatchLesson(activeLesson) : false;

  // Darsni tanlash
  const handleSelectLesson = (lesson: CourseLesson) => {
    setActiveLessonId(lesson.id);
    if (!canWatchLesson(lesson)) {
      setLessonToBuy(lesson);
    }
  };

  // 1. Tokenlar orqali darsni sotib olish (5 token)
  const handleBuyWithTokens = () => {
    if (!lessonToBuy) return;
    if (!user.isLoggedIn) {
      onOpenAuth();
      return;
    }
    const currentTokens = user.tokens ?? 10;
    if (currentTokens < 5) {
      setBuyErrorMsg('Hisobingizda tokenlar yetarli emas (kamida 5 token kerak).');
      return;
    }

    const updatedTokens = currentTokens - 5;
    user.tokens = updatedTokens;
    try {
      const savedProfile = localStorage.getItem('talaba_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        parsed.tokens = updatedTokens;
        localStorage.setItem('talaba_user_profile', JSON.stringify(parsed));
      }
    } catch {}

    const updatedLessons = [...purchasedLessonIds, lessonToBuy.id];
    setPurchasedLessonIds(updatedLessons);
    localStorage.setItem(`talaba_purchased_lessons_${getUserKey()}`, JSON.stringify(updatedLessons));

    setBuySuccessMsg(`«${lessonToBuy.title}» 5 token evaziga muvaffaqiyatli ochildi!`);
    setTimeout(() => {
      setLessonToBuy(null);
      setBuySuccessMsg(null);
      setBuyErrorMsg(null);
    }, 1800);
  };

  // 2. Bir martalik to'lov orqali sotib olish (12,000 so'm)
  const handleBuyWithPayment = () => {
    if (!lessonToBuy) return;
    if (!user.isLoggedIn) {
      onOpenAuth();
      return;
    }

    const updatedLessons = [...purchasedLessonIds, lessonToBuy.id];
    setPurchasedLessonIds(updatedLessons);
    localStorage.setItem(`talaba_purchased_lessons_${getUserKey()}`, JSON.stringify(updatedLessons));

    setBuySuccessMsg(`«${lessonToBuy.title}» muvaffaqiyatli aktivlashtirildi va ochildi!`);
    setTimeout(() => {
      setLessonToBuy(null);
      setBuySuccessMsg(null);
      setBuyErrorMsg(null);
    }, 1800);
  };

  // 3. Butun fanni sotib olish (49,000 so'm)
  const handleBuyWholeCourse = () => {
    if (!lessonToBuy) return;
    if (!user.isLoggedIn) {
      onOpenAuth();
      return;
    }

    const updatedCourses = [...purchasedCourseIds, lessonToBuy.courseId];
    setPurchasedCourseIds(updatedCourses);
    localStorage.setItem(`talaba_purchased_courses_${getUserKey()}`, JSON.stringify(updatedCourses));

    setBuySuccessMsg(`Ushbu fanning barcha darslari muvaffaqiyatli ochildi!`);
    setTimeout(() => {
      setLessonToBuy(null);
      setBuySuccessMsg(null);
      setBuyErrorMsg(null);
    }, 1800);
  };

  // Admin yangi dars yuklash
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);

    if (!adminPassword.trim()) {
      setAdminError('Admin parolini kiriting!');
      return;
    }
    if (!newLessonTitle.trim() || !newLessonVideoUrl.trim()) {
      setAdminError('Dars sarlavhasi va video havolasi kiritilishi shart!');
      return;
    }

    try {
      setIsSubmittingLesson(true);
      const targetCourseId = newLessonCourseId || selectedSubjectId || subjects[0]?.id;

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_lesson',
          adminPassword: adminPassword.trim(),
          courseId: targetCourseId,
          title: newLessonTitle.trim(),
          description: newLessonDesc.trim(),
          videoUrl: newLessonVideoUrl.trim(),
          durationMinutes: Number(newLessonDuration) || 30,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAdminSuccess('Yangi video dars muvaffaqiyatli yuklandi!');
        setNewLessonTitle('');
        setNewLessonVideoUrl('');
        setNewLessonDesc('');
        sessionStorage.setItem('talaba_admin_session', adminPassword.trim());
        await fetchCourses();
        setTimeout(() => {
          setIsAdminModalOpen(false);
          setAdminSuccess(null);
        }, 1500);
      } else {
        setAdminError(data.error || 'Dars yuklashda xatolik yuz berdi');
      }
    } catch (_err) {
      setAdminError('Server bilan aloqa uzildi');
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  // Admin darsni o'chirish
  const handleDeleteLesson = async (lessonId: string) => {
    const password = prompt('Darsni o‘chirish uchun Admin parolini kiriting:');
    if (!password) return;

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_lesson',
          adminPassword: password,
          lessonId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Dars muvaffaqiyatli o‘chirildi');
        fetchCourses();
      } else {
        alert(data.error || 'O‘chirishda xatolik');
      }
    } catch (_err) {
      alert('Xatolik yuz berdi');
    }
  };

  // Kategoriyalar
  const categories = ['all', 'IT & Dasturlash', 'Sun‘iy Intellekt', 'Kiberxavfsizlik', 'Xorijiy Tillar'];

  const filteredSubjects = subjects.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* Sarlavha & Admin tugmasi */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <GraduationCap size={28} className="text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">Online Video Darsliklar</h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                ⭐ 5 TA DARS BEPUL
              </span>
              {user.plan === 'ultra' ? (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/40 flex items-center gap-1">
                  <Crown size={12} className="text-amber-400" /> Ultra VIP: Barcha darslar ochiq
                </span>
              ) : user.plan === 'premium' ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 flex items-center gap-1">
                  <Star size={12} className="text-amber-400" /> Premium: Barcha darslar ochiq
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                  Oddiy (Free): 1-5 darslar bepul
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Oliy ta‘lim va kasbiy fanlar bo‘yicha sifatli video darslar. Har bir fanning 5 ta darsi mutlaqo bepul!
            </p>
          </div>
        </div>

        {/* Admin dars yuklash tugmasi */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setNewLessonCourseId(selectedSubjectId);
              setIsAdminModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            title="Faqat Administrator uchun dars yuklash"
          >
            <Plus size={15} />
            <span>Dars Yuklash (Admin)</span>
          </button>
        </div>
      </div>

      {/* Fanlar tanlovi (Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'Barcha Fanlar' : cat}
              </button>
            ))}
          </div>

          {/* Qidiruv */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fan yoki mavzuni qidirish..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Fanlar kartalari */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredSubjects.map((sub) => {
            const isSelected = sub.id === selectedSubjectId;
            const subLessons = lessons.filter((l) => l.courseId === sub.id);
            return (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubjectId(sub.id);
                  const firstLesson = subLessons[0];
                  if (firstLesson) setActiveLessonId(firstLesson.id);
                }}
                className={`p-4 rounded-2xl text-left transition-all border cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xl shrink-0">
                    {sub.icon || '🎓'}
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {subLessons.length} ta dars
                  </span>
                </div>

                <h3 className="text-xs font-bold text-white line-clamp-1 mb-1">{sub.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                  {sub.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                  <span className="truncate">O‘qituvchi: {sub.instructorName}</span>
                  <span className="text-emerald-400 font-bold shrink-0">5 ta bepul</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Asosiy Video Player & Playlist (Grid 12 col) */}
      {currentSubject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
          {/* Chap: Video Player Maydoni (8 col) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              {activeLesson ? (
                isCurrentLessonAllowed ? (
                  activeLesson.videoUrl.endsWith('.mp4') ||
                  activeLesson.videoUrl.endsWith('.webm') ||
                  activeLesson.videoUrl.endsWith('.mov') ||
                  activeLesson.videoUrl.startsWith('/uploads/') ||
                  activeLesson.videoUrl.startsWith('/api/courses/') ? (
                    <video
                      key={activeLesson.id}
                      src={
                        activeLesson.videoUrl.startsWith('/uploads/courses/')
                          ? `/api/courses/stream?file=${activeLesson.videoUrl.replace('/uploads/courses/', '')}`
                          : activeLesson.videoUrl
                      }
                      controls
                      controlsList="nodownload"
                      className="w-full h-full object-contain bg-black"
                      playsInline
                    />
                  ) : (
                    <iframe
                      key={activeLesson.id}
                      src={activeLesson.videoUrl}
                      title={activeLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  )
                ) : (
                  /* Qulf Ekran (Pullik dars) */
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 animate-bounce">
                      <Lock size={32} />
                    </div>
                    <div className="max-w-md space-y-1">
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 uppercase">
                        Pullik Dars (6-dars va undan keyingilar)
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white pt-1">
                        {activeLesson.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Ushbu fanning 1-5 darslari bepul berilgan. 6-darsdan boshlab barcha darslarni to‘liq ko‘rish uchun Premium yoki Ultra VIP tarifiga ulaning.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        onClick={() => setLessonToBuy(activeLesson)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingCart size={15} />
                        <span>Shu Darsni Sotib Olish (12,000 so‘m / 5 Token)</span>
                      </button>

                      <button
                        onClick={() => {
                          setUpgradeMessage(
                            `«${activeLesson.title}» va barcha boshqa darslarni to‘liq ko‘rish uchun VIP tarifiga o‘ting.`
                          );
                          setShowUpgradeModal(true);
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Crown size={15} className="text-amber-300" />
                        <span>VIP Tarifga O‘tish</span>
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-slate-500 text-xs">Dars tanlanmagan</div>
              )}
            </div>

            {/* Dars ma'lumotlari */}
            {activeLesson && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-white">
                      {activeLesson.title}
                    </span>
                    {activeLesson.isFree ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Bepul Dars
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Lock size={10} /> Pullik (Premium)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {activeLesson.durationMinutes} daqiqa
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User size={13} /> {currentSubject.instructorName}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeLesson.description}
                </p>
              </div>
            )}
          </div>

          {/* O'ng: Pleylist (Darslar ro'yxati) (4 col) */}
          <div className="lg:col-span-4 flex flex-col bg-slate-950/60 rounded-2xl border border-slate-800 p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-400" />
                <h3 className="text-xs font-bold text-white">Fanning Barcha Darslari</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {currentLessons.length} ta dars
              </span>
            </div>

            {/* Darslar ro'yxati */}
            <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1">
              {currentLessons.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Ushbu fanga hali darslar yuklanmagan
                </div>
              ) : (
                currentLessons.map((lesson) => {
                  const isActive = lesson.id === activeLesson?.id;
                  const isAllowed = canWatchLesson(lesson);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`p-2.5 rounded-xl transition-all border flex items-center justify-between gap-2.5 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-500/40 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800/60 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : isAllowed
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-800/60 text-slate-500'
                          }`}
                        >
                          {isAllowed ? <Play size={12} className="ml-0.5" /> : <Lock size={12} />}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate leading-snug">
                            {lesson.title}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock size={10} /> {lesson.durationMinutes} min
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {lesson.isFree ? (
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            BEPUL
                          </span>
                        ) : purchasedLessonIds.includes(lesson.id) || purchasedCourseIds.includes(lesson.courseId) ? (
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                            <Check size={9} /> OCHILGAN
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLessonToBuy(lesson);
                            }}
                            className="px-2 py-0.5 text-[9px] font-bold rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Darsni alohida sotib olish"
                          >
                            <ShoppingCart size={9} /> SOTIB OLISH
                          </button>
                        )}

                        {/* Admin o'chirish tugmasi */}
                        {sessionStorage.getItem('talaba_admin_session') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLesson(lesson.id);
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            title="Darsni o‘chirish"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Qisqacha eslatma */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
              💡 Har bir fanning 1-darsidan 5-darsigacha <strong>mutlaqo bepul</strong>. 6-darsdan boshlab darslarni ko‘rish uchun Premium yoki Ultra VIP kerak.
            </div>
          </div>
        </div>
      )}

      {/* 👑 VIP UPGRADE MODALI */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-purple-500/40 p-6 text-slate-100 shadow-2xl shadow-purple-500/20 text-center">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-purple-500/30">
              <Crown size={32} className="text-amber-300 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">Pullik Dars (6-dars va undan keyingilar)</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {upgradeMessage || 'Ushbu darsni ko‘rish uchun yuqori tarif egalari ruxsatiga ega bo‘lish kerak.'}
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs mb-6">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span><strong>⭐ Premium:</strong> Barcha video darslarni cheksiz ko‘rish, 15 ta slayd.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 size={14} className="text-purple-400 shrink-0" />
                <span><strong>👑 Ultra VIP:</strong> Barcha video darslar, jonli efir, ekran ulashish.</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ ADMIN VIDEO DARS YUKLASH MODALI */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 text-slate-100 shadow-2xl shadow-emerald-500/10">
            <button
              onClick={() => {
                setIsAdminModalOpen(false);
                setAdminError(null);
                setAdminSuccess(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Yangi Video Dars Yuklash (Faqat Admin)</h3>
                <p className="text-xs text-slate-400">
                  Darslik qo‘shilganda 1-5 darslar avtomatik bepul, 6-darsdan pullik bo‘ladi.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-3.5 text-xs">
              {/* Admin paroli */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Admin Paroli <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3.5 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Admin parolini kiriting"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Fan tanlash */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Qaysi Fanga Yuklansin? <span className="text-red-400">*</span>
                </label>
                <select
                  value={newLessonCourseId || selectedSubjectId}
                  onChange={(e) => setNewLessonCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none cursor-pointer"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.title} ({sub.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dars sarlavhasi */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Dars Mavzusi / Sarlavhasi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Masalan: React Hooks va Custom Hooks yaratish"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Video Havolasi (YouTube yoki MP4 URL) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newLessonVideoUrl}
                  onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... yoki to‘g‘ridan-to‘g‘ri link"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none font-mono"
                  required
                />
              </div>

              {/* Davomiyligi */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Davomiyligi (daqiqa)
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(e.target.value)}
                  placeholder="30"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Qisqacha tavsif */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Dars Haqida Qisqacha Tavsif / Konspekt
                </label>
                <textarea
                  value={newLessonDesc}
                  onChange={(e) => setNewLessonDesc(e.target.value)}
                  placeholder="Ushbu darsda nimalar o‘rganilishi haqida yozing..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                  {adminError}
                </div>
              )}

              {adminSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  {adminSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLesson}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  {isSubmittingLesson ? 'Yuklanmoqda...' : 'Darsni Yuklash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alohida darsni sotib olish modali */}
      {lessonToBuy && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Darsni Alohida Sotib Olish</h3>
                  <p className="text-[11px] text-slate-400">Tarif olmasdan darsni alohida oching</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setLessonToBuy(null);
                  setBuyErrorMsg(null);
                  setBuySuccessMsg(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dars ma'lumotlari */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {lessonToBuy.lessonNumber}-Dars
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock size={11} /> {lessonToBuy.durationMinutes} daqiqa
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                {lessonToBuy.title}
              </h4>
              {lessonToBuy.description && (
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {lessonToBuy.description}
                </p>
              )}
            </div>

            {buySuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{buySuccessMsg}</span>
              </div>
            )}

            {buyErrorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {buyErrorMsg}
              </div>
            )}

            {/* To'lov usullari */}
            <div className="space-y-2.5">
              {/* 1. Token orqali (5 token) */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Coins size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">5 Token bilan ochish</p>
                    <p className="text-[10px] text-slate-400">
                      Balans: <span className="text-amber-300 font-bold">{user.tokens ?? 10} token</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleBuyWithTokens}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
                >
                  Ochish
                </button>
              </div>

              {/* 2. So'm orqali (12,000 so'm) */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <CreditCard size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">12,000 so‘m</p>
                    <p className="text-[10px] text-slate-400">Click / Payme orqali bitta darsni faollashtirish</p>
                  </div>
                </div>
                <button
                  onClick={handleBuyWithPayment}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
                >
                  Sotib Olish
                </button>
              </div>

              {/* 3. Butun fan darslari (49,000 so'm) */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/40 hover:border-purple-500/40 transition-colors flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white">Butun fanni ochish</p>
                      <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-purple-500/30 text-purple-300 rounded">
                        TEJAMKOR
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">49,000 so‘m (Ushbu kursning barcha darslari)</p>
                  </div>
                </div>
                <button
                  onClick={handleBuyWholeCourse}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer shrink-0"
                >
                  Ochish
                </button>
              </div>
            </div>

            {/* VIP tarif havolasi */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                onClick={() => {
                  setLessonToBuy(null);
                  setUpgradeMessage(
                    `Barcha fanlar va darslarni to‘liq cheklovlarsiz ko‘rish uchun VIP tarifiga o‘ting.`
                  );
                  setShowUpgradeModal(true);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Crown size={13} />
                <span>Yoki VIP tarif olib butun platformadan cheksiz foydalaning</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP Tarifga O'tish Modali */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Crown size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">VIP Tarifga O‘tish</h3>
                  <p className="text-xs text-slate-400">Barcha video darslar va xizmatlar cheksiz ochiladi</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {upgradeMessage && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <Sparkles size={15} className="shrink-0 text-amber-400" />
                <span>{upgradeMessage}</span>
              </div>
            )}

            {/* Tarif kartalari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Premium */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                <div>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                    ⭐ PREMIUM
                  </span>
                  <h4 className="text-lg font-black text-white mt-1">29,000 so‘m</h4>
                  <p className="text-[10px] text-slate-400">1 oylik obuna</p>

                  <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <Check size={13} /> Barcha video darslar ochiq
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <Check size={13} /> Slaydlar va mustaqil ishlar
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <Check size={13} /> 150 ta kunlik so‘rov
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    user.plan = 'premium';
                    try {
                      const profile = localStorage.getItem('talaba_user_profile');
                      if (profile) {
                        const parsed = JSON.parse(profile);
                        parsed.plan = 'premium';
                        localStorage.setItem('talaba_user_profile', JSON.stringify(parsed));
                      }
                    } catch {}
                    setShowUpgradeModal(false);
                    alert('Tabriklaymiz! Siz muvaffaqiyatli PREMIUM tarifiga ulandingiz. Barcha darslar ochildi!');
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Premiumga Ulanish
                </button>
              </div>

              {/* Ultra VIP */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-purple-950/40 to-slate-950 border border-purple-500/40 flex flex-col justify-between space-y-3">
                <div>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-purple-500/20 text-purple-300 rounded border border-purple-500/40">
                    👑 ULTRA VIP
                  </span>
                  <h4 className="text-lg font-black text-white mt-1">49,000 so‘m</h4>
                  <p className="text-[10px] text-slate-400">Cheksiz muddat</p>

                  <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                    <li className="flex items-center gap-1.5 text-purple-300">
                      <Check size={13} /> Butun darslar va materiallar
                    </li>
                    <li className="flex items-center gap-1.5 text-purple-300">
                      <Check size={13} /> Cheksiz AI yordamchi
                    </li>
                    <li className="flex items-center gap-1.5 text-purple-300">
                      <Check size={13} /> Maxsus guruhlar va chatlar
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    user.plan = 'ultra';
                    try {
                      const profile = localStorage.getItem('talaba_user_profile');
                      if (profile) {
                        const parsed = JSON.parse(profile);
                        parsed.plan = 'ultra';
                        localStorage.setItem('talaba_user_profile', JSON.stringify(parsed));
                      }
                    } catch {}
                    setShowUpgradeModal(false);
                    alert('Tabriklaymiz! Siz muvaffaqiyatli ULTRA VIP tarifiga ulandingiz. Cheksiz imkoniyatlar ochildi!');
                  }}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Ultra VIP ga Ulanish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
