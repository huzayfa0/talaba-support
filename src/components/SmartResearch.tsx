'use client';

import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  BookOpen,
  HelpCircle,
  ExternalLink,
  Presentation,
  FileText,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { ResearchResult } from '@/types';
import { searchAcademicKnowledge } from '@/lib/ai-service';

const POPULAR_SEARCHES = [
  "Inflyatsiya va inflyatsion kutilmalar",
  "Kiberxavfsizlikda asimmetrik shifrlash (RSA)",
  "O'zbekiston Konstitutsiyasining asosiy prinsiplari",
  "Genetik muhandislik va CRISPR texnologiyasi",
  "Bozor iqtisodiyotida talab va taklif qonuni",
  "Neyron tarmoqlarning arxitekturasi va perceptron",
];

interface Props {
  onSendToPresentation: (topic: string) => void;
  onSendToMustaqilIsh: (topic: string) => void;
  onSaveResult: (result: ResearchResult) => void;
}

export default function SmartResearch({
  onSendToPresentation,
  onSendToMustaqilIsh,
  onSaveResult,
}: Props) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (targetQuery?: string) => {
    const q = targetQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    try {
      const data = await searchAcademicKnowledge(q);
      setResult(data);
      onSaveResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const text = `
MAVZU: ${result.query}

QISQACHA TA'RIF:
${result.summary}

ASOSIY TEZISLAR:
${result.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

MANBALAR:
${result.sources.map((s) => `• ${s.title} (${s.author || ''} ${s.year || ''})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full px-0 py-2 sm:py-2.5 space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Sparkles size={14} />
          <span>Talabalar uchun Aqlli Qidiruv va Imtihon Assistenti</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Istalgan mavzuda <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">ilmiy tahlil</span> toping
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
          Mavzuning akademik tushunchasi, faktlar, darslik manbalari va imtihonga tayyorlanish kartochkalari (flashcards).
        </p>
      </div>

      {/* Qidiruv formasi */}
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Istalgan mavzu, atama, qonun yoki formulani yozing..."
            className="w-full pl-12 pr-28 py-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-base focus:outline-none focus:border-emerald-500 shadow-xl transition-all"
          />
          <Search size={22} className="absolute left-4 top-4 text-slate-500" />
          <button
            disabled={isLoading || !query.trim()}
            onClick={() => handleSearch()}
            className="absolute right-2.5 top-2.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Qidirish'
            )}
          </button>
        </div>

        {/* Takliflar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-400" /> Ommabop:
          </span>
          {POPULAR_SEARCHES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(item);
                handleSearch(item);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* NATIJALAR BLOKI */}
      {result && (
        <div className="space-y-6 pt-4">
          {/* Yuqori xulosa kartasi */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase block mb-1">
                  Ilmiy Xulosa
                </span>
                <h2 className="text-2xl font-bold text-white capitalize">{result.query}</h2>
              </div>

              {/* Tezkor amallar: Mustaqil ishga yoki Slaydga aylantirish */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSendToPresentation(result.query)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Presentation size={14} /> Slayd tayyorlash
                </button>
                <button
                  onClick={() => onSendToMustaqilIsh(result.query)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <FileText size={14} /> Mustaqil ish yozish
                </button>
                <button
                  onClick={handleCopySummary}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Xulosani nusxalash"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Asosiy ta'rif */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-slate-300 text-sm md:text-base leading-relaxed">
              {result.summary}
            </div>

            {/* Statistika ko'rsatkichlari */}
            {result.statistics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.statistics.map((st, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-950/30 to-slate-950 border border-emerald-500/20 text-center"
                  >
                    <span className="text-2xl font-black text-emerald-400 block">{st.value}</span>
                    <span className="text-xs text-slate-400 font-medium block mt-0.5">{st.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Asosiy Tezislar */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Mavzuning muhim qoidalari va tezislari:
              </h3>
              <div className="space-y-2.5">
                {result.keyPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-sm text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manbalar va Foydalanilgan adabiyotlar */}
            {result.sources.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-400" />
                  Tavsiya etiladigan ilmiy adabiyotlar va darsliklar:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.sources.map((src, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-semibold text-white">{src.title}</p>
                        <p className="text-slate-500 mt-0.5">
                          {src.author || 'Akademik manba'} • {src.year || '2023'}
                        </p>
                      </div>
                      {src.link && (
                        <a
                          href={src.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 group-hover:text-emerald-400 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* IMTIHON UCHUN FLASHCARDS (SAVOL-JAVOB) */}
          {result.flashcards.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle size={20} className="text-amber-400" />
                <h3 className="text-lg font-bold text-white">Imtihonga tayyorlanish kartochkalari (Flashcards)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Savolni o‘qing, so‘ngra to‘g‘ri javobni ko‘rish uchun kartochka ustiga bosing.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {result.flashcards.map((card, cIdx) => {
                  const isFlipped = activeCardIndex === cIdx;
                  return (
                    <div
                      key={cIdx}
                      onClick={() => setActiveCardIndex(isFlipped ? null : cIdx)}
                      className={`cursor-pointer min-h-[160px] p-5 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                        isFlipped
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <span className={`text-[10px] font-bold tracking-wider uppercase block ${isFlipped ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {isFlipped ? '✅ JAVOB' : `❓ SAVOL 0${cIdx + 1}`}
                        </span>
                        <p className={`text-sm font-medium ${isFlipped ? 'text-emerald-200' : 'text-slate-200'}`}>
                          {isFlipped ? card.answer : card.question}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-500 block pt-2 text-right">
                        {isFlipped ? 'Savolga qaytish ↩' : 'Javobni ko‘rish ➔'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
