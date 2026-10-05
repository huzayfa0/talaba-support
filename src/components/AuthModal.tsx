'use client';

import React, { useState } from 'react';
import { User, GraduationCap, Building2, Check, X, Sparkles, BookOpen, LogOut } from 'lucide-react';
import { UserProfile } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onLogout?: () => void;
}

export default function AuthModal({ isOpen, onClose, user, onSaveProfile, onLogout }: AuthModalProps) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [university, setUniversity] = useState(user.university || "O'zbekiston Milliy Universiteti");
  const [faculty, setFaculty] = useState(user.faculty || "Iqtisodiyot va IT");
  const [group, setGroup] = useState(user.group || "210-guruh");
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      id: user.id,
      name: name.trim() || 'Hurmatli Talaba',
      email: email.trim() || 'talaba@edu.uz',
      university,
      faculty,
      group,
      tokens: user.tokens ?? 10,
      plan: user.plan || 'free',
      isLoggedIn: true,
      isBlocked: user.isBlocked,
    });
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap size={26} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Talaba Profili <Sparkles size={16} className="text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Ma'lumotlaringiz "Mustaqil ish" titul varaqalarida avtomatik to‘ldiriladi
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User size={14} className="text-indigo-400" /> To‘liq F.I.Sh. (Talaba ismi)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Abdullayev Temur Shuxrat o‘g‘li"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email yoki Telegram</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="talaba@mail.uz"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Guruhingiz</label>
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Masalan: 304-guruh"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 size={14} className="text-indigo-400" /> Universitet / Institut (OTM)
            </label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Masalan: Toshkent Axborot Texnologiyalari Universiteti (TATU)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-400" /> Fakultet yoki Yo‘nalish
            </label>
            <input
              type="text"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="Masalan: Kiberxavfsizlik fakulteti"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              {saved ? (
                <>
                  <Check size={18} className="text-emerald-300" /> Profil saqlandi!
                </>
              ) : (
                'Profilni Saqlash'
              )}
            </button>

            {user.isLoggedIn && onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <LogOut size={15} /> Akkountdan chiqish
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
