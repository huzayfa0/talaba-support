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
  Send,
  Lock,
  Phone,
  User,
  KeyRound,
  RotateCw,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '@/types';

type AuthViewMode = 'login_phone' | 'login_password' | 'reg_info' | 'reg_otp' | 'reg_password' | 'blocked';

export default function LoginPage() {
  const router = useRouter();

  // Qurilma ID va holatlar
  const [deviceId, setDeviceId] = useState<string>('');
  const [viewMode, setViewMode] = useState<AuthViewMode>('login_phone');

  // Login formasi
  const [loginPhone, setLoginPhone] = useState<string>('+998 ');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginUserName, setLoginUserName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Xatoliklar va urinishlar soni
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [maxAttempts, setMaxAttempts] = useState<number>(20);
  const [blockReason, setBlockReason] = useState<string>('');

  // Ro'yxatdan o'tish formasi
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('+998 ');
  const [regTelegram, setRegTelegram] = useState<string>('');
  const [regOtpCode, setRegOtpCode] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [botUsername, setBotUsername] = useState<string>('darsliklar_ai_bot');
  const [otpTimer, setOtpTimer] = useState<number>(300); // 5 daqiqa
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);

  // Xabarlar va yuklanish
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Qurilma bloklanganligini tekshirish
  useEffect(() => {
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

  // OTP Timer sanagichi
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewMode === 'reg_otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewMode, otpTimer]);

  // Telefon raqami formatlash
  const handlePhoneChange = (val: string, setter: (v: string) => void) => {
    if (!val.startsWith('+998')) {
      setter('+998 ');
      return;
    }
    setter(val);
  };

  // 1. LOGIN: Telefon raqamini tekshirish (1-bosqich)
  const handleLoginPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (loginPhone.replace(/[^0-9]/g, '').length < 9) {
      setErrorMsg('Iltimos, to‘liq telefon raqamingizni kiriting');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: loginPhone,
          deviceId,
          checkOnlyPhone: true,
        }),
      });

      const data = await res.json();

      if (data.isBlocked) {
        localStorage.setItem('talaba_device_blocked', 'true');
        setViewMode('blocked');
        setBlockReason(data.error);
        return;
      }

      if (data.exists) {
        setLoginUserName(data.userName || '');
        setViewMode('login_password');
      } else {
        // Agar topilmasa, to'g'ridan-to'g'ri ro'yxatdan o'tishni taklif qilamiz
        setRegPhone(loginPhone);
        setErrorMsg('Bu telefon raqam topilmadi. Ro‘yxatdan o‘tish oynasiga yo‘naltirilmoqdasiz...');
        setTimeout(() => {
          setViewMode('reg_info');
          setErrorMsg(null);
        }, 1200);
      }
    } catch {
      setErrorMsg('Server bilan aloqada xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // 2. LOGIN: Parolni tekshirish (2-bosqich)
  const handleLoginPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

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
          phone: loginPhone,
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
        setErrorMsg(data.error || 'Parol noto‘g‘ri kiritildi');
        return;
      }

      // Muvaffaqiyatli kirish!
      const user: UserProfile = data.user;
      localStorage.setItem('talaba_user_profile', JSON.stringify(user));
      setSuccessMsg(`Xush kelibsiz, ${user.name}! Bosh sahifaga yo‘naltirilmoqda...`);

      setTimeout(() => {
        router.push('/');
      }, 800);
    } catch {
      setErrorMsg('Tizimga kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // 3. REGISTRATSIYA: Telegramga OTP kod yuborish (1-bosqich)
  const handleSendTelegramOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Iltimos, ismingizni kiriting');
      return;
    }

    if (regPhone.replace(/[^0-9]/g, '').length < 9) {
      setErrorMsg('Iltimos, to‘liq telefon raqamingizni kiriting');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: regPhone,
          telegramUsername: regTelegram,
          deviceId,
        }),
      });

      const data = await res.json();

      if (data.isBlocked) {
        setViewMode('blocked');
        setBlockReason(data.error);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Tasdiqlash kodini yuborib bo‘lmadi');
        return;
      }

      setBotUsername(data.botUsername || 'TalabaAIBot');
      if (data.demoCode) {
        setDemoCodeNotice(`Tasdiqlash kodi: ${data.demoCode}`);
      }

      setSuccessMsg(data.message || 'Tasdiqlash kodi Telegramga yuborildi!');
      setOtpTimer(300);
      setViewMode('reg_otp');
    } catch {
      setErrorMsg('Telegram serveriga ulanishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // 4. REGISTRATSIYA: Kodni tekshirish (2-bosqich)
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (regOtpCode.trim().length !== 4) {
      setErrorMsg('Tasdiqlash kodi 4 ta raqamdan iborat bo‘lishi kerak');
      return;
    }

    // Kod to'g'ri ko'rinishda bo'lsa, parol o'rnatish bosqichiga o'tamiz
    setViewMode('reg_password');
  };

  // 5. REGISTRATSIYA: Parol o'rnatish va akkountni yakunlash (3-bosqich)
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword.length < 4) {
      setErrorMsg('Parol kamida 4 ta belgidan iborat bo‘lishi kerak');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Kiritilgan ikkala parol bir-biriga mos kelmadi');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: regPhone,
          code: regOtpCode.trim(),
          name: regName.trim(),
          password: regPassword,
          telegramUsername: regTelegram,
          deviceId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Akkountni tasdiqlashda xatolik yuz berdi');
        if (data.error && data.error.includes('kod')) {
          setViewMode('reg_otp');
        }
        return;
      }

      const user: UserProfile = data.user;
      localStorage.setItem('talaba_user_profile', JSON.stringify(user));
      setSuccessMsg('Muvaffaqiyatli ro‘yxatdan o‘tdingiz! Bosh sahifaga yo‘naltirilmoqda...');

      setTimeout(() => {
        router.push('/');
      }, 900);
    } catch {
      setErrorMsg('Ro‘yxatdan o‘tishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Format timer (mm:ss)
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#030712] text-slate-100 flex flex-col justify-between relative selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar Header */}
      <header className="w-full px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between z-30 relative max-w-7xl mx-auto shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all backdrop-blur-md active:scale-95 group shadow-sm"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-cyan-400" />
          <span>Bosh sahifaga qaytish</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">TalabaAI Xavfsiz Tizim</span>
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-2 z-20 w-full max-w-7xl mx-auto">
        
        {/* Floating 3D Glowing Sphere / Orb (No clipping, natural glowing aura) */}
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
          className={`w-full max-w-[400px] sm:max-w-[420px] rounded-[26px] bg-[#0a0f1d]/85 backdrop-blur-2xl border ${
            viewMode === 'blocked' ? 'border-red-500/40 shadow-[0_20px_70px_rgba(220,38,38,0.3)]' : 'border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.06),0_0_40px_rgba(0,210,255,0.06)]'
          } p-5 sm:p-6 pt-9 sm:pt-10 text-center relative transition-all duration-300`}
        >
          {/* HOLAT 1: QURILMA BLOKLANDI (20 marta xatodan so'ng) */}
          {viewMode === 'blocked' && (
            <div className="animate-in fade-in zoom-in-95 duration-300 py-3 text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-1">
                <AlertTriangle size={36} className="text-red-400 animate-bounce" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-red-400 tracking-tight">
                  Qurilma Bloklandi!
                </h2>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed px-2">
                  Xavfsizlik talablariga muvofiq, ketma-ket <b>20 marta</b> noto‘g‘ri parol kiritilgani sababli ushbu qurilma orqali saytga kirish butunlay to‘xtatildi.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-left text-[11px] text-red-300 font-mono space-y-1">
                <p><b>Qurilma ID:</b> {deviceId || 'aniqlanmoqda'}</p>
                <p><b>Holat:</b> Doimiy avto-blok (Permanent Block)</p>
                {blockReason && <p className="text-rose-200"><b>Sabab:</b> {blockReason}</p>}
              </div>

              <p className="text-[11px] text-slate-400">
                Blokdan chiqarish uchun platforma ma’muriyatiga (Admin) murojaat qiling.
              </p>
            </div>
          )}

          {/* STANDART Sarlavha (Bloklanmagan bo'lsa) */}
          {viewMode !== 'blocked' && (
            <div className="mb-3 sm:mb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#38bdf8] via-[#00d2ff] to-[#60a5fa] bg-clip-text text-transparent">
                SIS Corpartion
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-normal tracking-wide">
                {viewMode.startsWith('reg_')
                  ? 'Telegram orqali xavfsiz ro‘yxatdan o‘tish'
                  : 'Xush kelibsiz! Tizimga kiring.'}
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

          {/* Test rejimida demo kod ko'rsatgichi */}
          {demoCodeNotice && viewMode === 'reg_otp' && (
            <div className="mb-3 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[11px] flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>{demoCodeNotice}</span>
            </div>
          )}

          {/* 1. LOGIN: Telefon raqamini kiritish bosqichi */}
          {viewMode === 'login_phone' && (
            <form onSubmit={handleLoginPhoneSubmit} className="space-y-3 text-left animate-in fade-in duration-200">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone size={13} className="text-cyan-400" /> Telefon raqamingiz
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  value={loginPhone}
                  onChange={(e) => handlePhoneChange(e.target.value, setLoginPhone)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-sm font-medium tracking-wide focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#00d2ff] via-[#0092ff] to-[#006aff] shadow-[0_4px_20px_rgba(0,180,255,0.48),0_0_10px_rgba(0,180,255,0.35)] hover:shadow-[0_4px_28px_rgba(0,210,255,0.7)] hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Davom etish</span>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Akkountingiz yo‘qmi?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setRegPhone(loginPhone);
                    setViewMode('reg_info');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
                >
                  Ro‘yxatdan o‘tish
                </button>
              </div>
            </form>
          )}

          {/* 2. LOGIN: Parol kiritish bosqichi */}
          {viewMode === 'login_password' && (
            <form onSubmit={handleLoginPasswordSubmit} className="space-y-3 text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                <span className="text-slate-400 font-mono">{loginPhone}</span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setViewMode('login_phone');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold"
                >
                  O‘zgartirish
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-cyan-400" /> Parolingizni kiriting
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Parol"
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
                  <span className="text-slate-400 hover:text-slate-300">Eslab qolish</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert('Parolni unutgan bo‘lsangiz, Telegram orqali qayta ro‘yxatdan o‘tishingiz yoki yangi parol o‘rnatishingiz mumkin.')}
                  className="text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  Parolni unutdingizmi?
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
                  <span>Kirish</span>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Boshqa raqam bilan kirish:{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('login_phone')}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  Orqaga
                </button>
              </div>
            </form>
          )}

          {/* 3. REGISTRATSIYA 1-QADAM: Ism, Telefon, Telegram */}
          {viewMode === 'reg_info' && (
            <form onSubmit={handleSendTelegramOtp} className="space-y-2.5 text-left animate-in fade-in duration-200">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <User size={13} className="text-cyan-400" /> To‘liq F.I.Sh (Talaba ismi)
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Masalan: Sardor Aliyev"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone size={13} className="text-cyan-400" /> Telefon raqam
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => handlePhoneChange(e.target.value, setRegPhone)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Send size={13} className="text-cyan-400" /> Telegram Username (yoki ID)
                </label>
                <input
                  type="text"
                  value={regTelegram}
                  onChange={(e) => setRegTelegram(e.target.value)}
                  placeholder="@telegram_user"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner font-mono"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#00d2ff] via-[#0092ff] to-[#006aff] shadow-[0_4px_20px_rgba(0,180,255,0.48)] hover:shadow-[0_4px_28px_rgba(0,210,255,0.7)] transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Telegramga kod yuborish</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-slate-400">
                Akkountingiz bormi?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setViewMode('login_phone');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  Kirish
                </button>
              </div>
            </form>
          )}

          {/* 4. REGISTRATSIYA 2-QADAM: OTP Kodni kiritish */}
          {viewMode === 'reg_otp' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-3 text-left animate-in fade-in duration-200">
              <div className="text-center pb-1">
                <p className="text-xs text-slate-300 font-medium">
                  Tasdiqlash kodi yuborildi:
                </p>
                <p className="text-xs text-cyan-400 font-mono mt-0.5 font-bold">
                  {regTelegram ? `@${regTelegram.replace('@', '')}` : regPhone}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 text-center">
                  4 xonali tasdiqlash kodini tering:
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  autoFocus
                  value={regOtpCode}
                  onChange={(e) => setRegOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • •"
                  className="w-full text-center tracking-[0.6em] font-mono text-2xl sm:text-3xl font-extrabold py-2 sm:py-2.5 rounded-xl bg-[#111927]/90 border border-cyan-500/50 text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
              </div>

              {/* Botga to'g'ridan-to'g'ri o'tish tugmasi */}
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/25 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Send size={15} className="text-cyan-400 shrink-0" />
                  <span className="text-slate-300 text-[11px]">Kodni Telegramdan olish:</span>
                </div>
                <a
                  href={`https://t.me/${botUsername}?start=code`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <span>@{botUsername}</span>
                  <ExternalLink size={11} />
                </a>
              </div>

              {/* Taymer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span className="font-mono">Vaqt: {formatTimer(otpTimer)}</span>
                <button
                  type="button"
                  onClick={handleSendTelegramOtp}
                  className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw size={11} /> Qayta kod yuborish
                </button>
              </div>

              <button
                type="submit"
                disabled={regOtpCode.length !== 4}
                className="w-full py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#00d2ff] via-[#0092ff] to-[#006aff] shadow-[0_4px_20px_rgba(0,180,255,0.48)] hover:shadow-[0_4px_28px_rgba(0,210,255,0.7)] transition-all cursor-pointer flex items-center justify-center gap-2 select-none disabled:opacity-50"
              >
                <span>Kodni tasdiqlash</span>
              </button>
            </form>
          )}

          {/* 5. REGISTRATSIYA 3-QADAM: Parol o'rnatish */}
          {viewMode === 'reg_password' && (
            <form onSubmit={handleFinalRegister} className="space-y-3 text-left animate-in fade-in duration-200">
              <div className="text-center pb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 size={12} /> Telegram tasdiqlandi
                </span>
                <p className="text-xs text-slate-300 mt-2 font-medium">
                  Akkountingiz uchun kuchli parol o‘rnating:
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Yangi parol
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Kamida 4 ta belgi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Parolni takrorlang
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Parolni qayta kiriting"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111927]/90 border border-slate-700/60 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-[0_4px_20px_rgba(16,185,129,0.48)] hover:shadow-[0_4px_28px_rgba(16,185,129,0.7)] transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Akkountni faollashtirish va Kirish</span>
                )}
              </button>
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
        <p>&copy; {new Date().getFullYear()} TalabaAI - SIS Corpartion. Barcha huquqlar himoyalangan.</p>
      </footer>
    </div>
  );
}
