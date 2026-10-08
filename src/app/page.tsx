'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PresentationGenerator from '@/components/PresentationGenerator';
import MustaqilIshGenerator from '@/components/MustaqilIshGenerator';
import SmartResearch from '@/components/SmartResearch';
import ProjectsHistory from '@/components/ProjectsHistory';
import StudentMessenger from '@/components/StudentMessenger';
import ContactsManager from '@/components/ContactsManager';
import DarsxonaRoom from '@/components/DarsxonaRoom';
import SettingsManager from '@/components/SettingsManager';
import VideoCoursesManager from '@/components/VideoCoursesManager';
import GuestPromoBanner from '@/components/GuestPromoBanner';
import ApiKeyModal from '@/components/ApiKeyModal';
import AuthModal from '@/components/AuthModal';
import {
  UserProfile,
  PresentationProject,
  MustaqilIshProject,
  ResearchResult,
  NavTab,
} from '@/types';
import { GraduationCap, Heart, Search, Crown, Star, Zap, User, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('darslar');

  // Modallar
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Foydalanuvchi profili
  const [user, setUser] = useState<UserProfile>({
    name: 'Talaba',
    email: '',
    university: "Toshkent axborot texnologiyalari universiteti",
    faculty: "Axborot texnologiyalari",
    group: "304-guruh",
    tokens: 10,
    plan: 'free',
    isLoggedIn: false,
  });

  // Saqlangan loyihalar
  const [presentations, setPresentations] = useState<PresentationProject[]>([]);
  const [mustaqilIshlar, setMustaqilIshlar] = useState<MustaqilIshProject[]>([]);
  const [researches, setResearches] = useState<ResearchResult[]>([]);

  // Dastlabki yuklash va Server bilan sinxronizatsiya
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('talaba_user_profile');
      let currentProfile: UserProfile = {
        name: 'Talaba',
        email: '',
        university: "Toshkent axborot texnologiyalari universiteti",
        faculty: "Axborot texnologiyalari",
        group: "304-guruh",
        tokens: 10,
        plan: 'free',
        isLoggedIn: false,
      };

      if (savedUser) {
        currentProfile = { ...currentProfile, ...JSON.parse(savedUser) };
      }
      setUser(currentProfile);

      // Server bilan sinxronizatsiya (FAQAT haqiqiy kirgan foydalanuvchilar uchun)
      if (currentProfile.isLoggedIn && (currentProfile.id || currentProfile.phone)) {
        syncWithServer(currentProfile);
      }
    } catch (e) {
      console.warn("LocalStorage o'qishda xatolik:", e);
    }
  }, []);

  // Foydalanuvchi o'zgarganda yoki tizimga kirganda FAQAT uning shaxsiy loyihalarini yuklash
  useEffect(() => {
    try {
      if (!user.isLoggedIn) {
        setPresentations([]);
        setMustaqilIshlar([]);
        setResearches([]);
        return;
      }

      const userKey = user.id || user.phone || user.email || 'guest';
      const isSamandar = user.name?.toLowerCase().includes('samandar') || user.phone?.includes('912174579');

      // 1. Taqdimotlar (Slaydlar)
      const pKey = `talaba_presentations_${userKey}`;
      const savedPres = localStorage.getItem(pKey);
      if (savedPres) {
        setPresentations(JSON.parse(savedPres));
      } else {
        // Eski umumiy ma'lumotlar faqat Samandarga tegishli bo'lsa migratsiya qilamiz, yangi foydalanuvchiga esa 0
        const legacyPres = localStorage.getItem('talaba_presentations');
        if (legacyPres && isSamandar) {
          localStorage.setItem(pKey, legacyPres);
          localStorage.removeItem('talaba_presentations');
          setPresentations(JSON.parse(legacyPres));
        } else {
          setPresentations([]);
        }
      }

      // 2. Mustaqil ishlar
      const mKey = `talaba_mustaqil_ishlar_${userKey}`;
      const savedMustaqil = localStorage.getItem(mKey);
      if (savedMustaqil) {
        setMustaqilIshlar(JSON.parse(savedMustaqil));
      } else {
        const legacyMustaqil = localStorage.getItem('talaba_mustaqil_ishlar');
        if (legacyMustaqil && isSamandar) {
          localStorage.setItem(mKey, legacyMustaqil);
          localStorage.removeItem('talaba_mustaqil_ishlar');
          setMustaqilIshlar(JSON.parse(legacyMustaqil));
        } else {
          setMustaqilIshlar([]);
        }
      }

      // 3. Research qidiruvlari
      const rKey = `talaba_researches_${userKey}`;
      const savedResearch = localStorage.getItem(rKey);
      if (savedResearch) {
        setResearches(JSON.parse(savedResearch));
      } else {
        const legacyResearch = localStorage.getItem('talaba_researches');
        if (legacyResearch && isSamandar) {
          localStorage.setItem(rKey, legacyResearch);
          localStorage.removeItem('talaba_researches');
          setResearches(JSON.parse(legacyResearch));
        } else {
          setResearches([]);
        }
      }
    } catch (e) {
      console.warn("Foydalanuvchi loyihalarini yuklashda xatolik:", e);
    }
  }, [user.isLoggedIn, user.id, user.phone, user.email]);

  // Yashirin Heart bosish hisoblagichi
  const heartClicksRef = React.useRef(0);
  const lastHeartClickRef = React.useRef(0);
  const handleHeartClick = () => {
    const now = Date.now();
    if (now - lastHeartClickRef.current < 2500) {
      heartClicksRef.current += 1;
    } else {
      heartClicksRef.current = 1;
    }
    lastHeartClickRef.current = now;
    if (heartClicksRef.current >= 3) {
      heartClicksRef.current = 0;
      window.location.href = '/secret-admin-console';
    }
  };

  const logoClicksRef = React.useRef<number>(0);
  const lastLogoClickRef = React.useRef<number>(0);
  const handleSecretLogoClick = () => {
    const now = Date.now();
    if (now - lastLogoClickRef.current < 1200) {
      logoClicksRef.current += 1;
    } else {
      logoClicksRef.current = 1;
    }
    lastLogoClickRef.current = now;
    if (logoClicksRef.current >= 9) {
      logoClicksRef.current = 0;
      window.location.href = '/secret-admin-console';
    }
  };

  // Yashirin Admin klaviatura kombinatsiyalari (Alt + A, Ctrl + Alt + A, yoki 'admin' so'zini terish)
  useEffect(() => {
    let keyBuffer = '';
    let bufferTimer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Alt + A yoki Ctrl + Alt + A
      if (
        (e.altKey && (e.key === 'a' || e.key === 'A')) ||
        (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))
      ) {
        e.preventDefault();
        window.location.href = '/secret-admin-console';
        return;
      }

      // Agar input yoki textarea da yozayotgan bo'lmasa, 'admin' terishni tekshiramiz
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key && e.key.length === 1) {
        keyBuffer += e.key.toLowerCase();
        clearTimeout(bufferTimer);
        bufferTimer = setTimeout(() => {
          keyBuffer = '';
        }, 2500);

        if (keyBuffer.endsWith('admin') || keyBuffer.endsWith('secret')) {
          keyBuffer = '';
          window.location.href = '/secret-admin-console';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(bufferTimer);
    };
  }, []);

  // Server bilan profilni tekshirish
  const syncWithServer = async (profile: UserProfile) => {
    // Agar foydalanuvchi login qilmagan bo'lsa yoki ID/telefoni bo'lmasa, serverdan hech narsa so'ralmaydi
    if (!profile.isLoggedIn || (!profile.id && !profile.phone)) {
      return;
    }

    try {
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          university: profile.university,
          faculty: profile.faculty,
          group: profile.group,
          telegramUsername: profile.telegramUsername,
          plan: profile.plan,
          tokens: profile.tokens,
          isLoggedIn: profile.isLoggedIn,
        }),
      });
      const data = await res.json();
      const syncedUser = data.user || data.profile;

      // Agar serverda foydalanuvchi bloklangan bo'lsa yoki topilmasa -> tizimdan chiqaramiz
      if (data.isGuest || !syncedUser || syncedUser.isBlocked) {
        if (syncedUser?.isBlocked) {
          alert('DIQQAT: Sizning hisobingiz admin tomonidan bloklangan.');
        }
        handleLogout();
        return;
      }

      if (data.success && syncedUser) {
        const updated: UserProfile = {
          ...profile,
          id: syncedUser.id,
          name: syncedUser.name || profile.name,
          email: syncedUser.email || profile.email,
          phone: syncedUser.phone || profile.phone,
          university: syncedUser.university || profile.university,
          faculty: syncedUser.faculty || profile.faculty,
          group: syncedUser.group || profile.group,
          telegramUsername: syncedUser.telegramUsername || profile.telegramUsername,
          plan: syncedUser.plan || profile.plan || 'free',
          tokens: syncedUser.tokens ?? profile.tokens,
          isBlocked: false,
          isLoggedIn: true,
        };
        setUser(updated);
        localStorage.setItem('talaba_user_profile', JSON.stringify(updated));
      }
    } catch (_err) {
      // Tarmoq xatosi bo'lsa mahalliy holatda davom etadi
    }
  };

  // Profilni saqlash
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUser(newProfile);
    localStorage.setItem('talaba_user_profile', JSON.stringify(newProfile));
    if (newProfile.isLoggedIn && (newProfile.id || newProfile.phone)) {
      syncWithServer(newProfile);
    }
  };

  // Akkountdan chiqish
  const handleLogout = () => {
    const guestUser: UserProfile = {
      name: 'Talaba',
      email: '',
      university: "Toshkent axborot texnologiyalari universiteti",
      faculty: "Axborot texnologiyalari",
      group: "304-guruh",
      tokens: 10,
      plan: 'free',
      isLoggedIn: false,
    };
    setUser(guestUser);
    localStorage.setItem('talaba_user_profile', JSON.stringify(guestUser));
    setPresentations([]);
    setMustaqilIshlar([]);
    setResearches([]);
  };

  const getUserKey = () => user.isLoggedIn && (user.id || user.phone || user.email) ? (user.id || user.phone || user.email) : 'guest';

  // Taqdimotni saqlash
  const handleSavePresentation = (p: PresentationProject) => {
    setPresentations((prev) => {
      const filtered = prev.filter((item) => item.id !== p.id);
      const updated = [p, ...filtered];
      localStorage.setItem(`talaba_presentations_${getUserKey()}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Mustaqil ishni saqlash
  const handleSaveMustaqilIsh = (m: MustaqilIshProject) => {
    setMustaqilIshlar((prev) => {
      const filtered = prev.filter((item) => item.id !== m.id);
      const updated = [m, ...filtered];
      localStorage.setItem(`talaba_mustaqil_ishlar_${getUserKey()}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Qidiruvni saqlash
  const handleSaveResearch = (r: ResearchResult) => {
    setResearches((prev) => {
      const filtered = prev.filter((item) => item.id !== r.id);
      const updated = [r, ...filtered];
      localStorage.setItem(`talaba_researches_${getUserKey()}`, JSON.stringify(updated));
      return updated;
    });
  };

  // O'chirish amallari
  const handleDeletePresentation = (id: string) => {
    setPresentations((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem(`talaba_presentations_${getUserKey()}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteMustaqilIsh = (id: string) => {
    setMustaqilIshlar((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem(`talaba_mustaqil_ishlar_${getUserKey()}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteResearch = (id: string) => {
    setResearches((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem(`talaba_researches_${getUserKey()}`, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar (Desktop suzuvchi dock va Mobil yuqori/pastki panellar) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onOpenAuth={() => { window.location.href = '/login'; }}
        onLogout={handleLogout}
        user={user}
      />

      {/* Desktop Top Header (2-rasmdagi uslubda faqat katta ekranda) */}
      {user.isLoggedIn ? (
        <div className="hidden lg:block lg:pl-28 pr-6 pt-3.5 pb-2">
          <div className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 shadow-xl">
            {/* Chap: Salomlashuv va ta'rif (2-rasm uslubida) */}
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Assalomu alaykum, {user.name.split(' ')[0]} 👋
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                TalabaAI bilan bugungi darslar va topshiriqlaringiz tayyor
              </p>
            </div>

            {/* O'ng: Qidiruv, Tokenlar va Profil */}
            <div className="flex items-center gap-3">
              {/* Tezkor qidiruv */}
              <div className="relative w-64 xl:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Darslar, mavzular yoki kontaktlar..."
                  className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-all shadow-inner"
                />
              </div>

              {/* Tokenlar ko'rsatkichi */}
              {user.plan === 'ultra' ? (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-purple-500/15 border border-purple-500/35 text-purple-200 text-xs font-bold shadow-md shadow-purple-500/10">
                  <Crown size={15} className="text-amber-300 fill-amber-300" />
                  <span>Ultra VIP (Cheksiz)</span>
                </div>
              ) : user.plan === 'premium' ? (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-bold shadow-md shadow-amber-500/10">
                  <Star size={15} className="text-amber-400 fill-amber-400" />
                  <span>Premium ({user.tokens ?? 100} token)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-medium">
                  <Zap size={15} className="text-indigo-400 fill-indigo-400/30" />
                  <span>{user.tokens ?? 10} bepul token</span>
                </div>
              )}

              {/* Profil */}
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                <div className="w-6 h-6 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[11px]">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="truncate max-w-[120px]">{user.name}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Guest Header (Desktop) */
        <div className="hidden lg:block w-full max-w-6xl mx-auto px-4 pt-6 pb-2">
          <div className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-xl">
            <div
              onClick={handleSecretLogoClick}
              className="flex items-center gap-3 cursor-pointer group select-none"
              title="TalabaAI (Admin: 9 marta bosing)"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="text-indigo-400 group-hover:text-purple-300 transition-colors" size={22} />
                </div>
              </div>
              <div>
                <h1 className="font-black text-white text-lg tracking-tight leading-none group-hover:text-indigo-200 transition-colors">
                  Talaba<span className="text-indigo-400">AI</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  O‘zbekiston Talabalari Uchun Ta‘lim Platformasi
                </p>
              </div>
            </div>

            <button
              onClick={() => { window.location.href = '/login'; }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <User size={15} />
              <span>Tizimga Kirish / Ro‘yxatdan O‘tish</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${user.isLoggedIn ? 'lg:pl-28 lg:pr-6 pb-16 lg:pb-8' : 'w-full px-2 sm:px-4 pb-12'}`}>
        {/* Agar foydalanuvchi tizimga kirmagan bo'lsa va darslar, darsxona, guruhlar yoki kontaktlar bo'limida bo'lsa -> Reklama va ro'yxatdan o'tish qo'llanmasi */}
        {!user.isLoggedIn && ['darslar', 'darsxona', 'groups', 'messenger', 'contacts'].includes(activeTab) ? (
          <GuestPromoBanner
            activeTab={activeTab}
            onOpenLogin={() => {
              window.location.href = '/login';
            }}
          />
        ) : (
          <>
            {activeTab === 'darslar' && (
              <VideoCoursesManager
                user={user}
                onOpenAuth={() => { window.location.href = '/login'; }}
              />
            )}

            {activeTab === 'darsxona' && (
              <DarsxonaRoom
                user={user}
                onOpenAuth={() => { window.location.href = '/login'; }}
                onNavigateToGroups={() => setActiveTab('groups')}
              />
            )}

            {(activeTab === 'groups' || activeTab === 'messenger') && (
              <StudentMessenger
                user={user}
                onOpenAuth={() => setIsAuthOpen(true)}
                onNavigateToDarsxona={() => setActiveTab('darsxona')}
              />
            )}

            {activeTab === 'contacts' && (
              <ContactsManager
                user={user}
                onOpenAuth={() => { window.location.href = '/login'; }}
              />
            )}
          </>
        )}

        {activeTab === 'settings' && (
          <SettingsManager
            user={user}
            onSaveProfile={handleSaveProfile}
            onLogout={handleLogout}
            onOpenApiKeyModal={() => setIsApiKeyOpen(true)}
          />
        )}

        {activeTab === 'presentation' && (
          <PresentationGenerator
            user={user}
            existingProjectsCount={presentations.length}
            onSaveProject={handleSavePresentation}
          />
        )}

        {activeTab === 'mustaqil' && (
          <MustaqilIshGenerator
            user={user}
            existingProjectsCount={mustaqilIshlar.length}
            onSaveProject={handleSaveMustaqilIsh}
          />
        )}

        {activeTab === 'research' && (
          <SmartResearch
            onSendToPresentation={(_topic) => {
              setActiveTab('presentation');
            }}
            onSendToMustaqilIsh={(_topic) => {
              setActiveTab('mustaqil');
            }}
            onSaveResult={handleSaveResearch}
          />
        )}

        {activeTab === 'history' && (
          <ProjectsHistory
            presentations={presentations}
            mustaqilIshlar={mustaqilIshlar}
            researches={researches}
            onOpenPresentation={() => setActiveTab('presentation')}
            onOpenMustaqilIsh={() => setActiveTab('mustaqil')}
            onDeletePresentation={handleDeletePresentation}
            onDeleteMustaqilIsh={handleDeleteMustaqilIsh}
            onDeleteResearch={handleDeleteResearch}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500 ${user.isLoggedIn ? 'lg:pl-28 lg:pr-6 pb-24 lg:pb-8' : 'w-full px-4 pb-8'}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <GraduationCap size={16} className="text-indigo-400" />
            <span className="font-semibold text-white">TalabaAI</span> — Talabalar uchun Gamma va Mustaqil ish generatori
          </div>
          <p className="flex items-center justify-center gap-1 text-slate-400 select-none">
            O‘zbekiston talabalari uchun mehr bilan yaratildi{' '}
            <span
              onClick={handleHeartClick}
              className="inline-flex cursor-pointer hover:scale-125 transition-transform p-0.5"
            >
              <Heart size={14} className="text-pink-500 fill-pink-500" />
            </span>
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsApiKeyOpen(true)} className="hover:text-white transition-colors">
              API Sozlamalari
            </button>
            <span>•</span>
            <button onClick={() => setIsAuthOpen(true)} className="hover:text-white transition-colors">
              Profil
            </button>
          </div>
        </div>
      </footer>

      {/* Modallar */}
      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onSaveProfile={handleSaveProfile}
        onLogout={handleLogout}
      />
    </div>
  );
}
