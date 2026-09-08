'use client';

import React from 'react';
import { FileText, Cpu, Eye, ShieldCheck, Sparkles, Database } from 'lucide-react';

export const Header: React.FC<{ isMock?: boolean; providerName?: string }> = ({
  isMock = true,
  providerName = 'Mock AI Engine'
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                AI Experience Letter Information Extractor
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                IDP Platform v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Intelligent Document Processing &bull; Digital PDF / DOCX Parsing &bull; OCR &bull; Human-in-the-Loop
            </p>
          </div>
        </div>

        {/* Status badges & capabilities */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
            <Cpu className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-medium">Parser: PyMuPDF / python-docx</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
            <Eye className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium">OCR: Tesseract</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold">{isMock ? 'Mock AI Mode (Active)' : providerName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

