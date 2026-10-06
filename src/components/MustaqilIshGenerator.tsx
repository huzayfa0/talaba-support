'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Printer,
  Check,
  GraduationCap,
  RotateCcw,
  BookMarked,
  FileText,
  Lock,
  Crown,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  MustaqilIshMeta,
  MustaqilIshProject,
  UserProfile,
} from '@/types';
import { generateMustaqilIshContent } from '@/lib/ai-service';
import { generateDocxBlob, downloadBlob } from '@/lib/docx-generator';

const PRESETS = [
  {
    subject: "Iqtisodiyot nazariyasi",
    topic: "Raqamli iqtisodiyot va uning O'zbekiston taraqqiyotidagi o'rni",
  },
  {
    subject: "Axborot texnologiyalari",
    topic: "Sun'iy intellekt va neyron tarmoqlarning amaliy sohalarda qo'llanilishi",
  },
  {
    subject: "Kiberxavfsizlik",
    topic: "Zamonaviy axborot tizimlarida kiberxavfsizlik tahdidlari va ularni bartaraf etish",
  },
  {
    subject: "Pedagogika va Psixologiya",
    topic: "Ta'lim jarayonida interaktiv metodlar va zamonaviy pedagogik texnologiyalar",
  },
  {
    subject: "Ekologiya va Tabiatni muhofaza qilish",
    topic: "O'zbekistonda yashil energetika va qayta tiklanuvchi energiya manbalari",
  },
];

interface Props {
  user: UserProfile;
  existingProjectsCount?: number;
  onSaveProject: (project: MustaqilIshProject) => void;
}

export default function MustaqilIshGenerator({ user, existingProjectsCount = 0, onSaveProject }: Props) {
  const isFreePlan = !user?.plan || user.plan === 'free';
  const isUltraPlan = user?.plan === 'ultra';
  const isPremiumPlan = user?.plan === 'premium';
  const hasReachedFreeLimit = isFreePlan && existingProjectsCount >= 2;

  const [meta, setMeta] = useState<MustaqilIshMeta>({
    university: user.university || "O'zbekiston Milliy Universiteti",
    faculty: user.faculty || "Axborot texnologiyalari",
    department: "Dasturiy injiniring",
    group: user.group || "304-guruh",
    studentName: user.name || "Abdullayev Sardor",
    teacherName: "dots. prof. Rahmatov A.A.",
    subject: "Axborot xavfsizligi",
    topic: "Sun'iy intellekt tizimlarida ma'lumotlarni himoyalash mexanizmlari",
    city: "Toshkent",
    year: "2026",
    language: 'uz',
    chapterCount: 3,
    pageCount: 10,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [project, setProject] = useState<MustaqilIshProject | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // User ma'lumotlari o'zgarganda yangilash
  useEffect(() => {
    if (user.isLoggedIn) {
      setMeta((prev) => ({
        ...prev,
        university: user.university || prev.university,
        faculty: user.faculty || prev.faculty,
        group: user.group || prev.group,
        studentName: user.name || prev.studentName,
      }));
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!meta.topic.trim()) return;

    setIsLoading(true);
    setLoadingStep("Standart talablari bo‘yicha titul va mundarija shakllantirilmoqda...");

    try {
      const generated = await generateMustaqilIshContent(meta);
      setProject(generated);
      onSaveProject(generated);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
      alert("Mustaqil ish yaratishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!project) return;
    setIsExporting(true);
    try {
      const blob = await generateDocxBlob(project);
      const safeName = `${project.meta.topic.replace(/[^a-zA-Z0-9\u0400-\u04FF_-]/g, '_').substring(0, 30)}_Mustaqil_ish.docx`;
      downloadBlob(blob, safeName);
    } catch (e) {
      console.error(e);
      alert("Word faylini yaratishda xatolik yuz berdi.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyAll = () => {
    if (!project) return;
    const allText = `
MUNDARIJA:
${project.mundarija.join('\n')}

KIRISH:
${project.kirish}

${project.boblar.map((b) => `${b.title}\n\n${b.content}`).join('\n\n')}

XULOSA:
${project.xulosa}

FOYDALANILGAN ADABIYOTLAR:
${project.adabiyotlar.join('\n')}
    `.trim();

    navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full px-0 py-2 sm:py-2.5 space-y-4">
      {/* Sarlavha Banner */}
      <div className="text-center max-w-4xl mx-auto space-y-2 sm:space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <BookMarked size={14} />
          <span>O‘zbekiston OTMlari standarti (GOST / Talaba andozasi)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Professional <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">"Mustaqil ish"</span> generatori
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
          Titul varaqasi, mundarija, kirish, boblar, xulosa va adabiyotlar ro‘yxati bilan to‘liq Word (.docx) hujjat yarating.
        </p>
      </div>

      {!project ? (
        /* FORMA QISMI */
        <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto space-y-6">
          {/* Tayyor shablonlar */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 block mb-2.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" /> Tezkor talabgir mavzular:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setMeta((prev) => ({
                      ...prev,
                      subject: p.subject,
                      topic: p.topic,
                    }))
                  }
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                >
                  {p.topic.length > 45 ? `${p.topic.substring(0, 45)}...` : p.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Asosiy Forma */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <GraduationCap className="text-indigo-400" size={20} />
              Titul va Hujjat Ma'lumotlari
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* OTM Nomi */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Universitet / Institut nomi (OTM)
                </label>
                <input
                  type="text"
                  value={meta.university}
                  onChange={(e) => setMeta({ ...meta, university: e.target.value })}
                  placeholder="Masalan: Toshkent Davlat Iqtisodiyot Universiteti"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Fakultet */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fakultet</label>
                <input
                  type="text"
                  value={meta.faculty}
                  onChange={(e) => setMeta({ ...meta, faculty: e.target.value })}
                  placeholder="Masalan: Iqtisodiyot fakulteti"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Kafedra */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kafedra</label>
                <input
                  type="text"
                  value={meta.department}
                  onChange={(e) => setMeta({ ...meta, department: e.target.value })}
                  placeholder="Masalan: Moliya va bank ishi kafedrasi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Fan Nomi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fan nomi</label>
                <input
                  type="text"
                  value={meta.subject}
                  onChange={(e) => setMeta({ ...meta, subject: e.target.value })}
                  placeholder="Masalan: Makroiqtisodiyot"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Guruh */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Guruh</label>
                <input
                  type="text"
                  value={meta.group}
                  onChange={(e) => setMeta({ ...meta, group: e.target.value })}
                  placeholder="Masalan: 412-guruh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Talaba F.I.Sh */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Talaba F.I.Sh. (Bajardi)
                </label>
                <input
                  type="text"
                  value={meta.studentName}
                  onChange={(e) => setMeta({ ...meta, studentName: e.target.value })}
                  placeholder="Masalan: Yo‘ldoshev Jasur Shavkatovich"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Rahbar / O'qituvchi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ilmiy rahbar / O‘qituvchi (Qabul qildi)
                </label>
                <input
                  type="text"
                  value={meta.teacherName}
                  onChange={(e) => setMeta({ ...meta, teacherName: e.target.value })}
                  placeholder="Masalan: dots. prof. Sobirov K.M."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Mavzu */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mustaqil ish mavzusi:
                </label>
                <textarea
                  rows={2}
                  value={meta.topic}
                  onChange={(e) => setMeta({ ...meta, topic: e.target.value })}
                  placeholder="Masalan: Yangi O'zbekiston taraqqiyotida yoshlar siyosati va innovatsion faoliyat..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* VARAQLAR (LISTLAR) SONI TANLASH */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/30 space-y-4 shadow-inner">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText size={18} className="text-indigo-400" />
                    Varaqlar / Sahifalar soni (List):
                  </label>
                  <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-3.5 py-1.5 rounded-xl border border-indigo-500/30">
                    {meta.pageCount || 10} varaq (list)
                  </span>
                </div>

                {/* Tezkor preset tugmalar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { count: 5, label: "5 list", desc: "Qisqa referat", requiresPremium: false },
                    { count: 10, label: "10 list", desc: "Standart mustaqil ish", requiresPremium: false },
                    { count: 15, label: "15 list", desc: "Kengaytirilgan ish", requiresPremium: true },
                    { count: 20, label: "20 list", desc: "Kurs ishi hajmi", requiresPremium: true },
                    { count: 25, label: "25 list", desc: "Katta ilmiy tadqiqot", requiresPremium: true },
                  ].map((preset) => {
                    const isSelected = (meta.pageCount || 10) === preset.count;
                    const isLocked = isFreePlan && preset.requiresPremium;
                    return (
                      <button
                        key={preset.count}
                        type="button"
                        onClick={() => {
                          if (!isLocked) {
                            setMeta((prev) => ({ ...prev, pageCount: preset.count }));
                          }
                        }}
                        className={`p-3 rounded-xl text-left border transition-all relative ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/20'
                            : isLocked
                            ? 'bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                            : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{preset.label}</span>
                          {isLocked && <Lock size={12} className="text-amber-400" />}
                        </div>
                        <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-indigo-100' : isLocked ? 'text-amber-400/80 font-medium' : 'text-slate-500'}`}>
                          {isLocked ? 'Premium kerak' : preset.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Slider va qo'lda tanlash */}
                <div className="pt-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={5}
                      max={30}
                      step={1}
                      value={meta.pageCount || 10}
                      onChange={(e) => setMeta((prev) => ({ ...prev, pageCount: Number(e.target.value) }))}
                      className="flex-1 accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <input
                        type="number"
                        min={5}
                        max={35}
                        value={meta.pageCount || 10}
                        onChange={(e) => {
                          const val = Math.max(5, Math.min(35, Number(e.target.value) || 5));
                          setMeta((prev) => ({ ...prev, pageCount: val }));
                        }}
                        className="w-12 bg-transparent text-center text-xs font-bold text-white focus:outline-none"
                      />
                      <span className="text-xs text-slate-400">varaq</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 px-1 font-medium">
                    <span>5 list (Referat)</span>
                    <span>10 list (Standart)</span>
                    <span>15 list (Katta)</span>
                    <span>20-30 list (Kurs ishi)</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">ℹ️</span>
                  <span>
                    <strong>Hajmga moslashtirish:</strong> AI kiritilgan <strong>{meta.pageCount || 10} list</strong> bo‘yicha Kirish, Boblar (fasllariga bo‘lingan holda), Xulosa va Adabiyotlar hajmini Word standarti (Times New Roman 14pt, 1.5 qator oralig‘i) bo‘yicha aynan shuncha varaqni to‘ldirishga moslab yozadi.
                  </span>
                </div>
              </div>

              {/* Boblar soni & Shahar */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Boblar soni</label>
                <select
                  value={meta.chapterCount}
                  onChange={(e) => setMeta({ ...meta, chapterCount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value={2}>2 ta Bob (Qisqa mustaqil ish)</option>
                  <option value={3}>3 ta Bob (Standart kurs ishi / mustaqil ish)</option>
                  <option value={4}>4 ta Bob (Katta ilmiy ish)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Shahar</label>
                  <input
                    type="text"
                    value={meta.city}
                    onChange={(e) => setMeta({ ...meta, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Yil</label>
                  <input
                    type="text"
                    value={meta.year}
                    onChange={(e) => setMeta({ ...meta, year: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Free Limit Warning */}
            {hasReachedFreeLimit && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5 mb-2 mt-4">
                <Lock size={16} className="text-amber-400 shrink-0" />
                <span>
                  <strong>Oddiy (Free) limit:</strong> Siz allaqachon 2 ta bepul mustaqil ishingizdan foydalandingiz. Yangi mustaqil ishlar yaratish uchun <strong>Premium</strong> yoki <strong>Ultra VIP</strong> tarifiga o‘ting.
                </span>
              </div>
            )}

            {/* Submit button */}
            <div className="pt-2">
              <button
                disabled={isLoading || !meta.topic.trim() || hasReachedFreeLimit}
                onClick={handleGenerate}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{loadingStep}</span>
                  </div>
                ) : hasReachedFreeLimit ? (
                  <span>🔒 Bepul 2 ta mustaqil ish limiti tugagan</span>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Mustaqil Ishni Generatsiya Qilish ➔</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* NATIJA VA JONLI HUJJAT PREVIEW */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-md sticky top-20 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setProject(null)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} /> Yangi mustaqil ish yozish
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 font-semibold">
                <FileText size={14} className="text-indigo-400" />
                <span>Hajmi: {project.meta.pageCount || 10} varaq (list) • Times New Roman 14pt, 1.5</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                disabled={isExporting}
                onClick={handleDownloadDocx}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                <span>Word (.docx) yuklab olish</span>
              </button>

              <button
                onClick={handleCopyAll}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copied ? 'Nusxalandi!' : 'Nusxa olish'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Chop etish / PDF sifatida saqlash"
              >
                <Printer size={16} />
              </button>
            </div>
          </div>

          {/* HAQIQIY A4 VARAQ SIMULYATSIYASI (Document Viewer) */}
          <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-16 space-y-12 font-serif text-[15px] leading-relaxed border border-slate-300 select-text">
            {/* 1. TITUL SAHIFASI */}
            <div className="min-h-[750px] flex flex-col justify-between text-center border-b-2 border-dashed border-slate-300 pb-12">
              <div className="space-y-1.5">
                <p className="font-bold text-xs uppercase tracking-wide">O‘zbekiston Respublikasi</p>
                <p className="font-bold text-xs uppercase tracking-wide">
                  Oliy ta’lim, fan va innovatsiyalar vazirligi
                </p>
                <p className="font-bold text-sm uppercase mt-4">{project.meta.university}</p>
                <p className="italic text-xs text-slate-600">
                  {project.meta.faculty} fakulteti, "{project.meta.department}" kafedrasi
                </p>
              </div>

              <div className="my-12 space-y-4">
                <h2 className="text-3xl font-black tracking-wider uppercase text-slate-900">
                  MUSTAQIL ISH
                </h2>
                <p className="text-sm">
                  Fan: <span className="font-bold">{project.meta.subject}</span>
                </p>
                <p className="text-lg font-bold text-slate-900 max-w-xl mx-auto px-4">
                  "{project.meta.topic}"
                </p>
              </div>

              <div className="flex justify-between items-end text-left text-xs px-8">
                <div />
                <div className="space-y-4 text-right">
                  <div>
                    <p className="font-bold">Bajardi:</p>
                    <p>{project.meta.group} talabasi</p>
                    <p className="font-bold">{project.meta.studentName}</p>
                  </div>
                  <div>
                    <p className="font-bold">Qabul qildi:</p>
                    <p className="font-bold">{project.meta.teacherName}</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs font-semibold text-slate-600 pt-8">
                {project.meta.city} - {project.meta.year}
              </div>
            </div>

            {/* 2. MUNDARIJA */}
            <div className="space-y-4 border-b-2 border-dashed border-slate-300 pb-12">
              <h3 className="text-center font-bold text-lg uppercase tracking-wide">MUNDARIJA</h3>
              <div className="space-y-2 max-w-2xl mx-auto text-sm">
                {project.mundarija.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-dotted border-slate-400 pb-1">
                    <span>{item}</span>
                    <span className="font-mono text-slate-500">{idx + 2}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. KIRISH */}
            <div className="space-y-4 border-b-2 border-dashed border-slate-300 pb-12">
              <h3 className="text-center font-bold text-lg uppercase tracking-wide">KIRISH</h3>
              {project.kirish.split('\n\n').map((par, i) => (
                <p key={i} className="text-justify indent-8 leading-relaxed">
                  {par}
                </p>
              ))}
            </div>

            {/* 4. BOBLAR */}
            {project.boblar.map((bob, bIdx) => (
              <div key={bIdx} className="space-y-5 border-b-2 border-dashed border-slate-300 pb-12">
                <h3 className="text-center font-bold text-base uppercase tracking-wide text-slate-900">
                  {bob.title}
                </h3>
                {bob.subsections && bob.subsections.length > 0 ? (
                  bob.subsections.map((sub, sIdx) => (
                    <div key={sIdx} className="space-y-3 pt-2">
                      <h4 className="font-bold text-[15px] text-slate-800 indent-8">
                        {sub.title}
                      </h4>
                      {sub.content.split('\n\n').map((par, pIdx) => (
                        <p key={pIdx} className="text-justify indent-8 leading-relaxed">
                          {par}
                        </p>
                      ))}
                    </div>
                  ))
                ) : (
                  bob.content.split('\n\n').map((par, pIdx) => (
                    <p key={pIdx} className="text-justify indent-8 leading-relaxed">
                      {par}
                    </p>
                  ))
                )}
              </div>
            ))}

            {/* 5. XULOSA */}
            <div className="space-y-4 border-b-2 border-dashed border-slate-300 pb-12">
              <h3 className="text-center font-bold text-lg uppercase tracking-wide">XULOSA</h3>
              {project.xulosa.split('\n\n').map((par, i) => (
                <p key={i} className="text-justify indent-8 leading-relaxed">
                  {par}
                </p>
              ))}
            </div>

            {/* 6. ADABIYOTLAR */}
            <div className="space-y-4">
              <h3 className="text-center font-bold text-lg uppercase tracking-wide">
                FOYDALANILGAN ADABIYOTLAR RO‘YXATI
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {project.adabiyotlar.map((ad, idx) => (
                  <li key={idx} className="text-justify leading-relaxed">
                    {ad.replace(/^\d+[\.\)]\s*/, '')}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
