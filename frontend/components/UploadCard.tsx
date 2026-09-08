'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import { SampleDocument } from '../types';

interface UploadCardProps {
  onFileUpload: (file: File) => void;
  onSampleSelect: (sampleId: string) => void;
  samples: SampleDocument[];
  isProcessing: boolean;
  currentProgress: number;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg', '.txt'];
const MAX_SIZE_MB = 20;

export const UploadCard: React.FC<UploadCardProps> = ({
  onFileUpload,
  onSampleSelect,
  samples,
  isProcessing,
  currentProgress,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndHandleFile = (file: File) => {
    setErrorMsg(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMsg(`Unsupported file format '${ext}'. Please upload PDF, DOCX, PNG, JPG, or TXT.`);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`File size exceeds limit (${MAX_SIZE_MB}MB).`);
      return;
    }
    setSelectedFile(file);
    onFileUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndHandleFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upload Box */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-blue-600" />
              Upload Experience Letter
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Supports digital PDFs, scanned documents, Word files, and raster images
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
            Max 20MB
          </span>
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-inner">
            <UploadCloud className="h-7 w-7 animate-pulse" />
          </div>

          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Drag & Drop Experience Letter here, or{' '}
            <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2">browse files</span>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            Accepts PDF (digital or scanned), DOCX, PNG, JPG, JPEG, TXT
          </p>

          {/* Supported format tags */}
          <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
            {['PDF', 'DOCX', 'PNG', 'JPG', 'TXT'].map((ext) => (
              <span
                key={ext}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                .{ext.toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Selected file preview & progress */}
        {selectedFile && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <File className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {selectedFile.name}
                </span>
                <span className="text-slate-400">({formatFileSize(selectedFile.size)})</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {isProcessing ? `${currentProgress}%` : 'Uploaded'}
              </span>
            </div>

            {/* Progress bar */}
            {isProcessing && (
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Error notice */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Preloaded Samples Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Instant Demo: Try a Sample
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Test the full intelligent document processing pipeline immediately without uploading a file.
          </p>

          <div className="space-y-2.5">
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                disabled={isProcessing}
                onClick={() => onSampleSelect(sample.id)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all duration-150 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {sample.title}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {sample.description}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                    {sample.expected_type}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Rule & Semantic Extraction</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Ready
          </span>
        </div>
      </div>
    </div>
  );
};

