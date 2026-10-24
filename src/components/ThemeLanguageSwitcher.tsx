'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Check, ChevronDown } from 'lucide-react';
import { Language } from '@/types';

// =========================================================================
// Real Milliy Bayroqlar (Windows, Android, iOS da 100% bir xil va tiniq chiqishi uchun SVG)
// =========================================================================

export function FlagUzbekistan({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[3px] shadow-sm shrink-0 overflow-hidden`} viewBox="0 0 640 480" fill="none">
      <rect width="640" height="154" fill="#0099B5" />
      <rect y="154" width="640" height="10" fill="#CE1126" />
      <rect y="164" width="640" height="152" fill="#FFFFFF" />
      <rect y="316" width="640" height="10" fill="#CE1126" />
      <rect y="326" width="640" height="154" fill="#1EB53A" />
      {/* Hilol (Yarim oy) */}
      <circle cx="85" cy="77" r="45" fill="#FFFFFF" />
      <circle cx="98" cy="77" r="42" fill="#0099B5" />
      {/* 12 yulduz (3 qator: 3, 4, 5) */}
      <g fill="#FFFFFF">
        <circle cx="165" cy="45" r="7" />
        <circle cx="200" cy="45" r="7" />
        <circle cx="235" cy="45" r="7" />
        <circle cx="165" cy="77" r="7" />
        <circle cx="200" cy="77" r="7" />
        <circle cx="235" cy="77" r="7" />
        <circle cx="270" cy="77" r="7" />
        <circle cx="130" cy="110" r="7" />
        <circle cx="165" cy="110" r="7" />
        <circle cx="200" cy="110" r="7" />
        <circle cx="235" cy="110" r="7" />
        <circle cx="270" cy="110" r="7" />
      </g>
    </svg>
  );
}

export function FlagKarakalpakstan({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[3px] shadow-sm shrink-0 overflow-hidden`} viewBox="0 0 640 480" fill="none">
      <rect width="640" height="148" fill="#0069B4" />
      <rect y="148" width="640" height="8" fill="#CE1126" />
      <rect y="156" width="640" height="8" fill="#FFFFFF" />
      <rect y="164" width="640" height="152" fill="#FED100" />
      <rect y="316" width="640" height="8" fill="#FFFFFF" />
      <rect y="324" width="640" height="8" fill="#CE1126" />
      <rect y="332" width="640" height="148" fill="#00863F" />
      {/* Hilol (Yarim oy) */}
      <circle cx="85" cy="74" r="42" fill="#FFFFFF" />
      <circle cx="98" cy="74" r="39" fill="#0069B4" />
      {/* 5 yulduz */}
      <g fill="#FFFFFF">
        <circle cx="155" cy="55" r="7" />
        <circle cx="185" cy="55" r="7" />
        <circle cx="215" cy="55" r="7" />
        <circle cx="170" cy="95" r="7" />
        <circle cx="200" cy="95" r="7" />
      </g>
    </svg>
  );
}

export function FlagKazakhstan({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[3px] shadow-sm shrink-0 overflow-hidden`} viewBox="0 0 640 480" fill="none">
      <rect width="640" height="480" fill="#00AFCA" />
      {/* Milliy naqsh ustuni */}
      <rect width="60" height="480" fill="#FED100" opacity="0.9" />
      <path d="M30 60 L45 80 L30 100 L15 80 Z M30 160 L45 180 L30 200 L15 180 Z M30 260 L45 280 L30 300 L15 280 Z M30 360 L45 380 L30 400 L15 380 Z" fill="#00AFCA" />
      {/* Quyosh */}
      <circle cx="360" cy="200" r="70" fill="#FED100" />
      {/* Qanot qoqqan burgut */}
      <path d="M250 300 Q360 250 470 300 Q400 330 360 305 Q320 330 250 300 Z" fill="#FED100" />
    </svg>
  );
}

export function FlagRussia({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[3px] shadow-sm shrink-0 overflow-hidden border border-slate-300/40`} viewBox="0 0 640 480" fill="none">
      <rect width="640" height="160" fill="#FFFFFF" />
      <rect y="160" width="640" height="160" fill="#0039A6" />
      <rect y="320" width="640" height="160" fill="#D52B1E" />
    </svg>
  );
}

export function FlagUnitedKingdom({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[3px] shadow-sm shrink-0 overflow-hidden`} viewBox="0 0 640 480" fill="none">
      <rect width="640" height="480" fill="#012169" />
      <path d="M0 0 L640 480 M640 0 L0 480" stroke="#FFFFFF" strokeWidth="60" />
      <path d="M0 0 L640 480 M640 0 L0 480" stroke="#C8102E" strokeWidth="35" />
      <rect x="260" width="120" height="480" fill="#FFFFFF" />
      <rect y="180" width="640" height="120" fill="#FFFFFF" />
      <rect x="280" width="80" height="480" fill="#C8102E" />
      <rect y="200" width="640" height="80" fill="#C8102E" />
    </svg>
  );
}

export function CountryFlag({ code, className = 'w-5 h-3.5' }: { code: Language; className?: string }) {
  switch (code) {
    case 'uz':
      return <FlagUzbekistan className={className} />;
    case 'kaa':
      return <FlagKarakalpakstan className={className} />;
    case 'kk':
      return <FlagKazakhstan className={className} />;
    case 'ru':
      return <FlagRussia className={className} />;
    case 'en':
      return <FlagUnitedKingdom className={className} />;
    default:
      return <FlagUzbekistan className={className} />;
  }
}

export const LANGUAGES: { code: Language; name: string; short: string }[] = [
  { code: 'uz', name: 'O‘zbek tili', short: 'O‘zb' },
  { code: 'kaa', name: 'Qoraqalpoq tili', short: 'Qar' },
  { code: 'kk', name: 'Qozoq tili', short: 'Qaz' },
  { code: 'ru', name: 'Rus tili', short: 'Рус' },
  { code: 'en', name: 'Ingliz tili', short: 'Eng' },
];

interface ThemeLanguageSwitcherProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  currentTheme: 'dark' | 'light';
  onThemeToggle: () => void;
}

export default function ThemeLanguageSwitcher({
  currentLang,
  onLangChange,
  currentTheme,
  onThemeToggle,
}: ThemeLanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tashqariga bosilganda dropdownni yopish (touch va click)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      // Agar tugma ekranning o'ng yarmida bo'lsa, o'ng tomondan tekislanadi (right-0), aks holda chapdan (left-0)
      setAlignRight(rect.left > window.innerWidth / 2);
    }
    setIsOpen(!isOpen);
  };

  const activeLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* 1. Tungi / Kunduzgi rejim tugmasi */}
      <button
        onClick={onThemeToggle}
        type="button"
        title={currentTheme === 'dark' ? 'Kunduzgi rejimga o‘tish' : 'Tungi rejimga o‘tish'}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm relative group shrink-0 ${
          currentTheme === 'light'
            ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
            : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
        }`}
      >
        {currentTheme === 'dark' ? (
          <Sun size={17} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon size={17} className="text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>

      {/* 2. Tilni tanlash (5 ta til) */}
      <div className={`relative shrink-0 ${isOpen ? 'z-[100]' : 'z-50'}`} ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          type="button"
          className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm ${
            currentTheme === 'light'
              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
              : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200 hover:text-white'
          }`}
        >
          <CountryFlag code={activeLangObj.code} className="w-5 h-3.5" />
          <span className="hidden sm:inline text-xs">{activeLangObj.name}</span>
          <span className="sm:hidden text-xs">{activeLangObj.short}</span>
          <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Orqa fon qoraytirgichi (Backdrop overlay) */}
        {isOpen && (
          <div
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[1px] transition-opacity"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Dropdown menyu - Tugmaning qoq tagida (JOYIDA) ochiladi, ortiqcha sarlavhasiz toza ro'yxat */}
        {isOpen && (
          <div
            style={{
              backgroundColor: currentTheme === 'light' ? '#ffffff' : '#0b1120',
              color: currentTheme === 'light' ? '#0f172a' : '#ffffff',
            }}
            className={`absolute top-full mt-2 w-52 sm:w-56 rounded-2xl border-2 border-indigo-500/60 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[100] animate-in fade-in zoom-in-95 duration-150 select-none ${
              alignRight ? 'right-0' : 'left-0'
            }`}
          >
            {/* Tillar ro'yxati (5 ta til) */}
            <div className="space-y-1">
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === currentLang;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onLangChange(lang.code);
                      setIsOpen(false);
                    }}
                    style={
                      isSelected
                        ? {
                            backgroundColor: '#4f46e5',
                            color: '#ffffff',
                          }
                        : currentTheme === 'light'
                        ? {
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                          }
                        : {
                            backgroundColor: '#111827',
                            color: '#f8fafc',
                          }
                    }
                    className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer font-medium border ${
                      isSelected
                        ? 'border-indigo-500 shadow-md font-bold'
                        : currentTheme === 'light'
                        ? 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                        : 'border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CountryFlag code={lang.code} className="w-5 h-3.5" />
                      <span className={`text-xs font-semibold ${
                        isSelected
                          ? 'text-white'
                          : currentTheme === 'light'
                          ? 'text-slate-900'
                          : 'text-slate-100'
                      }`}>
                        {lang.name}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Check size={13} className="text-white" />
                      </span>
                    ) : (
                      <span className={`text-[10px] uppercase font-bold font-mono px-1.5 py-0.5 rounded ${
                        currentTheme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {lang.code}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
