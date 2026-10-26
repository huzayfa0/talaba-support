'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  Download,
  Printer,
  Sparkles,
  Upload,
  Trash2,
  Plus,
  RotateCcw,
  CheckCircle2,
  Eye,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Users,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Language, ObyektivkaData, QarindoshItem, MehnatFaoliyatiItem } from '@/types';
import { generateObyektivkaDocxBlob } from '@/lib/obyektivka-docx';
import { downloadBlob } from '@/lib/docx-generator';

const DEFAULT_SAMPLE_DATA: ObyektivkaData = {
  photoUrl: '',
  fish: 'Abdullayev Sardor Rustamovich',
  millati: 'O‘zbek',
  tugilganSana: '15.04.2005',
  tugilganJoyi: 'Samarqand viloyati, Ishtixon tumani',
  malumoti: 'Tugallanmagan oliy (Talaba)',
  mutaxassisligi: 'Dasturiy injiniring va axborot xavfsizligi',
  joriyLavozim: '2024 yildan: Toshkent axborot texnologiyalari universiteti 1-kurs talabasi',
  tamomlagan: '2024 y. 14-sonli umumiy o‘rta ta’lim maktabi',
  chetTillari: 'Rus tili, Ingliz tili (IELTS 6.5)',
  ilmiyDaraja: 'Yo‘q',
  ilmiyUnvon: 'Yo‘q',
  davlatMukofotlari: 'Taqdirlanmagan',
  partiyaviyligi: 'Yo‘q',
  deputatlik: 'Yo‘q',
  mehnatFaoliyati: [
    {
      id: 'm1',
      yillar: '2021-2024 yy.',
      lavozim: 'Samarqand viloyati Ishtixon tumani 14-sonli maktab o‘quvchisi',
    },
    {
      id: 'm2',
      yillar: '2024 y. - h.v.',
      lavozim: 'Toshkent axborot texnologiyalari universiteti 1-kurs talabasi',
    },
  ],
  qarindoshlar: [
    {
      id: 'q1',
      qarindoshligi: 'Otasi',
      fish: 'Abdullayev Rustam Salimovich',
      tugilganYiliVaJoyi: '1978 yil, Samarqand viloyati',
      vafotEtgan: false,
      ishJoyiVaLavozimi: 'Samarqand shahar 12-maktab o‘qituvchisi',
      turarJoyi: 'Samarqand vil., Ishtixon t., Ziyokor MFY, 14-uy',
    },
    {
      id: 'q2',
      qarindoshligi: 'Onasi',
      fish: 'Abdullayeva Nigora Anvarovna',
      tugilganYiliVaJoyi: '1982 yil, Samarqand viloyati',
      vafotEtgan: false,
      ishJoyiVaLavozimi: 'Ishtixon tuman markaziy shifoxonasi hamshirasi',
      turarJoyi: 'Samarqand vil., Ishtixon t., Ziyokor MFY, 14-uy',
    },
    {
      id: 'q3',
      qarindoshligi: 'Ukasi',
      fish: 'Abdullayev Asilbek Rustam o‘g‘li',
      tugilganYiliVaJoyi: '2010 yil, Samarqand viloyati',
      vafotEtgan: false,
      ishJoyiVaLavozimi: '14-sonli maktab 8-sinf o‘quvchisi',
      turarJoyi: 'Samarqand vil., Ishtixon t., Ziyokor MFY, 14-uy',
    },
  ],
};

interface Props {
  user: UserProfile;
  lang?: Language;
  theme?: 'dark' | 'light';
}

export default function ObyektivkaGenerator({ user, lang = 'uz', theme = 'dark' }: Props) {
  const isLight = theme === 'light';

  // Yordamchi CSS klasslar (kunduzgi va tungi rejim uchun moslashuvchan va ixcham)
  const inputClass = `w-full px-3 py-1.5 rounded-xl text-xs transition-colors focus:outline-none focus:border-indigo-500 ${
    isLight
      ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-indigo-500'
      : 'bg-slate-950/60 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500'
  }`;

  const smallInputClass = `w-full px-2.5 py-1 rounded-lg text-xs transition-colors focus:outline-none focus:border-indigo-500 ${
    isLight
      ? 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500'
      : 'bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500'
  }`;

  const labelClass = `block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`;
  const smallLabelClass = `text-[10px] block mb-1 font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`;
  const borderDivider = isLight ? 'border-slate-200' : 'border-slate-800';

  // State
  const [data, setData] = useState<ObyektivkaData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('talaba_obyektivka_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_e) {
          // ignore
        }
      }
    }
    return {
      ...DEFAULT_SAMPLE_DATA,
      fish: user.name || DEFAULT_SAMPLE_DATA.fish,
      joriyLavozim: user.university
        ? `2024 yildan: ${user.university} talabasi`
        : DEFAULT_SAMPLE_DATA.joriyLavozim,
      mutaxassisligi: user.faculty || DEFAULT_SAMPLE_DATA.mutaxassisligi,
    };
  });

  const [activeStep, setActiveStep] = useState<'shaxsiy' | 'talim' | 'mehnat' | 'qarindosh'>('shaxsiy');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('talaba_obyektivka_data', JSON.stringify(data));
    } catch (_e) {
      // ignore
    }
  }, [data]);

  // Rasm yuklash
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Rasm hajmi 5MB dan oshmasligi kerak!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setData((prev) => ({ ...prev, photoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setData((prev) => ({ ...prev, photoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Mehnat faoliyati boshqaruvi
  const handleAddMehnat = () => {
    setData((prev) => ({
      ...prev,
      mehnatFaoliyati: [
        ...prev.mehnatFaoliyati,
        {
          id: 'm_' + Date.now(),
          yillar: '2024 y. - h.v.',
          lavozim: 'OTM talabasi',
        },
      ],
    }));
  };

  const handleUpdateMehnat = (id: string, field: keyof MehnatFaoliyatiItem, val: string) => {
    setData((prev) => ({
      ...prev,
      mehnatFaoliyati: prev.mehnatFaoliyati.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    }));
  };

  const handleRemoveMehnat = (id: string) => {
    setData((prev) => ({
      ...prev,
      mehnatFaoliyati: prev.mehnatFaoliyati.filter((item) => item.id !== id),
    }));
  };

  // Qarindoshlar boshqaruvi
  const handleAddQarindosh = () => {
    setData((prev) => ({
      ...prev,
      qarindoshlar: [
        ...prev.qarindoshlar,
        {
          id: 'q_' + Date.now(),
          qarindoshligi: 'Aka/Ukasi',
          fish: '',
          tugilganYiliVaJoyi: '',
          vafotEtgan: false,
          ishJoyiVaLavozimi: '',
          turarJoyi: '',
        },
      ],
    }));
  };

  const handleUpdateQarindosh = (id: string, field: keyof QarindoshItem, val: any) => {
    setData((prev) => ({
      ...prev,
      qarindoshlar: prev.qarindoshlar.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      ),
    }));
  };

  const handleRemoveQarindosh = (id: string) => {
    setData((prev) => ({
      ...prev,
      qarindoshlar: prev.qarindoshlar.filter((item) => item.id !== id),
    }));
  };

  // Namuna yuklash
  const handleLoadSample = () => {
    if (confirm('Namuna ma’lumotlarni yuklamoqchimisiz? Kiritilgan ma’lumotlar namunaga almashtiriladi.')) {
      setData({
        ...DEFAULT_SAMPLE_DATA,
        fish: user.name || DEFAULT_SAMPLE_DATA.fish,
      });
    }
  };

  // Tozalash
  const handleReset = () => {
    if (confirm('Barcha maydonlarni tozalashni xohlaysizmi?')) {
      setData({
        photoUrl: '',
        fish: user.name || '',
        millati: 'O‘zbek',
        tugilganSana: '',
        tugilganJoyi: '',
        malumoti: 'Tugallanmagan oliy (Talaba)',
        mutaxassisligi: user.faculty || '',
        joriyLavozim: user.university ? `2024 yildan: ${user.university} talabasi` : '',
        tamomlagan: '',
        chetTillari: '',
        ilmiyDaraja: 'Yo‘q',
        ilmiyUnvon: 'Yo‘q',
        davlatMukofotlari: 'Taqdirlanmagan',
        partiyaviyligi: 'Yo‘q',
        deputatlik: 'Yo‘q',
        mehnatFaoliyati: [],
        qarindoshlar: [],
      });
      localStorage.removeItem('talaba_obyektivka_data');
    }
  };

  // Word (.docx) yuklab olish
  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      const blob = await generateObyektivkaDocxBlob(data);
      const safeName = (data.fish || 'Talaba').trim().replace(/[^a-zA-Z0-9а-яА-ЯёЁo‘O‘g‘G‘_ -]/g, '').replace(/\s+/g, '_');
      downloadBlob(blob, `Obyektivka_${safeName}.docx`);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
      alert('Word faylini yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Chop etish / PDF saqlash
  const handlePrint = () => {
    window.print();
  };

  // Nusxa olish
  const handleCopyText = () => {
    const text = `
MA'LUMOTNOMA
${data.fish}
${data.joriyLavozim}

Tug'ilgan yili: ${data.tugilganSana}
Tug'ilgan joyi: ${data.tugilganJoyi}
Millati: ${data.millati}
Partiyaviyligi: ${data.partiyaviyligi}
Ma'lumoti: ${data.malumoti}
Tamomlagan: ${data.tamomlagan}
Mutaxassisligi: ${data.mutaxassisligi}
Chet tillari: ${data.chetTillari}
Davlat mukofotlari: ${data.davlatMukofotlari}

MEHNAT FAOLIYATI:
${data.mehnatFaoliyati.map((m) => `${m.yillar} — ${m.lavozim}`).join('\n')}

YAQIN QARINDOSHLARI:
${data.qarindoshlar.map((q) => `${q.qarindoshligi}: ${q.fish} | ${q.tugilganYiliVaJoyi} | ${q.ishJoyiVaLavozimi} | ${q.turarJoyi}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-3 py-2 sm:py-3 space-y-4 animate-in fade-in duration-200">
      {/* 1. ASOSIY SARLAVHA & HARAKATLAR BANNERI */}
      <div
        className={`rounded-2xl p-3 sm:p-4 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
          isLight
            ? 'bg-white border border-slate-200 shadow-slate-200/50'
            : 'bg-slate-900/90 border border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-0.5 shadow-md shadow-indigo-500/20 shrink-0 flex items-center justify-center">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
              <UserCheck size={20} className="text-indigo-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className={`text-sm sm:text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Obyektivka (Ma’lumotnoma) Generatori
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-indigo-500/15 text-indigo-400 rounded-full border border-indigo-500/30 shrink-0">
                ⭐ Rasmiy Shablon
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 leading-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              OTM, dekanat, stipendiya va ishga kirish uchun davlat standarti bo‘yicha rasmiy Obyektivka
            </p>
          </div>
        </div>

        {/* Tugmalar */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {isExportingDocx ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={13} />
            )}
            <span>Word (.docx)</span>
          </button>

          <button
            onClick={handlePrint}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="A4 qog‘ozda chop etish yoki PDF sifatida saqlash"
          >
            <Printer size={13} />
            <span className="hidden sm:inline">Chop etish / PDF</span>
          </button>

          <button
            onClick={handleLoadSample}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title="Namunaviy ma’lumotlarni ko‘rish"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span className="hidden md:inline">Namuna</span>
          </button>

          <button
            onClick={handleReset}
            className={`p-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              isLight
                ? 'bg-slate-50 hover:bg-rose-50 border-slate-200 text-slate-500 hover:text-rose-600'
                : 'bg-slate-900 hover:bg-rose-950/30 border-slate-800 text-slate-400 hover:text-rose-400'
            }`}
            title="Barchasini tozalash"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* 2. ISHCHI MAYDON (2 USTUNLI GRID: CHAPDA FORMA, O'NGDA JONLI A4 NATIJA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* CHAP USTUN: MA'LUMOTLARNI KIRITISH (6 USTUN) */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-3">
          {/* Bosqichlar (Tabs) */}
          <div className={`flex items-center gap-1 p-1 rounded-xl overflow-x-auto no-scrollbar transition-all ${isLight ? 'bg-slate-100 border border-slate-200' : 'bg-slate-950/60 border border-slate-800/80'}`}>
            <button
              onClick={() => setActiveStep('shaxsiy')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeStep === 'shaxsiy'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <User size={13} />
              <span>1. Shaxsiy & Rasm</span>
            </button>

            <button
              onClick={() => setActiveStep('talim')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeStep === 'talim'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap size={13} />
              <span>2. Ta’lim & Tillar</span>
            </button>

            <button
              onClick={() => setActiveStep('mehnat')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeStep === 'mehnat'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Briefcase size={13} />
              <span>3. Faoliyat</span>
            </button>

            <button
              onClick={() => setActiveStep('qarindosh')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeStep === 'qarindosh'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users size={13} />
              <span>4. Qarindoshlar</span>
            </button>
          </div>

          {/* FORMA KARTASI */}
          <div
            className={`rounded-2xl p-3.5 sm:p-4 border transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-900/90 border-slate-800 shadow-lg'
            }`}
          >
            {/* 1. SHAXSIY MA'LUMOTLAR VA 3x4 RASM */}
            {activeStep === 'shaxsiy' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <User size={16} className="text-indigo-400" />
                    <span>Shaxsiy ma’lumotlar va 3x4 Rasm</span>
                  </h3>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>1 / 4 qadam</span>
                </div>

                {/* 3x4 Rasm yuklash maydoni */}
                <div className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl transition-all ${isLight ? 'bg-slate-50 border border-slate-200' : 'bg-slate-950/40 border border-slate-800/80'}`}>
                  {/* Rasm ko'rinishi */}
                  <div className={`w-24 h-32 rounded-xl border-2 border-dashed border-indigo-500/40 overflow-hidden flex items-center justify-center shrink-0 relative group shadow-inner ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
                    {data.photoUrl ? (
                      <>
                        <img src={data.photoUrl} alt="3x4" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-400 cursor-pointer"
                          title="Rasmni o‘chirish"
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <Upload size={24} className="mx-auto mb-1 text-indigo-400" />
                        <span className="text-[10px] block leading-tight font-medium">3x4 Rasm</span>
                      </div>
                    )}
                  </div>

                  {/* Yuklash tugmasi va tavsif */}
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <p className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                      Rasmiy 3x4 Fotosuratni yuklang
                    </p>
                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Format: JPG, PNG, WEBP (maksimal 5MB). Oq yoki och fondagi rasmiy fotosurat tavsiya etiladi.
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload size={13} />
                        <span>{data.photoUrl ? 'Rasmni almashtirish' : 'Rasm tanlash'}</span>
                      </button>

                      {data.photoUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1.5 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 transition-all cursor-pointer"
                        >
                          O‘chirish
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inputlar */}
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>
                      F.I.Sh. (Familiya Ism Sharif) *
                    </label>
                    <input
                      type="text"
                      value={data.fish}
                      onChange={(e) => setData({ ...data, fish: e.target.value })}
                      placeholder="Masalan: Abdullayev Sardor Rustamovich"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>
                        Tug‘ilgan sana *
                      </label>
                      <input
                        type="text"
                        value={data.tugilganSana}
                        onChange={(e) => setData({ ...data, tugilganSana: e.target.value })}
                        placeholder="Masalan: 15.04.2005"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Millati *
                      </label>
                      <input
                        type="text"
                        value={data.millati}
                        onChange={(e) => setData({ ...data, millati: e.target.value })}
                        placeholder="Masalan: O‘zbek"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Tug‘ilgan joyi *
                    </label>
                    <input
                      type="text"
                      value={data.tugilganJoyi}
                      onChange={(e) => setData({ ...data, tugilganJoyi: e.target.value })}
                      placeholder="Masalan: Samarqand viloyati, Ishtixon tumani"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>
                        Partiyaviyligi
                      </label>
                      <input
                        type="text"
                        value={data.partiyaviyligi}
                        onChange={(e) => setData({ ...data, partiyaviyligi: e.target.value })}
                        placeholder="Masalan: Yo‘q (yoki partiya nomi)"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Deputatlik organlariga a’zoligi
                      </label>
                      <input
                        type="text"
                        value={data.deputatlik}
                        onChange={(e) => setData({ ...data, deputatlik: e.target.value })}
                        placeholder="Masalan: Yo‘q"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveStep('talim')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Keyingi: Ta’lim & Mutaxassislik →
                  </button>
                </div>
              </div>
            )}

            {/* 2. TA'LIM VA MUTAXASSISLIK */}
            {activeStep === 'talim' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <GraduationCap size={16} className="text-indigo-400" />
                    <span>Ta’lim, Mutaxassislik va Chet tillari</span>
                  </h3>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>2 / 4 qadam</span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>
                        Ma’lumoti *
                      </label>
                      <select
                        value={data.malumoti}
                        onChange={(e) => setData({ ...data, malumoti: e.target.value })}
                        className={inputClass}
                      >
                        <option value="Tugallanmagan oliy (Talaba)">Tugallanmagan oliy (Talaba)</option>
                        <option value="Oliy">Oliy</option>
                        <option value="Magistr">Magistr</option>
                        <option value="O‘rta maxsus">O‘rta maxsus (Litsey / Kollej / Texnikum)</option>
                        <option value="O‘rta">O‘rta (Maktab)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Hozirgi o‘qish / ish joyi va lavozimi *
                      </label>
                      <input
                        type="text"
                        value={data.joriyLavozim}
                        onChange={(e) => setData({ ...data, joriyLavozim: e.target.value })}
                        placeholder="Masalan: 2024 yildan: TATU 1-kurs talabasi"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Ma’lumoti bo‘yicha mutaxassisligi (Fakultet / Yo‘nalish) *
                    </label>
                    <input
                      type="text"
                      value={data.mutaxassisligi}
                      onChange={(e) => setData({ ...data, mutaxassisligi: e.target.value })}
                      placeholder="Masalan: Dasturiy injiniring va sun‘iy intellekt"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Tamomlagan o‘quv yurtlari *
                    </label>
                    <input
                      type="text"
                      value={data.tamomlagan}
                      onChange={(e) => setData({ ...data, tamomlagan: e.target.value })}
                      placeholder="Masalan: 2024 y. Samarqand viloyati 14-sonli maktab"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Qaysi chet tillarini biladi *
                    </label>
                    <input
                      type="text"
                      value={data.chetTillari}
                      onChange={(e) => setData({ ...data, chetTillari: e.target.value })}
                      placeholder="Masalan: Rus tili, Ingliz tili (IELTS 6.5)"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>
                        Ilmiy darajasi
                      </label>
                      <input
                        type="text"
                        value={data.ilmiyDaraja}
                        onChange={(e) => setData({ ...data, ilmiyDaraja: e.target.value })}
                        placeholder="Yo‘q"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Ilmiy unvoni
                      </label>
                      <input
                        type="text"
                        value={data.ilmiyUnvon}
                        onChange={(e) => setData({ ...data, ilmiyUnvon: e.target.value })}
                        placeholder="Yo‘q"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Davlat mukofotlari
                      </label>
                      <input
                        type="text"
                        value={data.davlatMukofotlari}
                        onChange={(e) => setData({ ...data, davlatMukofotlari: e.target.value })}
                        placeholder="Taqdirlanmagan"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep('shaxsiy')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    ← Ortga
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep('mehnat')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Keyingi: Faoliyat tarixi →
                  </button>
                </div>
              </div>
            )}

            {/* 3. MEHNAT / O'QISH FAOLIYATI */}
            {activeStep === 'mehnat' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <Briefcase size={16} className="text-indigo-400" />
                      <span>Mehnat va O‘qish faoliyati tarixi</span>
                    </h3>
                    <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Xronologik tartibda o‘qigan maktab, litsey yoki OTM va ishlagan joylaringiz
                    </p>
                  </div>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>3 / 4 qadam</span>
                </div>

                <div className="space-y-2.5">
                  {data.mehnatFaoliyati.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl flex flex-col sm:flex-row items-center gap-3 relative group transition-all ${
                        isLight ? 'bg-slate-50 border border-slate-200 shadow-sm' : 'bg-slate-950/50 border border-slate-800'
                      }`}
                    >
                      <div className="w-full sm:w-44 shrink-0">
                        <label className={smallLabelClass}>
                          Yillar (Davr)
                        </label>
                        <input
                          type="text"
                          value={item.yillar}
                          onChange={(e) => handleUpdateMehnat(item.id, 'yillar', e.target.value)}
                          placeholder="2021-2024 yy."
                          className={`${smallInputClass} font-mono`}
                        />
                      </div>

                      <div className="w-full flex-1">
                        <label className={smallLabelClass}>
                          O‘qish yoki ish joyi, lavozimi
                        </label>
                        <input
                          type="text"
                          value={item.lavozim}
                          onChange={(e) => handleUpdateMehnat(item.id, 'lavozim', e.target.value)}
                          placeholder="Masalan: 14-sonli maktab o‘quvchisi"
                          className={smallInputClass}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMehnat(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 mt-3 sm:mt-4"
                        title="Qatorni o‘chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddMehnat}
                    className={`w-full py-2.5 rounded-2xl border border-dashed border-indigo-500/40 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-500 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isLight ? 'bg-indigo-50/40' : 'bg-slate-950/20'
                    }`}
                  >
                    <Plus size={15} />
                    <span>Yangi qator qo‘shish</span>
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep('talim')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    ← Ortga
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep('qarindosh')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Keyingi: Qarindoshlar jadvali →
                  </button>
                </div>
              </div>
            )}

            {/* 4. YAQIN QARINDOSHLAR JADVALI */}
            {activeStep === 'qarindosh' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className={`flex items-center justify-between border-b pb-3 ${borderDivider}`}>
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <Users size={16} className="text-indigo-400" />
                      <span>Yaqin qarindoshlari haqida ma’lumot</span>
                    </h3>
                    <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Otasi, onasi, aka-uka, opa-singillari haqidagi rasmiy davlat jadvali
                    </p>
                  </div>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>4 / 4 qadam</span>
                </div>

                <div className="space-y-3">
                  {data.qarindoshlar.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl space-y-2.5 relative transition-all ${
                        isLight ? 'bg-slate-50 border border-slate-200 shadow-sm' : 'bg-slate-950/50 border border-slate-800'
                      }`}
                    >
                      <div className={`flex items-center justify-between border-b pb-2 ${borderDivider}`}>
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-500 text-[10px] font-bold">
                          {idx + 1}. {item.qarindoshligi || 'Qarindosh'}
                        </span>

                        <div className="flex items-center gap-2">
                          <label className={`flex items-center gap-1.5 text-[11px] cursor-pointer select-none ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                            <input
                              type="checkbox"
                              checked={item.vafotEtgan}
                              onChange={(e) => handleUpdateQarindosh(item.id, 'vafotEtgan', e.target.checked)}
                              className="rounded border-slate-400 text-indigo-600 accent-indigo-600"
                            />
                            <span>Vafot etgan</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveQarindosh(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="O‘chirish"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className={smallLabelClass}>
                            Qarindoshligi *
                          </label>
                          <select
                            value={item.qarindoshligi}
                            onChange={(e) => handleUpdateQarindosh(item.id, 'qarindoshligi', e.target.value)}
                            className={smallInputClass}
                          >
                            <option value="Otasi">Otasi</option>
                            <option value="Onasi">Onasi</option>
                            <option value="Akasi">Akasi</option>
                            <option value="Ukasi">Ukasi</option>
                            <option value="Opasi">Opasi</option>
                            <option value="Singlisi">Singlisi</option>
                            <option value="Turmush o‘rtog‘i">Turmush o‘rtog‘i</option>
                            <option value="O‘g‘li">O‘g‘li</option>
                            <option value="Qizi">Qizi</option>
                          </select>
                        </div>

                        <div>
                          <label className={smallLabelClass}>
                            F.I.Sh. (Familiya Ism Sharif) *
                          </label>
                          <input
                            type="text"
                            value={item.fish}
                            onChange={(e) => handleUpdateQarindosh(item.id, 'fish', e.target.value)}
                            placeholder="Abdullayev Rustam Salimovich"
                            className={smallInputClass}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className={smallLabelClass}>
                            Tug‘ilgan yili va joyi *
                          </label>
                          <input
                            type="text"
                            value={item.tugilganYiliVaJoyi}
                            onChange={(e) => handleUpdateQarindosh(item.id, 'tugilganYiliVaJoyi', e.target.value)}
                            placeholder="1978 yil, Samarqand viloyati"
                            className={smallInputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>
                            Ish joyi va lavozimi *
                          </label>
                          <input
                            type="text"
                            value={item.ishJoyiVaLavozimi}
                            onChange={(e) => handleUpdateQarindosh(item.id, 'ishJoyiVaLavozimi', e.target.value)}
                            placeholder="Maktab o‘qituvchisi (yoki nafaqada)"
                            className={smallInputClass}
                          />
                        </div>

                        <div>
                          <label className={smallLabelClass}>
                            Turar joyi (Yashash manzili) *
                          </label>
                          <input
                            type="text"
                            value={item.turarJoyi}
                            onChange={(e) => handleUpdateQarindosh(item.id, 'turarJoyi', e.target.value)}
                            placeholder="Samarqand viloyati, Ishtixon tumani, Ziyokor MFY..."
                            className={smallInputClass}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddQarindosh}
                    className={`w-full py-2.5 rounded-2xl border border-dashed border-indigo-500/40 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-500 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isLight ? 'bg-indigo-50/40' : 'bg-slate-950/20'
                    }`}
                  >
                    <Plus size={15} />
                    <span>Yangi qarindosh qo‘shish</span>
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep('mehnat')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    ← Ortga
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadDocx}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
                  >
                    <Download size={15} />
                    <span>Tayyor! Word (.docx) yuklab olish</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* O'NG USTUN: JONLI RASMIY A4 OBYEKTIVKA KO'RINISHI (6 USTUN) */}
        <div className="lg:col-span-6 xl:col-span-6 space-y-2 lg:sticky lg:top-3">
          {/* Tepa paneli: format haqida ma'lumot va tezkor nusxa olish */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Eye size={13} className="text-indigo-400" />
              <span>Jonli A4 Rasmiy Hujjat Natijasi</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                title="Matndan nusxa olish"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? 'Nusxalandi!' : 'Nusxa olish'}</span>
              </button>
            </div>
          </div>

          {/* RASMIY A4 OQ QOG'OZ KO'RINISHI */}
          <div
            id="obyektivka-print-area"
            className="w-full bg-white text-slate-900 border border-slate-300 rounded-2xl p-4 sm:p-6 shadow-xl space-y-3.5 text-left font-serif leading-relaxed text-[11px] sm:text-xs relative transition-all"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            {/* 1. TEPA QISM: SARLAVHA VA 3x4 FOTOSURAT */}
            <div className="flex items-start justify-between gap-4 border-b pb-4 border-slate-200">
              <div className="text-center flex-1 pt-2 space-y-1">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-slate-950 uppercase">
                  MA’LUMOTNOMA
                </h2>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {data.fish || 'Abdullayev Sardor Rustamovich'}
                </h3>
                <p className="text-xs font-bold text-slate-700 pt-1">
                  {data.joriyLavozim || 'Talaba'}
                </p>
              </div>

              {/* 3x4 Fotosurat */}
              <div className="w-[105px] h-[140px] sm:w-[115px] sm:h-[150px] border border-slate-400 rounded-sm bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                {data.photoUrl ? (
                  <img src={data.photoUrl} alt="3x4 Rasm" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-400 p-2 text-[10px]">
                    <User size={28} className="mx-auto mb-1 text-slate-400" />
                    <span>3x4 Rasm</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. ASOSIY MA'LUMOTLAR SATRLARI */}
            <div className="space-y-1.5 text-slate-900 border-b pb-4 border-slate-200 text-[11px] sm:text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-600">Tug‘ilgan yili: </span>
                  <span className="font-bold">{data.tugilganSana || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-600">Tug‘ilgan joyi: </span>
                  <span className="font-bold">{data.tugilganJoyi || '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-600">Millati: </span>
                  <span className="font-bold">{data.millati || 'O‘zbek'}</span>
                </div>
                <div>
                  <span className="text-slate-600">Partiyaviyligi: </span>
                  <span className="font-bold">{data.partiyaviyligi || 'Yo‘q'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-600">Ma’lumoti: </span>
                  <span className="font-bold">{data.malumoti || 'Tugallanmagan oliy'}</span>
                </div>
                <div>
                  <span className="text-slate-600">Tamomlagan: </span>
                  <span className="font-bold">{data.tamomlagan || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-600">Ma’lumoti bo‘yicha mutaxassisligi: </span>
                <span className="font-bold">{data.mutaxassisligi || '—'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-600">Ilmiy darajasi: </span>
                  <span className="font-bold">{data.ilmiyDaraja || 'Yo‘q'}</span>
                </div>
                <div>
                  <span className="text-slate-600">Ilmiy unvoni: </span>
                  <span className="font-bold">{data.ilmiyUnvon || 'Yo‘q'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-600">Qaysi chet tillarini biladi: </span>
                <span className="font-bold">{data.chetTillari || '—'}</span>
              </div>

              <div>
                <span className="text-slate-600">Davlat mukofotlari bilan taqdirlanganmi: </span>
                <span className="font-bold">{data.davlatMukofotlari || 'Taqdirlanmagan'}</span>
              </div>

              <div>
                <span className="text-slate-600">
                  Xalq deputatlari respublika, viloyat, shahar va tuman Kengashi deputatimi yoki boshqa saylanadigan organlarning a’zosimi:{' '}
                </span>
                <span className="font-bold">{data.deputatlik || 'Yo‘q'}</span>
              </div>
            </div>

            {/* 3. MEHNAT FAOLIYATI */}
            <div className="space-y-2 border-b pb-4 border-slate-200">
              <h4 className="text-center font-bold text-xs uppercase tracking-wider text-slate-900">
                MEHNAT FAOLIYATI
              </h4>
              <div className="space-y-1">
                {data.mehnatFaoliyati && data.mehnatFaoliyati.length > 0 ? (
                  data.mehnatFaoliyati.map((m) => (
                    <div key={m.id} className="flex items-start gap-2">
                      <span className="font-bold shrink-0">{m.yillar} —</span>
                      <span>{m.lavozim}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">Faoliyat ma’lumotlari kiritilmagan</p>
                )}
              </div>
            </div>

            {/* 4. YAQIN QARINDOSHLARI HAQIDA RASMIY JADVAL */}
            <div className="space-y-2">
              <h4 className="text-center font-bold text-xs uppercase tracking-wider text-slate-900 leading-tight">
                {data.fish || 'Abdullayev Sardor Rustamovich'}ning yaqin qarindoshlari haqida
                <br />
                MA’LUMOT
              </h4>

              <div className="overflow-x-auto border border-black">
                <table className="w-full text-left border-collapse text-[10px] sm:text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-black text-center font-bold">
                      <th className="p-1.5 border-r border-black w-[15%]">Qarindoshligi</th>
                      <th className="p-1.5 border-r border-black w-[25%]">Familiyasi, ismi va otasining ismi</th>
                      <th className="p-1.5 border-r border-black w-[20%]">Tug‘ilgan yili va joyi</th>
                      <th className="p-1.5 border-r border-black w-[20%]">Ish joyi va lavozimi</th>
                      <th className="p-1.5 w-[20%]">Turar joyi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.qarindoshlar && data.qarindoshlar.length > 0 ? (
                      data.qarindoshlar.map((q) => (
                        <tr key={q.id} className="border-b border-black last:border-b-0">
                          <td className="p-1.5 border-r border-black font-semibold text-center align-top">
                            {q.qarindoshligi}
                          </td>
                          <td className="p-1.5 border-r border-black font-bold align-top">
                            {q.fish || '—'}
                          </td>
                          <td className="p-1.5 border-r border-black text-center align-top">
                            {q.tugilganYiliVaJoyi || '—'}
                          </td>
                          <td className="p-1.5 border-r border-black align-top">
                            {q.vafotEtgan ? `${q.ishJoyiVaLavozimi || ''} (vafot etgan)` : q.ishJoyiVaLavozimi || '—'}
                          </td>
                          <td className="p-1.5 align-top">
                            {q.turarJoyi || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-3 text-center text-slate-500 italic">
                          Qarindoshlar ma’lumotlari kiritilmagan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
