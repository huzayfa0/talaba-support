'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Key,
  Shield,
  Crown,
  Star,
  Zap,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut,
  Building2,
  GraduationCap,
  Users2,
  Phone,
  Send,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '@/types';

interface SettingsManagerProps {
  user: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onLogout: () => void;
  onOpenApiKeyModal: () => void;
}

export default function SettingsManager({
  user,
  onSaveProfile,
  onLogout,
  onOpenApiKeyModal,
}: SettingsManagerProps) {
  // Profil ma'lumotlari shakli
  const [name, setName] = useState(user.name || '');
  const [university, setUniversity] = useState(user.university || '');
  const [faculty, setFaculty] = useState(user.faculty || '');
  const [group, setGroup] = useState(user.group || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [telegramUsername, setTelegramUsername] = useState(user.telegramUsername || '');

  // Prop orqali kelgan foydalanuvchi ma'lumotlarini inputlar bilan sinxronlash
  useEffect(() => {
    if (user.name) setName(user.name);
    if (user.university) setUniversity(user.university);
    if (user.faculty) setFaculty(user.faculty);
    if (user.group) setGroup(user.group);
    if (user.phone) setPhone(user.phone);
    if (user.telegramUsername) setTelegramUsername(user.telegramUsername);
  }, [user.name, user.university, user.faculty, user.group, user.phone, user.telegramUsername]);

  // API kalit holati
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('talaba_gemini_api_key') || null;
    }
    return null;
  });

  // Holatlar
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Parol yangilash
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  // Profilni saqlash
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const updatedProfile: UserProfile = {
        ...user,
        name: name.trim() || user.name,
        university: university.trim() || user.university,
        faculty: faculty.trim() || user.faculty,
        group: group.trim() || user.group,
        phone: phone.trim() || user.phone,
        telegramUsername: telegramUsername.trim().replace(/^@/, '') || user.telegramUsername,
      };

      // Darhol mahalliy xotirani yangilaymiz
      localStorage.setItem('talaba_user_profile', JSON.stringify(updatedProfile));
      onSaveProfile(updatedProfile);
      setSaveStatus({ type: 'success', message: 'Profil ma‘lumotlari muvaffaqiyatli saqlandi!' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (_err) {
      setSaveStatus({ type: 'error', message: 'Saqlashda xatolik yuz berdi' });
    } finally {
      setIsSaving(false);
    }
  };

  // API Kalitni saqlash
  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) return;
    localStorage.setItem('talaba_gemini_api_key', apiKeyInput.trim());
    setSavedApiKey(apiKeyInput.trim());
    setApiKeyInput('');
    setSaveStatus({ type: 'success', message: 'Gemini API Kaliti muvaffaqiyatli saqlandi!' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // API Kalitni tozalash
  const handleRemoveApiKey = () => {
    localStorage.removeItem('talaba_gemini_api_key');
    setSavedApiKey(null);
    setSaveStatus({ type: 'success', message: 'API kalit xotiradan o‘chirildi' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* Sarlavha */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <User size={28} className="text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">Sozlamalar & Profil</h1>
              {user.plan === 'ultra' ? (
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/40 flex items-center gap-1">
                  <Crown size={12} className="text-amber-400" /> Ultra VIP
                </span>
              ) : user.plan === 'premium' ? (
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 flex items-center gap-1">
                  <Star size={12} className="text-amber-400" /> Premium
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                  Oddiy (Free)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Shaxsiy ma‘lumotlaringiz, tarifingiz, API kalit va xavfsizlik sozlamalari
            </p>
          </div>
        </div>

        {/* Chiqish tugmasi */}
        <button
          onClick={onLogout}
          className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <LogOut size={15} />
          <span>Akkountdan chiqish</span>
        </button>
      </div>

      {/* Holat bildirishnomasi */}
      {saveStatus && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border shadow-lg ${
            saveStatus.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {saveStatus.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* Grid: Profil va Tarif */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chap blok: Profil ma'lumotlarini tahrirlash (8 col) */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <User size={18} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Talaba Ma‘lumotlari</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ism familiya */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  F.I.SH (Ism familiyangiz)
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Sardor Abdullayev"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Telefon raqam */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Telefon Raqam
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Universitet */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  OTM / Universitet
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Masalan: TATU yoki O‘zMU"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Fakultet */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Fakultet / Yo‘nalish
                </label>
                <div className="relative">
                  <GraduationCap size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    placeholder="Masalan: Dasturiy Injiniring"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
                  />
                </div>
              </div>

              {/* O'quv guruhi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Akademik Guruh
                </label>
                <div className="relative">
                  <Users2 size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="Masalan: 304-guruh"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Telegram username */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Telegram Username
                </label>
                <div className="relative">
                  <Send size={15} className="absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSaving ? 'Saqlanmoqda...' : 'O‘zgarishlarni Saqlash'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* O'ng blok: Tarif va Tokenlar (4 col) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Zap size={18} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white">Tarif & Imtiyozlar</h2>
          </div>

          {/* Tarif kartasi */}
          <div
            className={`p-4 rounded-2xl border ${
              user.plan === 'ultra'
                ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/20 border-purple-500/40 text-purple-200'
                : user.plan === 'premium'
                ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-amber-500/40 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {user.plan === 'ultra' ? '👑 ULTRA VIP' : user.plan === 'premium' ? '⭐ PREMIUM' : 'ODDIY (FREE)'}
              </span>
              <span className="text-xs font-mono font-bold">
                {user.plan === 'ultra' ? '∞ Cheksiz' : `${user.tokens ?? 10} token`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              {user.plan === 'ultra'
                ? 'Sizda barcha imkoniyatlar: jonli darsxona, kamera darsi, ekran ulashish, cheksiz slaydlar va mustaqil ishlar faol!'
                : user.plan === 'premium'
                ? '15 tagacha slayd yaratish, mustaqil ishlarni to‘liq yuklab olish va guruhlarga yozish faol.'
                : 'Boshlang‘ich bepul rejim. Cheksiz imkoniyatlar uchun administrator orqali Ultra VIP ga ulaning.'}
            </p>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Gamma uslubidagi slaydlar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>Word (.docx) mustaqil ishlar</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={13}
                  className={user.plan === 'ultra' || user.plan === 'premium' ? 'text-emerald-400 shrink-0' : 'text-slate-600 shrink-0'}
                />
                <span className={user.plan === 'ultra' || user.plan === 'premium' ? '' : 'text-slate-500 line-through'}>
                  Guruhlarda to‘liq yozish
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={13}
                  className={user.plan === 'ultra' ? 'text-purple-400 shrink-0' : 'text-slate-600 shrink-0'}
                />
                <span className={user.plan === 'ultra' ? '' : 'text-slate-500 line-through'}>
                  Jonli Kamera & Ekran Ulashish
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            💡 Tarifni oshirish uchun TalabaAI Telegram boti yoki Administrator bilan bog‘laning.
          </div>
        </div>
      </div>

      {/* Gemini API Kalit va Xavfsizlik bo'limi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini API Kalit sozlamalari */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Key size={18} className="text-amber-400" />
              <h2 className="text-sm font-bold text-white">Gemini AI Kaliti</h2>
            </div>
            {savedApiKey ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Ulangan
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-800 text-slate-400">
                Ulanmagan
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            O‘z shaxsiy Google Gemini API kalitingizni ulab, sun‘iy intellektdan yuqori tezlikda va cheksiz foydalanishingiz mumkin.
          </p>

          <div className="space-y-3">
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={savedApiKey ? '••••••••••••••••••••••••' : 'AIzaSy... kalitini kiriting'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none transition-colors placeholder:text-slate-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput.trim()}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow cursor-pointer"
              >
                Kalitni Saqlash
              </button>

              {savedApiKey && (
                <button
                  type="button"
                  onClick={handleRemoveApiKey}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  O‘chirish
                </button>
              )}

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <span>Kalit olish</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Xavfsizlik & Parol yangilash */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Shield size={18} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Xavfsizlik & Kirish</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Akkountingiz xavfsizligini ta‘minlash uchun yangi parol o‘rnating.
          </p>

          <div className="space-y-3">
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yangi parol (kamida 6 ta belgi)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-white text-xs outline-none transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (newPassword.length < 6) {
                    setPasswordStatus('Parol kamida 6 ta belgidan iborat bo‘lishi kerak');
                  } else {
                    setPasswordStatus('Parol muvaffaqiyatli yangilandi!');
                    setNewPassword('');
                    setTimeout(() => setPasswordStatus(null), 3000);
                  }
                }}
                disabled={!newPassword.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow cursor-pointer"
              >
                Parolni Yangilash
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = '/secret-admin-console';
                }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                title="Admin konsoliga o‘tish"
              >
                Admin Konsol
              </button>
            </div>

            {passwordStatus && (
              <p
                className={`text-xs ${
                  passwordStatus.includes('muvaffaqiyatli') ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {passwordStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
