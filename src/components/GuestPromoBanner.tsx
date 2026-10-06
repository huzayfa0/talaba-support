'use client';

import React from 'react';
import {
  GraduationCap,
  Users,
  Radio,
  BookUser,
  Presentation,
  ArrowRight,
  Send,
  Lock,
  CheckCircle2,
  LogIn,
  UserPlus,
  Zap,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { NavTab } from '@/types';

interface GuestPromoBannerProps {
  activeTab: NavTab;
  onOpenLogin: () => void;
}

export default function GuestPromoBanner({
  activeTab,
  onOpenLogin,
}: GuestPromoBannerProps) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'darslar':
        return 'Online Video Darsliklar';
      case 'darsxona':
        return 'Jonli Darsxona (Live Stream)';
      case 'groups':
      case 'messenger':
        return 'O‘quv Guruhlari & Muloqot';
      case 'contacts':
        return 'Kontaktlar Kitobi';
      default:
        return 'Ta‘lim Bo‘limi';
    }
  };

  const features = [
    {
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-500',
      title: 'Online Video Darsliklar',
      badge: '5 ta Bepul',
      desc: 'Oliy ta‘lim va kasbiy fanlar (Frontend, Python, Kiberxavfsizlik, IELTS). Har bir fanning 5 ta darsi mutlaqo bepul!',
    },
    {
      icon: Radio,
      color: 'from-rose-500 to-red-600',
      title: 'Jonli Darsxona (Live Stream)',
      badge: 'Jonli Efir',
      desc: 'Ustozlar va talabalar uchun real-vaqtda interaktiv video darslar, ekran va kamera ulashish imkoniyati.',
    },
    {
      icon: Users,
      color: 'from-indigo-500 to-purple-500',
      title: 'Akademik Guruhlar va Chat',
      badge: 'Guruhlar',
      desc: 'O‘z akademik guruhingiz bilan xavfsiz chat, fayllar, konspektlar va topshiriqlarni tezkor almashish.',
    },
    {
      icon: BookUser,
      color: 'from-blue-500 to-cyan-500',
      title: 'Kontaktlar Kitobi',
      badge: 'Shaxsiy Chat',
      desc: 'Guruhdoshlar va o‘qituvchilar bilan shaxsiy muloqot, telefon raqamlari va manzillar ma‘lumotlar bazasi.',
    },
    {
      icon: Presentation,
      color: 'from-amber-500 to-orange-500',
      title: 'Gamma Slayd Generator',
      badge: 'AI',
      desc: 'Har qanday mavzuda 1 daqiqada zamonaviy, rang-barang va vizual taqdimotlarni avtomatik yaratish.',
    },
    {
      icon: FileText,
      color: 'from-pink-500 to-rose-500',
      title: 'Mustaqil Ish & Word (.docx)',
      badge: 'Word',
      desc: 'Oliy ta‘lim standartlari asosida referat, kurs ishi va mustaqil ishlarni to‘liq tayyorlab beruvchi AI.',
    },
  ];

  const steps = [
    {
      step: '1',
      title: 'Ro‘yxatdan o‘tish tugmasini bosing',
      desc: 'Saytning yuqori o‘ng burchagidagi «Kirish» yoki quyidagi «Bepul Ro‘yxatdan O‘tish» tugmasini bosing.',
    },
    {
      step: '2',
      title: 'Telefon raqamingizni kiriting',
      desc: '+998 bilan boshlanadigan shaxsiy mobil telefon raqamingizni kiritib, tasdiqlash kodini so‘rang.',
    },
    {
      step: '3',
      title: 'SMS yoki Telegram orqali tasdiqlang',
      desc: 'Telegram botimiz (@darsliklar_ai_bot) orqali yoki SMS tarzida yuborilgan 6 xonali tasdiqlash kodini yozing.',
    },
    {
      step: '4',
      title: 'Parolingizni o‘rnating va kiring!',
      desc: 'O‘zingiz uchun esda qolarli parol o‘rnating. Shaxsiy profilingiz darhol faollashadi va barcha bo‘limlar ochiladi.',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-in fade-in duration-300">
      {/* 1. ASOSIY REKLAMA VA HERO BANNER */}
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-10 shadow-2xl">
        {/* Orqa fon bezak nurlari */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold shadow-sm">
            <Lock size={14} className="text-amber-400" />
            <span>{getTabTitle()} bo‘limi — Akkountga kirish talab etiladi</span>
          </div>

          {/* Sarlavha */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Talaba<span className="text-indigo-400">AI</span> — O‘zbekiston Talabalari Uchun 1-Raqamli Ta‘lim Platformasi
          </h1>

          {/* Ta'rif */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Siz tanlagan <b>«{getTabTitle()}»</b> bo‘limidan foydalanish, guruhdoshlaringiz bilan yozishish va video darslarni tomosha qilish uchun 
            <span className="text-indigo-300 font-semibold"> shaxsiy hisobingizga kiring</span> yoki 1 daqiqada bepul ro‘yxatdan o‘ting!
          </p>

          {/* Asosiy tugmalar (CTA) */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto">
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <LogIn size={18} />
              <span>🚀 Bepul Ro‘yxatdan O‘tish / Kirish</span>
              <ArrowRight size={16} />
            </button>

            <a
              href="https://t.me/darsliklar_ai_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={16} className="text-sky-400" />
              <span>Telegram Bot Orqali Kirish</span>
            </a>
          </div>

          {/* Kichik ishonch belgisi */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" /> 100% Bepul ro‘yxatdan o‘tish
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap size={13} className="text-amber-400" /> 5 ta dars mutlaqo bepul
            </span>
          </div>
        </div>
      </div>

      {/* 2. REKLAMA & PLATFORMA IMKONIYoTLARI (FEATURES SHOWCASE) */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
            Nimalarga ega bo‘lasiz?
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            TalabaAI Platformasi Imkoniyatlari
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Ro‘yxatdan o‘tishingiz bilan quyidagi barcha imkoniyatlar siz uchun ochiladi:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all shadow-lg hover:shadow-indigo-500/10 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${f.color} p-0.5 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {f.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RO'YXATDAN O'TISHNI TUSHUNTIRISH (QANDAY QILIB RO'YXATDAN O'TILADI?) */}
      <div className="rounded-[32px] bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <HelpCircle size={18} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Saytdan Qanday Ro‘yxatdan O‘tiladi?
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Atigi 4 ta oddiy qadam bilan 1 daqiqa ichida hisobingizni oching:
            </p>
          </div>

          <button
            onClick={onOpenLogin}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <UserPlus size={15} />
            <span>Hozir Ro‘yxatdan O‘tish</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 relative"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                {s.step}
              </div>
              <h4 className="text-xs font-bold text-white leading-snug">
                {s.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PASTKI CHAQIRUV BLOKI (BOTTOM CALLOUT) */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left shadow-xl">
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-white">
            Talabalik yillaringizni TalabaAI bilan osonlashtiring!
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Minglab talabalar darslarni o‘rganish, slaydlar va mustaqil ishlarni tayyorlash uchun har kuni ushbu platformadan foydalanmoqda.
          </p>
        </div>

        <button
          onClick={onOpenLogin}
          className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <LogIn size={16} />
          <span>Kirish / Ro‘yxatdan O‘tish</span>
        </button>
      </div>
    </div>
  );
}
