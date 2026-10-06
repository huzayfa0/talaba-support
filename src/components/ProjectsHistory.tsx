'use client';

import React from 'react';
import {
  Presentation,
  FileText,
  Search,
  Download,
  Trash2,
  FolderOpen,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  PresentationProject,
  MustaqilIshProject,
  ResearchResult,
} from '@/types';
import { exportToPptx } from '@/lib/pptx-generator';
import { generateDocxBlob, downloadBlob } from '@/lib/docx-generator';

interface Props {
  presentations: PresentationProject[];
  mustaqilIshlar: MustaqilIshProject[];
  researches: ResearchResult[];
  onOpenPresentation: (p: PresentationProject) => void;
  onOpenMustaqilIsh: (m: MustaqilIshProject) => void;
  onDeletePresentation: (id: string) => void;
  onDeleteMustaqilIsh: (id: string) => void;
  onDeleteResearch: (id: string) => void;
  onNavigateTab: (tab: 'presentation' | 'mustaqil' | 'research') => void;
}

export default function ProjectsHistory({
  presentations,
  mustaqilIshlar,
  researches,
  onOpenPresentation,
  onOpenMustaqilIsh,
  onDeletePresentation,
  onDeleteMustaqilIsh,
  onDeleteResearch,
  onNavigateTab,
}: Props) {
  const totalCount = presentations.length + mustaqilIshlar.length + researches.length;

  const handleDownloadDocx = async (project: MustaqilIshProject) => {
    try {
      const blob = await generateDocxBlob(project);
      downloadBlob(blob, `${project.meta.topic.substring(0, 25)}_Mustaqil_ish.docx`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPptx = async (project: PresentationProject) => {
    try {
      await exportToPptx(project);
    } catch (e) {
      console.error(e);
    }
  };

  if (totalCount === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <FolderOpen size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Hozircha saqlangan ishlar yo‘q</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Siz yaratgan barcha slaydlar, mustaqil ishlar va ilmiy qidiruvlar shu yerda avtomatik saqlanib boradi.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab('presentation')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Presentation size={14} /> Slayd yaratish
          </button>
          <button
            onClick={() => onNavigateTab('mustaqil')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all"
          >
            <FileText size={14} /> Mustaqil ish yozish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 py-2 sm:py-2.5 space-y-4 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Mening Ishlarim va Loyihalarim</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Avval yaratilgan barcha taqdimotlar, Word mustaqil ishlari va qidiruv xulosalari
        </p>
      </div>

      {/* 1. TAQDIMOTLAR */}
      {presentations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
            <Presentation size={18} />
            <span>Slaydlar ({presentations.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentations.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-white text-base line-clamp-1">{p.title}</h3>
                  <button
                    onClick={() => onDeletePresentation(p.id)}
                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Layers size={13} className="text-indigo-400" /> {p.slides.length} slayd
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <button
                    onClick={() => onOpenPresentation(p)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    Ochish <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => handleDownloadPptx(p)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={13} /> .pptx
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MUSTAQIL ISHLAR */}
      {mustaqilIshlar.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
            <FileText size={18} />
            <span>Mustaqil Ishlar & Kurs ishlari ({mustaqilIshlar.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mustaqilIshlar.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base line-clamp-1">{m.meta.topic}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{m.meta.subject} • {m.meta.university}</p>
                  </div>
                  <button
                    onClick={() => onDeleteMustaqilIsh(m.id)}
                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Talaba: {m.meta.studentName}</span>
                  <span>•</span>
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                  <button
                    onClick={() => onOpenMustaqilIsh(m)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Ochish <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => handleDownloadDocx(m)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium flex items-center gap-1.5 transition-colors border border-blue-500/20"
                  >
                    <Download size={13} /> Word (.docx)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ILMIY QIDIRUVLAR */}
      {researches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <Search size={18} />
            <span>Smart Research Tarixi ({researches.length})</span>
          </div>

          <div className="space-y-2.5">
            {researches.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-semibold text-white text-sm">{r.query}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{r.summary}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onDeleteResearch(r.id)}
                    className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
