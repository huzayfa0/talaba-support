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
  Video,
  LogOut,
  ChevronDown,
  BookUser,
  Radio,
  Settings,
  LayoutGrid,
  Check,
  GraduationCap,
} from 'lucide-react';
import { UserProfile, NavTab } from '@/types';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenApiKey: () => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
  user: UserProfile;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenApiKey,
  onOpenAuth,
  onLogout,
  user,
}: NavbarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const iconClicksRef = useRef<number>(0);
  const lastIconClickTimeRef = useRef<number>(0);

  // Faqat ikonkaning o'zi 9 marta bosilganda ochiladi
  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    // Ketma-ket bosish oralig'i (1.2 soniya ichida)
    if (now - lastIconClickTimeRef.current < 1200) {
      iconClicksRef.current += 1;
    } else {
      iconClicksRef.current = 1;
    }
    lastIconClickTimeRef.current = now;

    // Aynan 9 marta bosilganda maxfiy konsolga kiradi
    if (iconClicksRef.current >= 9) {
      iconClicksRef.current = 0;
      window.location.href = '/secret-admin-console';
      return;
    }
    setActiveTab('darslar');
  };

  // So'zga bosilganda oddiy bosh sahifaga o'tadi
  const handleTextClick = () => {
    setActiveTab('darslar');
  };

  // 1. Darslar, 2. Darsxona, 3. Guruhlar, 4. Kontaktlar, 5. Sozlamalar
  const mainTabs = [
    {
      id: 'darslar' as const,
      label: 'Darslar',
      fullLabel: 'Online Video Darslar',
      icon: GraduationCap,
      badge: '5 ta Bepul',
    },
    {
      id: 'darsxona' as const,
      label: 'Darsxona',
      fullLabel: 'Jonli Darsxona',
      icon: Radio,
      badge: 'Live',
    },
    {
      id: 'groups' as const,
      label: 'Guruhlar',
      fullLabel: 'O‘quv Guruhlari',
      icon: Users,
    },
    {
      id: 'contacts' as const,
      label: 'Kontaktlar',
      fullLabel: 'Kontaktlar',
      icon: BookUser,
    },
    {
      id: 'settings' as const,
      label: 'Sozlamalar',
      fullLabel: 'Sozlamalar & Profil',
      icon: Settings,
    },
  ];

  // 5. Yordamchi dasturlar (Pastga qarab ochiluvchi 4 ta vosita)
  const helperTools = [
    {
      id: 'presentation' as const,
      label: 'Slaydlar',
      fullLabel: 'Slaydlar (Gamma)',
      desc: 'Gamma uslubida zamonaviy taqdimotlar',
      icon: Presentation,
      badge: 'Gamma',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'mustaqil' as const,
      label: 'Mustaqil Ish',
      fullLabel: 'Mustaqil Ish & Word',
      desc: 'Word (.docx) referat va kurs ishlari',
      icon: FileText,
      badge: 'Word',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'research' as const,
      label: 'Research',
      fullLabel: 'Smart Research',
      desc: 'Ilmiy tadqiqot va ma‘lumotlar tahlili',
      icon: Search,
      badge: 'AI',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'history' as const,
      label: 'Ishlarim',
      fullLabel: 'Mening Ishlarim',
      desc: 'Saqlangan loyihalar va slaydlar tarixi',
      icon: FolderClock,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const isHelperToolActive = helperTools.some((tool) => tool.id === activeTab);
  const activeHelperTool = helperTools.find((tool) => tool.id === activeTab);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="w-full max-w-[1536px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-2 lg:gap-3">
          {/* Logo container */}
          <div
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 select-none user-select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            {/* Faqat Logoning o'zi (ikonka) - 9 marta bosilganda admin ochiladi */}
            <div
              onClick={handleIconClick}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-transform shrink-0 cursor-pointer"
              title="TalabaAI"
            >
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="text-indigo-400 hover:text-purple-300 transition-colors pointer-events-none" size={18} />
              </div>
            </div>

            {/* So'zlar - ustiga bosganda faqat bosh sahifaga o'tadi, adminga kirmaydi */}
            <div
              onClick={handleTextClick}
              className="cursor-pointer group select-none shrink-0"
            >
              <div className="flex items-center gap-1.5 select-none">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent group-hover:text-white transition-colors select-none">
                  Talaba<span className="text-indigo-400">AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 select-none">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden 2xl:block select-none pointer-events-none">
                Slayd & Mustaqil ishlar generatori
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs: 1) Darsxona, 2) Guruhlar, 3) Kontaktlar, 4) Sozlamalar, 5) Yordamchi Dasturlar (Dropdown) */}
          <nav className="hidden md:flex items-center gap-0.5 xl:gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shrink min-w-0">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || (tab.id === 'groups' && activeTab === 'messenger');
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsToolsMenuOpen(false);
                  }}
                  title={tab.fullLabel}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon size={14} className={tab.id === 'darsxona' && isActive ? 'animate-pulse text-red-400' : 'shrink-0'} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.badge && !isActive && (
                    <span className="hidden xl:inline text-[9px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* 5. Yordamchi Dasturlar (Pastga qarab ochiluvchi menyu) */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                title="Yordamchi dasturlar: Slaydlar, Mustaqil ish, Research, Ishlarim"
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isHelperToolActive
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <LayoutGrid size={14} className="shrink-0" />
                <span className="whitespace-nowrap">
                  Yordamchi dasturlar
                  {isHelperToolActive && activeHelperTool && (
                    <span className="hidden xl:inline opacity-90 text-[11px] font-normal">
                      : {activeHelperTool.label}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={13}
                  className={`shrink-0 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Pastga ochiluvchi menyu (Dropdown) */}
              {isToolsMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsToolsMenuOpen(false)}
                  />
                  <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
                      <span>Yordamchi Dasturlar</span>
                      <Sparkles size={11} className="text-indigo-400" />
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
                              setIsToolsMenuOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600/20 border border-indigo-500/30 text-white'
                                : 'hover:bg-slate-800/60 text-slate-300'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${tool.color} p-0.5 shrink-0 flex items-center justify-center text-white shadow-sm`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold truncate">{tool.fullLabel}</span>
                                {tool.badge && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-800 border border-slate-700 text-slate-400">
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">{tool.desc}</p>
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
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Plan / Tokens badge */}
            {user.plan === 'ultra' ? (
              <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-purple-500/40 text-purple-200 text-xs font-bold shadow-sm shadow-purple-500/20 shrink-0">
                <Crown size={14} className="text-amber-400 fill-amber-400 animate-pulse shrink-0" />
                <span className="hidden xl:inline">Ultra VIP</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-purple-500/30 text-purple-200 rounded-full font-mono shrink-0">∞ Cheksiz</span>
              </div>
            ) : user.plan === 'premium' ? (
              <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-sm shadow-amber-500/10 shrink-0">
                <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />
                <span className="hidden xl:inline">Premium</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/30 text-amber-200 rounded-full font-mono shrink-0">{user.tokens ?? 100}</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-medium shrink-0">
                <Zap size={14} className="text-indigo-400 fill-indigo-400/30 shrink-0" />
                <span>{user.tokens ?? 10}</span>
                <span className="hidden xl:inline"> bepul</span>
              </div>
            )}

            {/* API Key settings button */}
            <button
              onClick={onOpenApiKey}
              title="Gemini API Kalitini kiritish"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors shrink-0"
            >
              <Key size={16} />
            </button>

            {/* Profile / Auth button & Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  if (user.isLoggedIn) {
                    setIsProfileMenuOpen(!isProfileMenuOpen);
                  } else {
                    window.location.href = '/login';
                  }
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-all hover:border-slate-700 shrink-0"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <User size={14} />
                </div>
                <span className="inline max-w-[85px] sm:max-w-[110px] xl:max-w-[130px] truncate font-semibold">
                  {user.isLoggedIn ? user.name.split(' ')[0] : 'Kirish'}
                </span>
                {user.isLoggedIn && (
                  <ChevronDown
                    size={13}
                    className={`text-slate-400 shrink-0 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && user.isLoggedIn && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900 border border-slate-800 p-3 text-slate-100 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="pb-2.5 mb-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.group || user.university || 'Talaba'}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        {user.plan === 'ultra' ? (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 flex items-center gap-1">
                            <Crown size={11} className="text-amber-300" /> Ultra VIP
                          </span>
                        ) : user.plan === 'premium' ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 flex items-center gap-1">
                            <Star size={11} className="text-amber-400" /> Premium
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 rounded-full">
                            Oddiy (Free)
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {user.plan === 'ultra' ? '∞' : `${user.tokens} token`}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenAuth();
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                        <User size={14} className="text-indigo-400" /> Profilni tahrirlash
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenApiKey();
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                        <Key size={14} className="text-amber-400" /> API Kalit sozlamalari
                      </button>
                      {onLogout && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 font-semibold"
                        >
                          <LogOut size={14} /> Akkountdan chiqish
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Chiqish tugmasi (Navbar-da doimiy ko'rinib turadigan qizil tugma) */}
            {user.isLoggedIn && onLogout && (
              <button
                onClick={onLogout}
                title="Akkountdan chiqish"
                className="flex items-center gap-1.5 p-2 xl:px-3 xl:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold transition-all active:scale-95 shadow-sm shrink-0"
              >
                <LogOut size={14} className="shrink-0" />
                <span className="hidden xl:inline">Chiqish</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-slate-800/60 no-scrollbar">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon size={14} className={tab.id === 'darsxona' && isActive ? 'text-red-400 animate-pulse' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Mobil Yordamchi Dasturlar tugmasi va menyusi */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                isHelperToolActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Dasturlar</span>
              <ChevronDown size={12} className={`transition-transform ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMobileToolsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMobileToolsOpen(false)}
                />
                <div className="absolute right-0 bottom-full mb-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    Yordamchi Dasturlar
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
                            setIsMobileToolsOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <Icon size={14} />
                          <span>{tool.fullLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
