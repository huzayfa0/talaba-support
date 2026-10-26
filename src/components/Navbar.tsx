'use client';

import React, { useRef, useState } from 'react';
import {
  Presentation,
  FileText,
  Search,
  FolderClock,
  Sparkles,
  Key,
  User,
  Zap,
  Crown,
  Star,
  Users,
  LogOut,
  BookUser,
  Radio,
  Settings,
  LayoutGrid,
  Check,
  GraduationCap,
  X,
  Lock,
  UserCheck,
} from 'lucide-react';
import { UserProfile, NavTab, Language } from '@/types';
import { TRANSLATIONS } from '@/lib/translations';
import ThemeLanguageSwitcher from '@/components/ThemeLanguageSwitcher';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenApiKey: () => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  user: UserProfile;
  lang?: Language;
  currentTheme?: 'dark' | 'light';
  onThemeToggle?: () => void;
  onLangChange?: (lang: Language) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenApiKey,
  onOpenAuth,
  onLogout,
  user,
  lang = 'uz',
  currentTheme,
  onThemeToggle,
  onLangChange,
}: NavbarProps) {
  const t = (TRANSLATIONS[lang] || TRANSLATIONS.uz).navbar;
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isToolsFlyoutOpen, setIsToolsFlyoutOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [hoveredDockItem, setHoveredDockItem] = useState<string | null>(null);

  const iconClicksRef = useRef<number>(0);
  const lastIconClickTimeRef = useRef<number>(0);

  // Faqat ikonkaning o'zi 9 marta bosilganda maxfiy admin ochiladi
  const handleSecretIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastIconClickTimeRef.current < 1200) {
      iconClicksRef.current += 1;
    } else {
      iconClicksRef.current = 1;
    }
    lastIconClickTimeRef.current = now;

    if (iconClicksRef.current >= 9) {
      iconClicksRef.current = 0;
      window.location.href = '/secret-admin-console';
      return;
    }
    setActiveTab('darslar');
  };

  // 1. Darslar, 2. Darsxona, 3. Guruhlar, 4. Kontaktlar, 5. Sozlamalar
  const mainTabs = [
    {
      id: 'darslar' as const,
      label: t.darslar,
      fullLabel: t.darslarFull,
      icon: GraduationCap,
      badge: '5 ta Bepul',
    },
    {
      id: 'darsxona' as const,
      label: t.darsxona,
      fullLabel: t.darsxonaFull,
      icon: Radio,
      badge: 'Live',
    },
    {
      id: 'groups' as const,
      label: t.groups,
      fullLabel: t.groupsFull,
      icon: Users,
    },
    {
      id: 'contacts' as const,
      label: t.contacts,
      fullLabel: t.contactsFull,
      icon: BookUser,
    },
    {
      id: 'settings' as const,
      label: t.settings,
      fullLabel: t.settingsFull,
      icon: Settings,
    },
  ];

  // 5. Yordamchi dasturlar (Slaydlar, Mustaqil ish, Research, Tarix)
  const helperTools = [
    {
      id: 'presentation' as const,
      label: t.slides,
      fullLabel: t.slides,
      desc: t.slidesDesc,
      icon: Presentation,
      badge: 'Gamma',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'mustaqil' as const,
      label: t.mustaqil,
      fullLabel: t.mustaqil,
      desc: t.mustaqilDesc,
      icon: FileText,
      badge: 'Word',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'obyektivka' as const,
      label: t.obyektivka,
      fullLabel: t.obyektivkaFull,
      desc: t.obyektivkaDesc,
      icon: UserCheck,
      badge: 'Doc/PDF',
      color: 'from-blue-600 via-indigo-600 to-violet-600',
    },
    {
      id: 'research' as const,
      label: t.research,
      fullLabel: t.research,
      desc: t.researchDesc,
      icon: Search,
      badge: 'AI',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'history' as const,
      label: t.history,
      fullLabel: t.history,
      desc: t.historyDesc,
      icon: FolderClock,
      badge: 'Tarix',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const isHelperToolActive = helperTools.some((tool) => tool.id === activeTab);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. LAPTOP & DESKTOP (2-RASM): SUZUVCHI CHAP VERTIKAL DOCK-SIDEBAR (>= lg) */}
      {/* Faqat tizimga kirgan foydalanuvchilar uchun ko'rinadi                       */}
      {/* ========================================================================= */}
      {user.isLoggedIn && (
        <aside className="hidden lg:flex fixed left-3 top-3 bottom-3 w-[66px] z-40 flex-col items-center py-3 bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-[24px] shadow-2xl transition-all">
        {/* Yuqori: TalabaAI Logo (9 marta bosilganda maxfiy admin ochiladi) */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
          <div
            onClick={handleSecretIconClick}
            className="w-11 h-11 rounded-[16px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
            title="TalabaAI (Admin: 9 marta bosing)"
          >
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center group-hover:bg-slate-900 transition-colors">
              <Sparkles className="text-indigo-400 group-hover:text-purple-300 transition-colors pointer-events-none" size={18} />
            </div>
          </div>
          <span className="text-[9px] font-extrabold tracking-tight text-slate-400 select-none">
            Talaba<span className="text-indigo-400">AI</span>
          </span>
        </div>

        {/* Markaz: Vertikal navigatsiya tugmalari (ixcham va qulay joylashuv) */}
        <nav className="flex flex-col items-center gap-2 mt-3 w-full px-2">
          {mainTabs.slice(0, 4).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'groups' && activeTab === 'messenger');
            const isLocked = !user.isLoggedIn;
            return (
              <div key={tab.id} className="relative group flex items-center justify-center">
                <button
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsToolsFlyoutOpen(false);
                  }}
                  onMouseEnter={() => setHoveredDockItem(tab.id)}
                  onMouseLeave={() => setHoveredDockItem(null)}
                  className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95'
                  }`}
                  aria-label={tab.fullLabel}
                >
                  <Icon size={20} className={tab.id === 'darsxona' && isActive ? 'animate-pulse text-white' : ''} />
                  {tab.id === 'darsxona' && !isActive && !isLocked && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  )}
                  {isLocked && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-950 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-sm" title="Kirish kerak">
                      <Lock size={8} />
                    </span>
                  )}
                </button>

                {/* Tooltip on hover */}
                {hoveredDockItem === tab.id && (
                  <div className="absolute left-16 ml-2 px-2.5 py-1.5 rounded-xl bg-slate-900/95 border border-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100 flex items-center gap-1.5">
                    <span>{tab.fullLabel}</span>
                    {isLocked ? (
                      <span className="ml-1 px-1.5 py-0.5 text-[9px] rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Lock size={8} /> {t.loginRequired}
                      </span>
                    ) : tab.badge ? (
                      <span className="ml-2 px-1.5 py-0.5 text-[9px] rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {tab.badge}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}

          {/* 5. Yordamchi Dasturlar (Slaydlar, Mustaqil ish, Research, Tarix) */}
          <div className="relative group flex items-center justify-center">
            <button
              onClick={() => setIsToolsFlyoutOpen(!isToolsFlyoutOpen)}
              onMouseEnter={() => setHoveredDockItem('helper_tools')}
              onMouseLeave={() => setHoveredDockItem(null)}
              className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-all cursor-pointer ${
                isHelperToolActive
                  ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95'
              }`}
              aria-label={t.helperTools}
            >
              <LayoutGrid size={20} />
            </button>

            {/* Tooltip */}
            {hoveredDockItem === 'helper_tools' && !isToolsFlyoutOpen && (
              <div className="absolute left-16 ml-2 px-2.5 py-1.5 rounded-xl bg-slate-900/95 border border-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                <span>{t.helperTools}</span>
              </div>
            )}

            {/* Flyout Menu (Yordamchi dasturlar ro'yxati) */}
            {isToolsFlyoutOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsToolsFlyoutOpen(false)}
                />
                <div className="absolute left-16 ml-2 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-indigo-300">
                      <Sparkles size={12} /> {t.helperTools}
                    </span>
                    <button
                      onClick={() => setIsToolsFlyoutOpen(false)}
                      className="text-slate-500 hover:text-white p-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {helperTools.map((tool) => {
                      const Icon = tool.icon;
                      const isSelected = activeTab === tool.id;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => {
                            setActiveTab(tool.id);
                            setIsToolsFlyoutOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/25 border border-indigo-500/40 text-white shadow-md'
                              : 'hover:bg-slate-800/70 text-slate-300'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${tool.color} p-0.5 shrink-0 flex items-center justify-center text-white shadow-sm`}>
                            <Icon size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate text-white">{tool.fullLabel}</span>
                              {tool.badge && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{tool.desc}</p>
                          </div>
                          {isSelected && <Check size={14} className="text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 6. Sozlamalar */}
          <div className="relative group flex items-center justify-center">
            <button
              onClick={() => {
                setActiveTab('settings');
                setIsToolsFlyoutOpen(false);
              }}
              onMouseEnter={() => setHoveredDockItem('settings')}
              onMouseLeave={() => setHoveredDockItem(null)}
              className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95'
              }`}
              aria-label="Sozlamalar"
            >
              <Settings size={20} />
            </button>

            {hoveredDockItem === 'settings' && (
              <div className="absolute left-16 ml-2 px-2.5 py-1.5 rounded-xl bg-slate-900/95 border border-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                <span>{t.settingsFull}</span>
              </div>
            )}
          </div>
        </nav>

        {/* Past: Profil va Chiqish tugmalari (mt-auto orqali pastga chiroyli joylashtiriladi) */}
        <div className="mt-auto flex flex-col items-center gap-2 w-full pt-2.5 border-t border-slate-800/80 pb-0.5 shrink-0">
          {/* Profile Dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => {
                if (user.isLoggedIn) {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                } else {
                  window.location.href = '/login';
                }
              }}
              title={user.isLoggedIn ? `${user.name} (${t.settings})` : t.login}
              className="w-10 h-10 rounded-[14px] bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer font-bold text-[11px]"
            >
              {user.isLoggedIn ? (
                <span>
                  {user.name.slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <User size={20} />
              )}
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && user.isLoggedIn && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute left-16 bottom-1 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 p-2.5 text-slate-100 shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                  <div className="pb-2 mb-1.5 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.group || user.university || t.student}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {user.plan === 'ultra' ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 flex items-center gap-1">
                          <Crown size={10} className="text-amber-300" /> Ultra VIP
                        </span>
                      ) : user.plan === 'premium' ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 flex items-center gap-1">
                          <Star size={10} className="text-amber-400" /> Premium
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-800 text-slate-300 rounded-full">
                          Oddiy (Free)
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400 font-mono">
                        {user.plan === 'ultra' ? '∞' : `${user.tokens ?? 10} token`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <User size={13} className="text-indigo-400" /> {t.editProfile}
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenApiKey();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Key size={13} className="text-amber-400" /> {t.apiKeySettings}
                    </button>
                    {onLogout && (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                      >
                        <LogOut size={13} /> {t.logout}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chiqish tugmasi */}
          {user.isLoggedIn && onLogout && (
            <button
              onClick={onLogout}
              title={t.logout}
              className="w-11 h-11 rounded-2xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
      )}

      {/* ========================================================================= */}
      {/* 2. SMARTFON / MOBIL (1-RASM): YUQORI SALOMLASHISH PANELI (< lg)           */}
      {/* Faqat tizimga kirgan foydalanuvchilar uchun ko'rinadi                       */}
      {/* ========================================================================= */}
      {user.isLoggedIn && (
        <header className="lg:hidden sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 px-3 py-2 flex items-center justify-between">
          {/* Chap: Avatar va Salomlashuv (1-rasmdagidek) */}
          <div className="flex items-center gap-2">
            {/* Avatar (9 marta bosganda admin konsol ochiladi) */}
            <div
              onClick={handleSecretIconClick}
              className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-transform cursor-pointer shrink-0"
              title="Profil / Admin"
            >
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-bold text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Salom matni */}
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium leading-tight">
                {t.welcome}
              </span>
              <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate max-w-[110px] sm:max-w-[140px]">
                {user.name.split(' ')[0]}
              </h1>
            </div>
          </div>

          {/* O'ng: Tungi/Kunduzgi rejim, Til, Yordamchi Dasturlar va Tokenlar */}
          <div className="flex items-center gap-1.5">
            {currentTheme && onThemeToggle && onLangChange && (
              <ThemeLanguageSwitcher
                currentLang={lang}
                onLangChange={onLangChange}
                currentTheme={currentTheme}
                onThemeToggle={onThemeToggle}
              />
            )}

            {/* AI Yordamchi Dasturlar Sheet Trigger */}
            <button
              onClick={() => setIsMobileToolsOpen(true)}
              className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isHelperToolActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <LayoutGrid size={13} className="text-indigo-400" />
              <span className="text-[11px] hidden sm:inline">{t.tools}</span>
            </button>

            {/* Tokenlar */}
            {user.plan === 'ultra' ? (
              <div className="px-2 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-[11px] font-bold flex items-center gap-1">
                <Crown size={12} className="text-amber-400 fill-amber-400" />
                <span>VIP</span>
              </div>
            ) : user.plan === 'premium' ? (
              <div className="px-2 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span>{user.tokens ?? 100}</span>
              </div>
            ) : (
              <div className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1">
                <Zap size={12} className="text-indigo-400 fill-indigo-400/30" />
                <span>{user.tokens ?? 10}</span>
              </div>
            )}
          </div>
        </header>
      )}

      {/* ========================================================================= */}
      {/* 3. SMARTFON / MOBIL (1-RASM): PASTKI NAVIGATSIYA PANELI (< lg)            */}
      {/* Faqat tizimga kirgan foydalanuvchilar uchun ko'rinadi                       */}
      {/* ========================================================================= */}
      {user.isLoggedIn && (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'groups' && activeTab === 'messenger');
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileToolsOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer relative min-w-[56px] ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Squircle Pill Indicator (1-rasmdagi uslubda) */}
                <div
                  className={`w-10 h-7 rounded-xl flex items-center justify-center transition-all relative ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon size={18} className={tab.id === 'darsxona' && isActive ? 'animate-pulse' : ''} />
                </div>

                <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-extrabold text-emerald-400' : 'font-medium'}`}>
                  {tab.label}
                </span>

                {tab.id === 'darsxona' && !isActive && (
                  <span className="absolute top-1.5 right-3 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* ========================================================================= */}
      {/* 4. MOBIL YORDAMCHI DASTURLAR MODAL OYNSI (Sheet)                          */}
      {/* ========================================================================= */}
      {isMobileToolsOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div
            className="flex-1"
            onClick={() => setIsMobileToolsOpen(false)}
          />
          <div className="w-full bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">{t.helperTools}</h3>
                  <p className="text-[11px] text-slate-400">{t.helperToolsDesc}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileToolsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {helperTools.map((tool) => {
                const Icon = tool.icon;
                const isSelected = activeTab === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTab(tool.id);
                      setIsMobileToolsOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/25 border-indigo-500/50 text-white shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.color} p-0.5 flex items-center justify-center text-white shrink-0 shadow-md`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{tool.fullLabel}</span>
                        {tool.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{tool.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
