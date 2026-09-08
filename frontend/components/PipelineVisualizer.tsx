'use client';

import React from 'react';
import {
  UploadCloud,
  FileSearch,
  FileText,
  Eye,
  Brain,
  Layers,
  CheckCircle2,
  Table,
  Check,
  Clock,
  MinusCircle
} from 'lucide-react';
import { PipelineStage } from '../types';

interface PipelineVisualizerProps {
  stages: PipelineStage[];
  activeStageIndex: number;
  isComplete: boolean;
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  upload: <UploadCloud className="h-4 w-4" />,
  detection: <FileSearch className="h-4 w-4" />,
  extraction: <FileText className="h-4 w-4" />,
  ocr: <Eye className="h-4 w-4" />,
  ai_analysis: <Brain className="h-4 w-4" />,
  extraction_struct: <Layers className="h-4 w-4" />,
  validation: <CheckCircle2 className="h-4 w-4" />,
  results: <Table className="h-4 w-4" />,
};

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  stages,
  activeStageIndex,
  isComplete
}) => {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            IDP Processing Pipeline Visualizer
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step-by-step trace showing document ingestion, format routing, OCR evaluation, AI semantics, and validation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Completed
          </span>
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></span> Active
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600"></span> Skipped/Pending
          </span>
        </div>
      </div>

      {/* Steps horizontal bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {stages.map((stage, idx) => {
          const isDone = isComplete || stage.status === 'completed';
          const isSkipped = stage.status === 'skipped';
          const isActive = !isComplete && idx === activeStageIndex;

          return (
            <div
              key={stage.stage_id}
              className={`relative rounded-xl p-3 border transition-all duration-200 flex flex-col justify-between ${
                isSkipped
                  ? 'bg-slate-50/50 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                  : isDone
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-sm'
                  : isActive
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    isSkipped
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isDone ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : isSkipped ? (
                    <MinusCircle className="h-4 w-4" />
                  ) : (
                    STAGE_ICONS[stage.stage_id] || idx + 1
                  )}
                </div>

                {stage.duration_ms !== undefined && isDone && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {stage.duration_ms}ms
                  </span>
                )}
              </div>

              {/* Label */}
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
                  Stage 0{idx + 1}
                </span>
                <span
                  className={`text-xs font-bold block leading-tight mt-0.5 ${
                    isDone
                      ? 'text-slate-900 dark:text-white'
                      : isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {stage.name}
                </span>
              </div>

              {/* Status detail snippet */}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {stage.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

