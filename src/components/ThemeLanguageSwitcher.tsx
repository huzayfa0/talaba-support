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
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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

        {/* Orqa fon qoraytirgichi (Backdrop overlay) - oyna alohida va yaqqol ko'rinishi uchun */}
        {isOpen && (
          <div
            className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Dropdown menyu - 100% no-shaffof (opaque), alohida fon bilan */}
        {isOpen && (
          <div
            style={{
              backgroundColor: currentTheme === 'light' ? '#ffffff' : '#0b1120',
              color: currentTheme === 'light' ? '#0f172a' : '#ffffff',
            }}
            className="absolute right-0 mt-2 w-56 sm:w-64 rounded-2xl border-2 border-indigo-500/60 p-2 shadow-[0_25px_70px_rgba(0,0,0,0.95)] z-[9999] animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {/* Oyna sarlavhasi (Alohida panel ko'rinishida) */}
            <div
              style={{
                backgroundColor: currentTheme === 'light' ? '#f1f5f9' : '#111827',
              }}
              className="px-3 py-2 rounded-xl mb-2 flex items-center justify-between border border-indigo-500/20"
            >
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-indigo-400" />
                <span className="text-xs font-bold tracking-wide">
                  Tilni tanlang (5 ta)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>

            {/* Tillar ro'yxati */}
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
                            backgroundColor: '#f8fafc',
                            color: '#1e293b',
                          }
                        : {
                            backgroundColor: '#111827',
                            color: '#f8fafc',
                          }
                    }
                    className={`w-full px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer font-medium border ${
                      isSelected
                        ? 'border-indigo-400 shadow-md font-bold'
                        : 'border-slate-800/80 hover:border-indigo-500/40 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none">{lang.flag}</span>
                      <span className="text-xs font-semibold">{lang.name}</span>
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Check size={13} className="text-white" />
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
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
