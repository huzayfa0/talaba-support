'use client';

import React, { useState, useEffect } from 'react';
import { Key, Check, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { getSavedApiKey, saveApiKey } from '@/lib/ai-service';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getSavedApiKey());
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveApiKey(apiKey);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    saveApiKey('');
    setApiKey('');
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Key size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Google Gemini API Kaliti</h3>
            <p className="text-xs text-slate-400">Sun'iy intellekt imkoniyatlarini to‘liq ochish</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <p className="text-slate-300 text-xs leading-relaxed">
            TalabaAI bepul rejimda ham boyitilgan shablonlar bilan to‘liq ishlaydi. Agar siz o‘z shaxsiy Gemini AI
            kalitingizni kiritsangiz, slaydlar va mustaqil ishlar cheksiz va real vaqtda generatsiya qilinadi.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Gemini API Key (AI Studio)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck size={16} /> Brauzeringizda xavfsiz saqlanadi
            </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline"
            >
              Bepul olish <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              {saved ? (
                <>
                  <Check size={18} className="text-emerald-300" /> Saqlandi!
                </>
              ) : (
                'Saqlash'
              )}
            </button>
            {apiKey && (
              <button
                onClick={handleClear}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                O‘chirish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
