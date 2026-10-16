'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Check, ChevronDown, Globe, X } from 'lucide-react';
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

const TITLE_BY_LANG: Record<Language, string> = {
  uz: 'Tilni tanlang (5 ta)',
  kaa: 'Tildi saylań (5 til)',
  kk: 'Тілді таңдаңыз (5 тіл)',
  ru: 'Выберите язык (5 языков)',
  en: 'Select language (5)',
};

export default function ThemeLanguageSwitcher({
  currentLang,
  onLangChange,
  currentTheme,
  onThemeToggle,
}: ThemeLanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
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
      <div className="relative z-50 shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm ${
            currentTheme === 'light'
              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
              : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-200 hover:text-white'
          }`}
        >
          <span className="text-sm leading-none">{activeLangObj.flag}</span>
          <span className="hidden sm:inline text-xs">{activeLangObj.name}</span>
          <span className="sm:hidden text-xs">{activeLangObj.short}</span>
          <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Orqa fon qoraytirgichi (Backdrop overlay) */}
        {isOpen && (
          <div
            className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Dropdown menyu - Smartfonda: markazda to'liq ko'rinadi (hech qayeri kesilmaydi), Desktopda: tugma tagida */}
        {isOpen && (
          <div
            style={{
              backgroundColor: currentTheme === 'light' ? '#ffffff' : '#0b1120',
              color: currentTheme === 'light' ? '#0f172a' : '#ffffff',
            }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-32px)] max-w-xs sm:absolute sm:left-auto sm:right-0 sm:top-full sm:translate-x-0 sm:translate-y-0 sm:mt-2 sm:w-64 sm:max-w-none max-h-[85vh] overflow-y-auto rounded-2xl border-2 border-indigo-500/60 p-2.5 shadow-[0_25px_70px_rgba(0,0,0,0.85)] z-[9999] animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {/* Oyna sarlavhasi (Alohida panel ko'rinishida) */}
            <div
              style={{
                backgroundColor: currentTheme === 'light' ? '#f8fafc' : '#111827',
                borderColor: currentTheme === 'light' ? '#e2e8f0' : '#1f2937',
              }}
              className="px-3.5 py-2.5 rounded-xl mb-2.5 flex items-center justify-between border"
            >
              <div className="flex items-center gap-2">
                <Globe size={15} className={currentTheme === 'light' ? 'text-indigo-600' : 'text-indigo-400'} />
                <span className={`text-xs font-bold tracking-wide ${currentTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {TITLE_BY_LANG[currentLang] || TITLE_BY_LANG.uz}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  currentTheme === 'light'
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/80'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Yopish"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tillar ro'yxati (5 ta til) */}
            <div className="space-y-1.5">
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
                    className={`w-full px-3.5 py-3 sm:py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer font-medium border ${
                      isSelected
                        ? 'border-indigo-500 shadow-md font-bold'
                        : currentTheme === 'light'
                        ? 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                        : 'border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl sm:text-lg leading-none">{lang.flag}</span>
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
