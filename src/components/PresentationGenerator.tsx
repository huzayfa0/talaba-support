'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Play,
  RotateCcw,
  Check,
  Copy,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Layers,
  Edit3,
  Image as ImageIcon,
  RefreshCw,
  X,
  Lock,
  Crown,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Language,
  PresentationProject,
  PresentationStyle,
  SlideItem,
  UserProfile,
} from '@/types';
import {
  generatePresentationOutline,
  generateFullPresentation,
} from '@/lib/ai-service';
import { exportToPptx } from '@/lib/pptx-generator';
import { resolveSlideImage } from '@/lib/image-service';

const STYLES: { id: PresentationStyle; name: string; bg: string; border: string; accent: string }[] = [
  { id: 'modern-dark', name: 'Gamma Dark', bg: 'bg-slate-950', border: 'border-indigo-500/40', accent: 'text-indigo-400' },
  { id: 'academic-blue', name: 'Akademik Moviy', bg: 'bg-slate-900', border: 'border-sky-500/40', accent: 'text-sky-400' },
  { id: 'minimal-light', name: 'Minimal Oq', bg: 'bg-slate-100', border: 'border-slate-300', accent: 'text-blue-600' },
  { id: 'emerald-green', name: 'Zilol Zumrad', bg: 'bg-emerald-950', border: 'border-emerald-500/40', accent: 'text-emerald-400' },
  { id: 'creative-purple', name: 'Ijodiy Binafsha', bg: 'bg-purple-950', border: 'border-purple-500/40', accent: 'text-purple-400' },
];

const PROMPT_SUGGESTIONS = [
  "Sun'iy intellekt va robototexnika istiqbollari",
  "Kiberxavfsizlik asoslari va tarmoq xavfsizligi",
  "Iqtisodiyotda raqamli transformatsiya",
  "O'zbekistonda yashil energetika va quyosh panellari",
  "Kvant kompyuterlari: kelajak hisoblash texnologiyasi",
  "Zamonaviy startaplar va venchur moliyalashtirish",
];

interface Props {
  user?: UserProfile;
  existingProjectsCount?: number;
  onSaveProject: (project: PresentationProject) => void;
}

export default function PresentationGenerator({ user, existingProjectsCount = 0, onSaveProject }: Props) {
  const isFreePlan = !user?.plan || user.plan === 'free';
  const isUltraPlan = user?.plan === 'ultra';
  const isPremiumPlan = user?.plan === 'premium';
  const hasReachedFreeLimit = isFreePlan && existingProjectsCount >= 2;

  // Step: 1 = input, 2 = outline, 3 = slides view
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(isFreePlan ? 2 : 10);
  const [language, setLanguage] = useState<Language>('uz');
  const [selectedStyle, setSelectedStyle] = useState<PresentationStyle>('modern-dark');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Outline
  const [outline, setOutline] = useState<string[]>([]);
  const [newSlideTitle, setNewSlideTitle] = useState('');

  // Presentation Project
  const [project, setProject] = useState<PresentationProject | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Fullscreen presentation modal
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Rasmni almashtirish holati
  const [editingImageSlideIdx, setEditingImageSlideIdx] = useState<number | null>(null);
  const [imageSearchKeyword, setImageSearchKeyword] = useState('');
  const [isSearchingImage, setIsSearchingImage] = useState(false);

  const handleSearchAndReplaceImage = async (slideIndex: number) => {
    if (!imageSearchKeyword.trim()) return;
    setIsSearchingImage(true);
    try {
      let newImg: string | null = null;
      if (imageSearchKeyword.startsWith('http://') || imageSearchKeyword.startsWith('https://')) {
        newImg = imageSearchKeyword.trim();
      } else {
        newImg = await resolveSlideImage(project?.topic || '', imageSearchKeyword, imageSearchKeyword, slideIndex);
      }
      if (newImg) {
        handleUpdateSlideContent(slideIndex, 'imageUrl', newImg);
        handleUpdateSlideContent(slideIndex, 'imageKeywords', imageSearchKeyword);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingImage(false);
      setEditingImageSlideIdx(null);
      setImageSearchKeyword('');
    }
  };

  // 1. Rejani generatsiya qilish
  const handleGenerateOutline = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setLoadingText("Sun'iy intellekt slaydlar rejasini shakllantirmoqda...");

    try {
      const generatedOutline = await generatePresentationOutline(topic, slideCount, language);
      setOutline(generatedOutline);
      setStep(2);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Rejani tahrirlash amallari
  const handleUpdateOutlineItem = (index: number, val: string) => {
    const updated = [...outline];
    updated[index] = val;
    setOutline(updated);
  };

  const handleDeleteOutlineItem = (index: number) => {
    if (outline.length <= 3) return;
    setOutline(outline.filter((_, i) => i !== index));
  };

  const handleAddSlideToOutline = () => {
    if (!newSlideTitle.trim()) return;
    setOutline([...outline, newSlideTitle.trim()]);
    setNewSlideTitle('');
  };

  // 2. To'liq Gamma taqdimotini yaratish
  const handleBuildPresentation = async () => {
    if (outline.length === 0) return;

    setIsLoading(true);
    setLoadingText("Gamma uslubidagi slaydlar, vizual bloklar va matnlar generatsiya qilinmoqda...");

    try {
      const pres = await generateFullPresentation(topic, outline, selectedStyle, language);
      setProject(pres);
      setStep(3);
      onSaveProject(pres);

      // Bayramona confetti effekti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // PowerPoint (.pptx) yuklab olish
  const handleExportPptx = async () => {
    if (!project) return;
    setIsExporting(true);
    try {
      await exportToPptx(project);
    } catch (e) {
      console.error("PPTX eksport xatosi:", e);
      alert("PowerPoint faylini yaratishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsExporting(false);
    }
  };

  // Matnlarni nusxalash
  const handleCopyText = () => {
    if (!project) return;
    const text = project.slides
      .map((s, i) => `--- SLAYD ${i + 1}: ${s.title} ---\n${s.bullets.join('\n')}\n${s.highlight ? `Izoh: ${s.highlight}` : ''}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Slayd matnini to'g'ridan-to'g'ri tahrirlash
  const handleUpdateSlideContent = (slideIndex: number, field: keyof SlideItem, value: SlideItem[keyof SlideItem]) => {
    if (!project) return;
    const updatedSlides = [...project.slides];
    updatedSlides[slideIndex] = {
      ...updatedSlides[slideIndex],
      [field]: value,
    };
    const updatedProject = { ...project, slides: updatedSlides };
    setProject(updatedProject);
    onSaveProject(updatedProject);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* BOSQICH 1: MAVZU VA SOZLAMALAR */}
      {step === 1 && (
        <div className="space-y-5 sm:space-y-7 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="text-center max-w-4xl mx-auto space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Gamma.app muqobili — Sun'iy intellekt taqdimot generatori</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Mavzuni yozing, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AI slaydlar</span> tayyorlab beradi
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
              Bir necha soniyada to‘liq reja, professional matnlar, faktlar va PowerPoint (.pptx) formatida tayyor taqdimot oling.
            </p>
          </div>

          {/* Form Card (Ekran razmeriga avtomatik moslashuvchi moslashuvchan karta) */}
          <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start relative">
              {/* Chap ustun: Mavzu va Dizayn uslubi */}
              <div className="lg:col-span-7 space-y-4">
                {/* Mavzu Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-200 mb-2">
                    Taqdimot mavzusi yoki asosiy g‘oya:
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Masalan: Sun'iy intellektning tibbiyot va sog'liqni saqlashdagi istiqbollari..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-inner"
                    />
                    {topic && (
                      <button
                        onClick={() => setTopic('')}
                        className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded-md bg-slate-800 transition-colors"
                      >
                        Tozalash
                      </button>
                    )}
                  </div>

                  {/* Suggestions */}
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Sparkles size={12} /> Takliflar:
                    </span>
                    {PROMPT_SUGGESTIONS.slice(0, 4).map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => setTopic(sug)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors truncate max-w-[280px]"
                        title={sug}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dizayn Uslubi (Gamma Themes) */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Palette size={14} className="text-purple-400" /> Dizayn uslubi (Gamma mavzulari):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {STYLES.map((st) => {
                      const isSelected = selectedStyle === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setSelectedStyle(st.id)}
                          className={`p-2.5 rounded-2xl text-left border transition-all ${st.bg} ${
                            isSelected
                              ? `${st.border} ring-2 ring-indigo-500/50 scale-[1.02] shadow-lg`
                              : 'border-slate-800 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[11px] font-bold ${st.accent}`}>{st.name}</span>
                            {isSelected && <Check size={13} className="text-white" />}
                          </div>
                          <div className="h-1.5 w-10 rounded-full bg-slate-700/60" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* O'ng ustun: Slaydlar soni, Til va Tugma */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-3.5">
                  {/* Slaydlar soni */}
                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Layers size={14} className="text-indigo-400" /> Slaydlar soni
                      </span>
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {slideCount} ta slayd
                      </span>
                    </div>
                    {isFreePlan ? (
                      <div className="py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                        <span className="font-semibold text-xs">Oddiy (Free) tarif: 2 ta slayd</span>
                        <span className="text-[10px] text-amber-400/80">Premium: 15 tagacha</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="range"
                          min={5}
                          max={isUltraPlan ? 25 : 15}
                          value={slideCount}
                          onChange={(e) => setSlideCount(Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-medium">
                          <span>5 (Tezkor)</span>
                          <span>{isUltraPlan ? '15 (Standart)' : '10 (Standart)'}</span>
                          <span>{isUltraPlan ? '25 (Ultra VIP)' : '15 (Premium)'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Til tanlash */}
                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                    <span className="block text-xs font-semibold text-slate-300 mb-2">
                      Taqdimot tili:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'uz' as const, label: "O'zbek" },
                        { id: 'ru' as const, label: 'Русский' },
                        { id: 'en' as const, label: 'English' },
                      ].map((l) => (
                        <button
                          key={l.id}
                          onClick={() => setLanguage(l.id)}
                          className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                            language === l.id
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Free Limit Warning & Submit Button */}
                <div className="space-y-2.5 pt-1">
                  {hasReachedFreeLimit && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <Lock size={15} className="text-amber-400 shrink-0" />
                      <span className="text-[11px] leading-tight">
                        <strong>Oddiy limit:</strong> 2 ta bepul taqdimot ishlatildi. Yangi taqdimotlar uchun tarifni oshiring.
                      </span>
                    </div>
                  )}

                  <button
                    disabled={!topic.trim() || isLoading || hasReachedFreeLimit}
                    onClick={handleGenerateOutline}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{loadingText}</span>
                      </div>
                    ) : hasReachedFreeLimit ? (
                      <span>🔒 Bepul 2 ta taqdimot limiti tugagan</span>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Reja va slaydlarni yaratish ➔</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOSQICH 2: REJANI (OUTLINE) TAHRIRLASH */}
      {step === 2 && (
        <div className="w-full max-w-4xl lg:max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} /> Mavzuni o‘zgartirish
            </button>
            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              2-Bosqich: Slaydlar rejasi
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Taqdimot rejasini tasdiqlang</h2>
              <p className="text-xs text-slate-400">
                AI tuzib bergan slaydlarni o‘zgartirishingiz, yangi slayd qo‘shishingiz yoki o‘chirishingiz mumkin.
              </p>
            </div>

            {/* Slaydlar ro'yxati */}
            <div className="space-y-2.5">
              {outline.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors group"
                >
                  <span className="w-7 h-7 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateOutlineItem(idx, e.target.value)}
                    className="flex-1 bg-transparent border-0 text-sm text-white focus:outline-none focus:ring-0 font-medium"
                  />
                  <button
                    onClick={() => handleDeleteOutlineItem(idx)}
                    title="Slaydni o'chirish"
                    className="p-1.5 text-slate-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Yangi slayd qo'shish */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSlideTitle}
                onChange={(e) => setNewSlideTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSlideToOutline()}
                placeholder="Yangi slayd sarlavhasi..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddSlideToOutline}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus size={16} /> Qo‘shish
              </button>
            </div>

            {/* Harakat tugmasi */}
            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
              >
                Ortga
              </button>
              <button
                disabled={isLoading || outline.length === 0}
                onClick={handleBuildPresentation}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{loadingText}</span>
                  </div>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Gamma Slaydlarni Yaratish ({outline.length} ta slayd) ✨</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOSQICH 3: GAMMA USLUBIDAGI SLAYD KO'RINISHI */}
      {step === 3 && project && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-md sticky top-20 z-30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(2)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} /> Rejaga qaytish
              </button>
              <div className="h-6 w-px bg-slate-800 hidden sm:block" />
              <span className="text-xs font-semibold text-slate-300 hidden md:block max-w-[280px] truncate">
                {project.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Fullscreen presentation */}
              <button
                onClick={() => {
                  setActiveSlideIndex(0);
                  setIsFullscreen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <Play size={14} className="fill-indigo-300" />
                <span>Namoyish (Present)</span>
              </button>

              {/* PowerPoint download */}
              <button
                disabled={isExporting}
                onClick={handleExportPptx}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>PowerPoint (.pptx)</span>
              </button>

              {/* Copy text */}
              <button
                onClick={handleCopyText}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Barcha slayd matnlarini nusxalash"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Gamma Stream of Slides */}
          <div className="space-y-6">
            {project.slides.map((slide, idx) => {
              const isFirst = idx === 0;

              return (
                <div
                  key={slide.id}
                  className="group relative bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl transition-all hover:border-indigo-500/40"
                >
                  {/* Slayd raqami belgisi */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 tracking-wider">
                      SLAYD {String(idx + 1).padStart(2, '0')} / {String(project.slides.length).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit3 size={12} /> Matn ustiga bosib tahrirlang
                    </span>
                  </div>

                  {isFirst ? (
                    /* 1-Slayd: Gamma Hero Slaydi */
                    <div className="py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      <div className="lg:col-span-8 space-y-4">
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleUpdateSlideContent(idx, 'title', e.target.value)}
                          className="w-full text-2xl md:text-4xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          onChange={(e) => handleUpdateSlideContent(idx, 'subtitle', e.target.value)}
                          placeholder="Qo'shimcha izoh..."
                          className="w-full text-base md:text-xl text-slate-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
                        />

                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {slide.bullets.map((b, bIdx) => (
                            <div
                              key={bIdx}
                              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300"
                            >
                              <span className="block text-indigo-400 font-bold mb-1">0{bIdx + 1}.</span>
                              <textarea
                                rows={2}
                                value={b}
                                onChange={(e) => {
                                  const newBullets = [...slide.bullets];
                                  newBullets[bIdx] = e.target.value;
                                  handleUpdateSlideContent(idx, 'bullets', newBullets);
                                }}
                                className="w-full bg-transparent border-0 p-0 text-slate-300 text-xs focus:outline-none resize-none"
                              />
                            </div>
                          ))}
                        </div>

                        {slide.highlight && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs flex items-center gap-3">
                            <Sparkles size={18} className="text-indigo-400 shrink-0" />
                            <input
                              type="text"
                              value={slide.highlight}
                              onChange={(e) => handleUpdateSlideContent(idx, 'highlight', e.target.value)}
                              className="w-full bg-transparent border-0 p-0 text-indigo-200 text-xs font-medium focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* Hero Image Card */}
                      <div className="lg:col-span-4 relative group/heroimg">
                        {slide.imageUrl ? (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={slide.imageUrl}
                              alt={slide.title}
                              className="w-full h-56 sm:h-64 object-cover group-hover/heroimg:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3.5">
                              <span className="text-[11px] font-semibold text-slate-200 truncate">
                                {slide.imageKeywords || "Mavzuga oid ilmiy rasm"}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingImageSlideIdx(idx);
                                  setImageSearchKeyword(slide.imageKeywords || '');
                                }}
                                className="mt-2 self-start px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-sm transition-all shadow"
                              >
                                <ImageIcon size={12} /> Rasmni almashtirish
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-56 rounded-2xl border border-dashed border-slate-700 flex flex-col items-center justify-center p-4 text-center">
                            <ImageIcon size={28} className="text-slate-600 mb-2" />
                            <button
                              onClick={() => {
                                setEditingImageSlideIdx(idx);
                                setImageSearchKeyword(slide.title);
                              }}
                              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                            >
                              + Rasm qo‘shish
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Kontent Slaydlari */
                    <div className="space-y-6">
                      {/* Sarlavha */}
                      <div>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleUpdateSlideContent(idx, 'title', e.target.value)}
                          className="w-full text-xl md:text-2xl font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                        {slide.subtitle && (
                          <input
                            type="text"
                            value={slide.subtitle}
                            onChange={(e) => handleUpdateSlideContent(idx, 'subtitle', e.target.value)}
                            className="w-full text-xs text-slate-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors mt-1"
                          />
                        )}
                      </div>

                      {/* Asosiy bloklar */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Bullets (Chap taraf) */}
                        <div className="lg:col-span-7 space-y-3">
                          {slide.bullets.map((bullet, bIdx) => (
                            <div
                              key={bIdx}
                              className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                            >
                              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                              <textarea
                                rows={2}
                                value={bullet}
                                onChange={(e) => {
                                  const newBullets = [...slide.bullets];
                                  newBullets[bIdx] = e.target.value;
                                  handleUpdateSlideContent(idx, 'bullets', newBullets);
                                }}
                                className="w-full bg-transparent border-0 p-0 text-sm text-slate-300 focus:outline-none resize-none"
                              />
                            </div>
                          ))}

                          {slide.highlight && (
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                              <span className="text-[10px] font-bold text-amber-400 tracking-wider block mb-1">
                                💡 MUHIM XULOSA
                              </span>
                              <textarea
                                rows={2}
                                value={slide.highlight}
                                onChange={(e) => handleUpdateSlideContent(idx, 'highlight', e.target.value)}
                                className="w-full bg-transparent border-0 p-0 text-xs italic text-slate-300 focus:outline-none resize-none"
                              />
                            </div>
                          )}
                        </div>

                        {/* O'ng tarafdagi Rasm va Stat karta */}
                        <div className="lg:col-span-5 space-y-3">
                          {slide.imageUrl ? (
                            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl group/img">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={slide.imageUrl}
                                alt={slide.title}
                                className="w-full h-48 sm:h-52 object-cover group-hover/img:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[200px]">
                                    {slide.imageKeywords || slide.title}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingImageSlideIdx(idx);
                                      setImageSearchKeyword(slide.imageKeywords || slide.title);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm transition-all shrink-0"
                                  >
                                    <ImageIcon size={11} /> Almashtirish
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-44 rounded-2xl border border-dashed border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                              <ImageIcon size={24} className="text-slate-600 mb-1.5" />
                              <button
                                onClick={() => {
                                  setEditingImageSlideIdx(idx);
                                  setImageSearchKeyword(slide.title);
                                }}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                              >
                                + Rasm biriktirish
                              </button>
                            </div>
                          )}

                          {slide.stats && (
                            <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-950/40 to-slate-950 border border-indigo-500/20 text-center">
                              <span className="text-2xl sm:text-3xl font-black text-indigo-400 block tracking-tight">
                                {slide.stats.value}
                              </span>
                              <span className="text-xs text-slate-400 font-medium block mt-0.5">
                                {slide.stats.label}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULLSCREEN PRESENTATION MODAL */}
      {isFullscreen && project && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-6 sm:p-12 animate-in fade-in duration-200">
          {/* Header */}
          <div className="w-full flex items-center justify-between text-slate-400 text-xs">
            <span>
              {project.title} — Slayd {activeSlideIndex + 1} / {project.slides.length}
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
            >
              Chiqish (Esc)
            </button>
          </div>

          {/* Slide Body */}
          <div className="max-w-5xl w-full my-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className={`grid grid-cols-1 ${project.slides[activeSlideIndex].imageUrl ? 'lg:grid-cols-12' : ''} gap-8 items-center`}>
              <div className={`${project.slides[activeSlideIndex].imageUrl ? 'lg:col-span-7' : ''} space-y-5`}>
                <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">
                  {activeSlideIndex === 0 ? 'Taqdimot' : `Slayd ${activeSlideIndex + 1}`}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                  {project.slides[activeSlideIndex].title}
                </h2>
                {project.slides[activeSlideIndex].subtitle && (
                  <p className="text-sm sm:text-lg text-slate-400">
                    {project.slides[activeSlideIndex].subtitle}
                  </p>
                )}

                <div className="space-y-3 pt-2">
                  {project.slides[activeSlideIndex].bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm sm:text-base text-slate-200">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                {project.slides[activeSlideIndex].highlight && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm italic">
                    💡 {project.slides[activeSlideIndex].highlight}
                  </div>
                )}
              </div>

              {project.slides[activeSlideIndex].imageUrl && (
                <div className="lg:col-span-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.slides[activeSlideIndex].imageUrl}
                    alt={project.slides[activeSlideIndex].title}
                    className="w-full h-64 sm:h-80 object-cover rounded-2xl border border-slate-700/80 shadow-2xl"
                  />
                  {project.slides[activeSlideIndex].imageKeywords && (
                    <p className="text-center text-xs text-slate-400 mt-2 truncate">
                      {project.slides[activeSlideIndex].imageKeywords}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex items-center gap-4">
            <button
              disabled={activeSlideIndex === 0}
              onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
              className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-xs font-semibold text-slate-400">
              {activeSlideIndex + 1} / {project.slides.length}
            </span>
            <button
              disabled={activeSlideIndex === project.slides.length - 1}
              onClick={() => setActiveSlideIndex((prev) => Math.min(project.slides.length - 1, prev + 1))}
              className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      {/* RASMNI ALMASHTIRISH MODALI */}
      {editingImageSlideIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ImageIcon size={18} className="text-indigo-400" /> Slayd rasmini o‘zgartirish
              </h3>
              <button
                onClick={() => setEditingImageSlideIdx(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Mavzuga mos aniq so‘zni yozing (masalan: <i>Registon, Linus Torvalds, Amir Temur, Kiberxavfsizlik, Linux terminal, Toshkent</i>) yoki to‘g‘ridan-to‘g‘ri rasm URL manzilini kiriting:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={imageSearchKeyword}
                onChange={(e) => setImageSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchAndReplaceImage(editingImageSlideIdx)}
                placeholder="Qidiruv so‘zi yoki rasm URL manzili..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingImageSlideIdx(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Bekor qilish
              </button>
              <button
                disabled={isSearchingImage || !imageSearchKeyword.trim()}
                onClick={() => handleSearchAndReplaceImage(editingImageSlideIdx)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow"
              >
                {isSearchingImage ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw size={13} /> Rasmni o‘rnatish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
