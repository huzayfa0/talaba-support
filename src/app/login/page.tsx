'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Lock,
  Phone,
  User,
  KeyRound,
  AlertTriangle,
  GraduationCap,
  Mail,
  AtSign,
  ChevronDown,
} from 'lucide-react';
import { Language, UserProfile } from '@/types';
import ThemeLanguageSwitcher from '@/components/ThemeLanguageSwitcher';
import { TRANSLATIONS } from '@/lib/translations';

type AuthViewMode = 'login' | 'register' | 'blocked';

// Asosiy 6 ta universitet to'liq rasmiy nomi bilan
const MAIN_UNIVERSITIES = [
  "Muhammad al-Xorazmiy nomidagi Toshkent axborot texnologiyalari universiteti (TATU)",
  "Mirzo Ulug‘bek nomidagi O‘zbekiston Milliy universiteti (O‘zMU)",
  "Toshkent moliya instituti (Moliya)",
  "Alfraganus universiteti (Alfraganus)",
  "Toshkent amaliy fanlar universiteti (Amaliy)",
  "Toshkent tibbiyot akademiyasi (ToshMI / Toshme)",
];

export default function LoginPage() {
  const router = useRouter();

  // Til va Rejim (Tungi / Kunduzgi)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<Language>('uz');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.uz;

  // Qurilma ID va ko'rinish holati
  const [deviceId, setDeviceId] = useState<string>('');
  const [viewMode, setViewMode] = useState<AuthViewMode>('login');

  // Login formasi (Faqat Login va Parol)
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Xatoliklar va urinishlar soni
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [maxAttempts, setMaxAttempts] = useState<number>(20);
  const [blockReason, setBlockReason] = useState<string>('');

  // Yangi to'liq registratsiya formasi
  const [regName, setRegName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regUniversity, setRegUniversity] = useState<string>(MAIN_UNIVERSITIES[0]);
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('+998 ');
  const [regGender, setRegGender] = useState<'erkak' | 'ayol'>('erkak');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  // Xabarlar va yuklanish
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Til, Mavzu va Qurilma bloklanganligini tekshirish
  useEffect(() => {
    // 1. Saqlangan tilni o'qish
    const savedLang = localStorage.getItem('talaba_lang') as Language;
    if (savedLang && ['uz', 'kaa', 'kk', 'ru', 'en'].includes(savedLang)) {
      setLang(savedLang);
    }

    // 2. Saqlangan mavzuni (Theme) o'qish va qo'llash
    const savedTheme = localStorage.getItem('talaba_theme') as 'dark' | 'light';
    if (savedTheme === 'light') {
      setTheme('light');
      document.documentElement.classList.add('light');
    } else {
      setTheme('dark');
      document.documentElement.classList.remove('light');
    }

    // 3. Qurilma ID
    let currentDeviceId = localStorage.getItem('talaba_device_id');
    if (!currentDeviceId) {
      currentDeviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('talaba_device_id', currentDeviceId);
    }
    setDeviceId(currentDeviceId);

    // Agar localStore-da bloklangan belgisi bo'lsa
    if (localStorage.getItem('talaba_device_blocked') === 'true') {
      setViewMode('blocked');
      setBlockReason('20 marta xato parol terilgani sababli ushbu qurilma bloklangan.');
      return;
    }

    // Serverda blok holatini tekshirish
    fetch('/api/auth/check-block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: currentDeviceId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.blocked) {
          localStorage.setItem('talaba_device_blocked', 'true');
          setViewMode('blocked');
          setBlockReason(data.record?.reason || 'Qurilma xavfsizlik filtri orqali bloklangan');
        }
      })
      .catch(() => {});
  }, []);

  // Mavzuni almashtirish (Tungi / Kunduzgi)
  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('talaba_theme', next);
    if (next === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  // Tilni almashtirish
  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('talaba_lang', newLang);
  };

  // Telefon raqami formatlash
  const handlePhoneChange = (val: string, setter: (v: string) => void) => {
    if (!val.startsWith('+998')) {
      setter('+998 ');
      return;
    }
    setter(val);
  };

  // 1. LOGIN: Faqat Login va Parol bilan kirish
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const idVal = loginUsername.trim();
    if (!idVal) {
      setErrorMsg('Iltimos, loginingizni kiriting');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('Iltimos, parolingizni kiriting');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: idVal,
          password: loginPassword,
          deviceId,
        }),
      });

      const data = await res.json();

      // 20 marta xato bo'lsa -> AVTO BLOK
      if (data.isBlocked) {
        localStorage.setItem('talaba_device_blocked', 'true');
        setViewMode('blocked');
        setBlockReason(data.error || '20 marta xato terilgani sababli qurilma bloklandi!');
        return;
      }

      if (!res.ok || !data.success) {
        setFailedAttempts(data.attempts || failedAttempts + 1);
        setMaxAttempts(data.maxAttempts || 20);
        setErrorMsg(data.error || 'Login yoki parol noto‘g‘ri kiritildi');
        return;
      }

      // Muvaffaqiyatli kirish!
      const user: UserProfile = data.user;
      localStorage.setItem('talaba_user_profile', JSON.stringify(user));
      setSuccessMsg(`Xush kelibsiz, ${user.name}! Bosh sahifaga yo‘naltirilmoqda...`);

      setTimeout(() => {
        window.location.href = '/';
      }, 600);
    } catch {
      setErrorMsg('Tizimga kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // 2. YANGI TO'LIQ REGISTRATSIYA
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const name = regName.trim();
    if (!name || name.length < 3) {
      setErrorMsg('Iltimos, ism va familiyangizni to‘liq kiriting (kamida 3 ta belgi)');
      return;
    }

    const username = regUsername.trim().toLowerCase();
    if (!username || username.length < 3) {
      setErrorMsg('Iltimos, yangi login kiriting (kamida 3 ta belgi, masalan: sardor99)');
      return;
    }

    const university = regUniversity.trim();
    if (!university) {
      setErrorMsg('Iltimos, o‘qiyotgan universitetingizni tanlang');
      return;
    }

    const email = regEmail.trim().toLowerCase();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Iltimos, to‘g‘ri elektron pochta (Gmail) manzilini kiriting');
      return;
    }

    const phoneDigits = regPhone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 9) {
      setErrorMsg('Iltimos, to‘liq telefon raqamingizni kiriting (+998...)');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setErrorMsg('Parol kamida 4 ta belgidan iborat bo‘lishi kerak');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Kiritilgan ikkala yangi parol bir-biriga mos kelmadi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          university,
          email,
          phone: regPhone.trim(),
          gender: regGender,
          password: regPassword,
          deviceId,
        }),
      });

      const data = await res.json();

      if (data.isBlocked) {
        localStorage.setItem('talaba_device_blocked', 'true');
        setViewMode('blocked');
        setBlockReason(data.error || 'Qurilma xavfsizlik filtri orqali bloklangan');
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Ro‘yxatdan o‘tishda xatolik yuz berdi');
        return;
      }

      // Muvaffaqiyatli ro'yxatdan o'tildi!
      const user: UserProfile = data.user;
      localStorage.setItem('talaba_user_profile', JSON.stringify(user));
      setSuccessMsg(`Tabriklaymiz, ${user.name}! Muvaffaqiyatli ro‘yxatdan o‘tdingiz. Tizimga yo‘naltirilmoqda...`);

      setTimeout(() => {
        window.location.href = '/';
      }, 700);
    } catch {
      setErrorMsg('Ro‘yxatdan o‘tishda tarmoq xatoligi yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between relative selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* Top Navbar Header */}
      <header className="w-full px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between z-30 relative max-w-7xl mx-auto shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all backdrop-blur-md active:scale-95 group shadow-sm"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-cyan-400" />
          <span>{t.auth.backHome}</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tungi / Kunduzgi rejim va Til tanlash */}
          <ThemeLanguageSwitcher
            currentLang={lang}
            onLangChange={handleLangChange}
            currentTheme={theme}
            onThemeToggle={handleToggleTheme}
          />

          <span className="text-xs text-slate-500 hidden sm:inline">{t.auth.securityBadge}</span>
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold">
            <Sparkles size={12} className="text-cyan-400" />
            <span>v1.0 Pro</span>
          </div>
        </div>
      </header>

      {/* Background ambient lighting */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[320px] sm:w-[480px] h-[300px] bg-cyan-500/12 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[240px] sm:w-[380px] h-[220px] bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6 z-20 w-full max-w-7xl mx-auto">
        
        {/* Floating 3D Glowing Sphere / Orb */}
        <div className="relative flex items-center justify-center -mb-7 sm:-mb-8 z-30 pointer-events-none select-none">
          {viewMode === 'blocked' ? (
            /* Bloklangan holatda qizil xavfsizlik shari */
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full relative shadow-[inset_-6px_-6px_14px_rgba(2,6,23,0.95),inset_3px_3px_8px_rgba(255,255,255,0.7),0_0_35px_rgba(239,68,68,0.7),0_0_70px_rgba(220,38,38,0.5)] shrink-0 bg-gradient-to-br from-rose-400 via-red-600 to-red-950 flex items-center justify-center">
              <ShieldAlert size={28} className="text-white animate-pulse" />
            </div>
          ) : (
            /* Standart 3D moviy shar */
            <>
              {/* Top bright flare dot */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full blur-[0.5px] shadow-[0_0_10px_2px_rgba(255,255,255,0.95),0_0_25px_6px_rgba(56,189,248,0.85)] z-30" />
              {/* Outer glow aura */}
              <div className="absolute inset-0 rounded-full bg-cyan-400/35 blur-xl scale-125" />
              {/* 3D Sphere Body with explicit dimensions */}
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full relative shadow-[inset_-6px_-6px_14px_rgba(2,6,23,0.95),inset_3px_3px_8px_rgba(255,255,255,0.7),0_0_35px_rgba(6,182,212,0.65),0_0_70px_rgba(14,165,233,0.4)] shrink-0"
                style={{
                  background: 'radial-gradient(circle at 35% 26%, #bbf7d0 0%, #38bdf8 20%, #0284c7 46%, #0369a1 70%, #082f49 100%)',
                }}
              >
                <div className="absolute top-1.5 left-2.5 w-4 h-2.5 bg-white/80 rounded-full blur-[1px] rotate-[-25deg]" />
                <div className="absolute bottom-1 right-2.5 w-5 h-2.5 bg-cyan-300/40 rounded-full blur-[1.5px]" />
              </div>
            </>
          )}
        </div>

        {/* Glassmorphic Floating Card */}
        <div
          className={`w-full ${
            viewMode === 'register' ? 'max-w-[500px]' : 'max-w-[420px]'
          } rounded-[26px] bg-[#0a0f1d]/90 backdrop-blur-2xl border ${
            viewMode === 'blocked'
              ? 'border-red-500/40 shadow-[0_20px_70px_rgba(220,38,38,0.3)]'
              : 'border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.06),0_0_40px_rgba(0,210,255,0.06)]'
          } p-5 sm:p-6 pt-9 sm:pt-10 text-center relative transition-all duration-300 my-auto`}
        >
          {/* HOLAT 1: QURILMA BLOKLANDI */}
          {viewMode === 'blocked' && (
            <div className="animate-in fade-in zoom-in-95 duration-300 py-3 text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-1">
                <AlertTriangle size={36} className="text-red-400 animate-bounce" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-red-400 tracking-tight">
                  {t.auth.blockedTitle}
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed px-2">
                  {t.auth.blockedDesc}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-left text-[11px] text-red-300 font-mono space-y-1">
                <p><b>{t.auth.deviceLabel}</b> {deviceId || 'aniqlanmoqda'}</p>
                <p><b>Holat:</b> {t.auth.permanentBlock}</p>
                {blockReason && <p className="text-rose-200"><b>Sabab:</b> {blockReason}</p>}
              </div>

              <p className="text-[11px] text-slate-400">
                {t.auth.blockedAdminContact}
              </p>
            </div>
          )}

          {/* STANDART Sarlavha (Bloklanmagan bo'lsa) */}
          {viewMode !== 'blocked' && (
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#38bdf8] via-[#00d2ff] to-[#60a5fa] bg-clip-text text-transparent">
                SIS Corpartion
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-normal tracking-wide">
                {viewMode === 'register'
                  ? t.auth.registerSubtitle
                  : t.auth.loginSubtitle}
              </p>
            </div>
          )}

          {/* Success Bildirishnomasi */}
          {successMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
              <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Xatolik Bildirishnomasi */}
          {errorMsg && (
            <div className="mb-3 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
              <ShieldAlert size={15} className="text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. LOGIN SHAKLI: Faqat Login va Parol so'raladi (2-rasm talabi) */}
          {viewMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3 text-left animate-in fade-in duration-200">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <User size={13} className="text-cyan-400" /> {t.auth.loginLabel}
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={t.auth.loginPlaceholder}
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-sm font-medium tracking-wide focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-cyan-400" /> {t.auth.passwordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder}
                    className="w-full pl-3.5 pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Xatolik sanagichi indikatori */}
              {failedAttempts > 0 && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 flex items-center justify-between font-mono">
                  <span>Xato urinishlar:</span>
                  <span className="font-bold text-red-400">{failedAttempts} / {maxAttempts}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] py-0.5">
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30 accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-slate-400 hover:text-slate-300">{t.auth.rememberMe}</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert(t.auth.forgotPasswordAlert)}
                  className="text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  {t.auth.forgotPassword}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#00d2ff] via-[#0092ff] to-[#006aff] shadow-[0_4px_20px_rgba(0,180,255,0.48),0_0_10px_rgba(0,180,255,0.35)] hover:shadow-[0_4px_28px_rgba(0,210,255,0.7)] hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{t.auth.loginBtn}</span>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                {t.auth.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setViewMode('register');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
                >
                  {t.auth.goToRegister}
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTRATSIYA SHAKLI: Ism, Login, Universitet, Gmail, Telefon, Jinsi, Parol */}
          {viewMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5 text-left animate-in fade-in duration-200">
              
              {/* Ism Familiya */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <User size={13} className="text-cyan-400" /> {t.auth.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder={t.auth.fullNamePlaceholder}
                  className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
              </div>

              {/* Yangi Login va Jinsi (2 ustun) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <AtSign size={13} className="text-cyan-400" /> {t.auth.newLogin}
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    placeholder={t.auth.newLoginPlaceholder}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    {t.auth.gender}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 h-[36px] sm:h-[40px]">
                    <button
                      type="button"
                      onClick={() => setRegGender('erkak')}
                      className={`h-full rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        regGender === 'erkak'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-[#111927]/90 border-slate-700/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{t.auth.male}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegGender('ayol')}
                      className={`h-full rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        regGender === 'ayol'
                          ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-sm'
                          : 'bg-[#111927]/90 border-slate-700/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{t.auth.female}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Universitet (OTM): 1-rasm talabi bo'yicha Tatu, Milliy, Moliya, Alfraganus, Amaliy, ToshMI dan bittasini tanlaydi */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-cyan-400" /> {t.auth.university}
                </label>
                <div className="relative">
                  <select
                    required
                    value={regUniversity}
                    onChange={(e) => setRegUniversity(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#111927]/95 border border-slate-700/60 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner appearance-none cursor-pointer pr-10"
                  >
                    {MAIN_UNIVERSITIES.map((uni, idx) => (
                      <option key={idx} value={uni} className="bg-[#0b1329] text-slate-100 py-1.5">
                        {uni}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Gmail va Telefon raqam (2 ustun) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail size={13} className="text-cyan-400" /> {t.auth.email}
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={t.auth.emailPlaceholder}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone size={13} className="text-cyan-400" /> {t.auth.phone}
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => handlePhoneChange(e.target.value, setRegPhone)}
                    placeholder={t.auth.phonePlaceholder}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Yangi Parol va Parolni tasdiqlash (2 ustun) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <KeyRound size={13} className="text-cyan-400" /> {t.auth.newPassword}
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={t.auth.newPasswordPlaceholder}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock size={13} className="text-cyan-400" /> {t.auth.confirmPassword}
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Parolni ko'rsatish/yashirish */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {showRegPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showRegPassword ? t.auth.hidePassword : t.auth.showPassword}</span>
                </button>
              </div>

              {/* Registratsiya tugmasi */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#00d2ff] via-[#0092ff] to-[#006aff] shadow-[0_4px_20px_rgba(0,180,255,0.48)] hover:shadow-[0_4px_28px_rgba(0,210,255,0.7)] transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>{t.auth.registerBtn}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-slate-400">
                {t.auth.haveAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setViewMode('login');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  {t.auth.goToLogin}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Subtle Bottom Ambient Metallic Wave Ribbons */}
      <div className="absolute bottom-0 left-0 w-full h-14 pointer-events-none overflow-hidden opacity-25 z-10">
        <svg
          className="w-full h-full text-amber-500/20 fill-none stroke-current"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 C320,80 500,10 800,45 C1100,75 1250,20 1440,55"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <path
            d="M0,65 C280,20 600,70 950,30 C1200,60 1350,15 1440,40"
            strokeWidth="1"
            strokeOpacity="0.25"
          />
        </svg>
      </div>

      {/* Footer */}
      <footer className="w-full py-2 text-center text-[10px] sm:text-xs text-slate-500 border-t border-slate-900/60 z-20 shrink-0">
        <p>&copy; {new Date().getFullYear()} TalabaAI - SIS Corpartion. {t.auth.copyright}</p>
      </footer>
    </div>
  );
}
