'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Check, ChevronDown } from 'lucide-react';
import { Language } from '@/types';

export const LANGUAGES: { code: Language; name: string; short: string; flag: string }[] = [
  { code: 'uz', name: 'O‘zbek tili', short: 'O‘zb', flag: '🇺🇿' },
  { code: 'kaa', name: 'Qoraqalpoq tili', short: 'Qar', flag: '🏴' },
  { code: 'kk', name: 'Qozoq tili', short: 'Qaz', flag: '🇰🇿' },
  { code: 'ru', name: 'Rus tili', short: 'Рус', flag: '🇷🇺' },
  { code: 'en', name: 'Ingliz tili', short: 'Eng', flag: '🇬🇧' },
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tashqariga bosilganda dropdownni yopish
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLangObj = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="flex items-center gap-2">
      {/* 1. Tungi / Kunduzgi rejim tugmasi */}
      <button
        onClick={onThemeToggle}
        type="button"
        title={currentTheme === 'dark' ? 'Kunduzgi rejimga o‘tish' : 'Tungi rejimga o‘tish'}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm relative group"
      >
        {currentTheme === 'dark' ? (
          <Sun size={17} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon size={17} className="text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>

      {/* 2. Tilni tanlash (5 ta til) */}
      <div className="relative z-50" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <span className="text-sm leading-none">{activeLangObj.flag}</span>
          <span className="hidden sm:inline text-xs">{activeLangObj.name}</span>
          <span className="sm:hidden text-xs">{activeLangObj.short}</span>
          <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown menyu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 sm:w-52 rounded-2xl bg-slate-900/98 backdrop-blur-3xl border border-slate-700/80 p-1.5 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(255,255,255,0.1)] z-[9999] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
              Tilni tanlang (5 ta til)
            </div>
            <div className="space-y-0.5">
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
                    className={`w-full px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-indigo-400" />}
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
