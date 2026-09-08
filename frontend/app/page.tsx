'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { UploadCard } from '../components/UploadCard';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { ProcessingResponse, SampleDocument, ExperienceLetterData, PipelineStage } from '../types';
import { Sparkles, Terminal, FileCode2, Layers, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const DEFAULT_SAMPLES: SampleDocument[] = [
  {
    id: 'sample1',
    title: 'Sample 1 — Standard Experience Letter',
    filename: 'sample1_standard.pdf',
    description: 'Standard corporate format with full dates, designation, and signatory.',
    expected_type: 'Digital PDF / Text',
    raw_text: `TO WHOMSOEVER IT MAY CONCERN\n\nThis is to certify that Ms. Supriya Sanjeevakumar was employed with\nABC Technologies Pvt. Ltd. as a Software Engineer from January 10,\n2023 to August 30, 2026.\n\nDuring her tenure, she demonstrated strong technical skills and\nprofessionalism.\n\nWe wish her success in all her future endeavors.\n\nFor ABC Technologies Pvt. Ltd.\n\nRahul Sharma\nHR Manager\n\nDate: September 1, 2026`
  },
  {
    id: 'sample2',
    title: 'Sample 2 — Different Writing Style',
    filename: 'sample2_different_style.pdf',
    description: 'Alternative certificate style, with full-time phrasing and different wording.',
    expected_type: 'Experience Certificate',
    raw_text: `EXPERIENCE CERTIFICATE\n\nThis is to confirm that Mr. Arjun Kumar worked with XYZ Solutions\nPrivate Limited between March 15, 2021 and July 20, 2024.\n\nHe served in the role of Senior Software Developer.\n\nArjun was a full-time employee and contributed significantly to\nmultiple software development projects during his employment.\n\nWe appreciate his contribution and wish him the best.\n\nPriya Menon\nHuman Resources Director\n\nIssued on: July 25, 2024`
  },
  {
    id: 'sample3',
    title: 'Sample 3 — Missing Information',
    filename: 'sample3.txt',
    description: 'Informal letter missing exact dates and signatory, triggering validation warnings.',
    expected_type: 'Informal Letter (Gaps)',
    raw_text: `TO WHOMSOEVER IT MAY CONCERN\n\nThis is to certify that Ananya Sharma was employed by Innovate Labs\nas a Data Analyst.\n\nShe worked with the organization for approximately three years.\n\nDuring her employment, she performed her responsibilities sincerely\nand professionally.\n\nWe wish her success in her future career.\n\nInnovate Labs`
  }
];

const INITIAL_STAGES: PipelineStage[] = [
  { stage_id: 'upload', name: 'Document Ingestion', status: 'pending', detail: 'Awaiting document upload or sample selection.' },
  { stage_id: 'detection', name: 'File Detection', status: 'pending', detail: 'Detect format: PDF, Word, or Raster Image.' },
  { stage_id: 'extraction', name: 'Text Extraction', status: 'pending', detail: 'PyMuPDF or python-docx digital extraction.' },
  { stage_id: 'ocr', name: 'OCR Evaluation', status: 'pending', detail: 'Run Tesseract OCR for scans and images.' },
  { stage_id: 'ai_analysis', name: 'AI Semantic Understanding', status: 'pending', detail: 'Parse unstructured natural language.' },
  { stage_id: 'extraction_struct', name: 'Information Extraction', status: 'pending', detail: 'Extract employee, company, role, timeline.' },
  { stage_id: 'validation', name: 'Data Validation', status: 'pending', detail: 'Validate mandatory fields and timeline order.' },
  { stage_id: 'results', name: 'Structured Results', status: 'pending', detail: 'Generate final verified schema.' },
];

export default function Home() {
  const [samples, setSamples] = useState<SampleDocument[]>(DEFAULT_SAMPLES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [resultData, setResultData] = useState<ProcessingResponse | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/samples`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: SampleDocument[]) => {
        if (data && data.length > 0) setSamples(data);
      })
      .catch(() => {});
  }, []);

  const simulateProgress = async () => {
    setProgress(15);
    setActiveStageIdx(0);
    await new Promise((r) => setTimeout(r, 120));
    setProgress(35);
    setActiveStageIdx(1);
    await new Promise((r) => setTimeout(r, 150));
    setProgress(55);
    setActiveStageIdx(2);
    await new Promise((r) => setTimeout(r, 180));
    setProgress(75);
    setActiveStageIdx(4);
    await new Promise((r) => setTimeout(r, 160));
    setProgress(90);
    setActiveStageIdx(6);
  };

  const handleSampleSelect = async (sampleId: string) => {
    setIsProcessing(true);
    setErrorNotice(null);
    setPipelineStages(INITIAL_STAGES.map((s, idx) => ({ ...s, status: idx === 0 ? 'active' : 'pending' })));

    const progressPromise = simulateProgress();

    try {
      const response = await fetch(`${BACKEND_URL}/api/process-sample/${sampleId}`, {
        method: 'POST',
      });

      await progressPromise;

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}: ${response.statusText}`);
      }

      const data: ProcessingResponse = await response.json();
      setProgress(100);
      setPipelineStages(data.pipeline_stages);
      setResultData(data);
    } catch (err: any) {
      setErrorNotice(`Processing error: ${err.message || 'Could not connect to backend server on port 8000.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setErrorNotice(null);
    setPipelineStages(INITIAL_STAGES.map((s, idx) => ({ ...s, status: idx === 0 ? 'active' : 'pending' })));

    const progressPromise = simulateProgress();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      await progressPromise;

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || `Upload failed with status ${response.status}`);
      }

      const data: ProcessingResponse = await response.json();
      setProgress(100);
      setPipelineStages(data.pipeline_stages);
      setResultData(data);
    } catch (err: any) {
      setErrorNotice(`Upload processing error: ${err.message || 'Could not process uploaded document.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async (updatedData: ExperienceLetterData) => {
    setIsApproving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updated_data: updatedData,
          approval_notes: 'Reviewed and confirmed by human operator via HITL dashboard.',
        }),
      });
      if (!response.ok) throw new Error('Failed to record approval status');
      if (resultData) {
        setResultData({
          ...resultData,
          extracted_data: {
            ...updatedData,
            validation_status: 'Approved by Reviewer',
          },
        });
      }
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Header
        isMock={resultData ? resultData.is_mock : true}
        providerName={resultData ? resultData.ai_provider : 'Mock AI Engine'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 rounded-3xl p-7 text-white shadow-lg shadow-blue-500/10">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/20">
              <Sparkles className="h-3.5 w-3.5" /> Intelligent Document Processing Demo
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              AI Experience Letter Information Extractor
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              Demonstrating automated document ingestion, digital PDF & DOCX text parsing, image OCR, semantic AI extraction, automated data quality validation, and Human-in-the-Loop review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
              <span className="text-blue-200 block text-[11px] font-mono">CORE CAPABILITY</span>
              <span className="font-bold text-white">Digital Parsing &bull; OCR &bull; AI Semantics</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
              <span className="text-blue-200 block text-[11px] font-mono">AI PROVIDER MODE</span>
              <span className="font-bold text-emerald-300">Mock AI Mode + Real LLM Ready</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorNotice && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error Processing Document</p>
              <p className="text-xs mt-0.5 opacity-90">{errorNotice}</p>
              <p className="text-xs mt-2 text-rose-700 dark:text-rose-300 font-mono">
                Make sure the backend is running with: <code className="bg-white dark:bg-black px-1.5 py-0.5 rounded">uvicorn backend.app.main:app --reload</code>
              </p>
            </div>
          </div>
        )}

        {/* Phase 1: Upload Card & Sample Selector */}
        <UploadCard
          onFileUpload={handleFileUpload}
          onSampleSelect={handleSampleSelect}
          samples={samples}
          isProcessing={isProcessing}
          currentProgress={progress}
        />

        {/* Phase 8: Pipeline Stepper Visualizer */}
        <PipelineVisualizer
          stages={pipelineStages}
          activeStageIndex={activeStageIdx}
          isComplete={!isProcessing && resultData !== null}
        />

        {/* Phase 7 & 8: Structured Results Dashboard */}
        {resultData && (
          <ResultsDashboard
            data={resultData}
            onApprove={handleApprove}
            isApproving={isApproving}
          />
        )}

        {/* Quick Instructions & Architecture Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 dark:text-slate-200">
              <FileCode2 className="h-4 w-4 text-blue-600" />
              1. Digital vs Scanned Routing
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Digital PDFs & DOCX files are extracted directly via PyMuPDF and python-docx. Scanned PDFs and raster images (PNG, JPG) automatically trigger the Tesseract OCR engine.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              2. Semantic Understanding
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              The AI layer understands varied phrasing ("served in the role of", "employed with", "tenure"), normalizes dates to YYYY-MM-DD, and identifies missing data instead of hallucinating.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 dark:text-slate-200">
              <Terminal className="h-4 w-4 text-emerald-600" />
              3. Human-in-the-Loop (HITL)
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Reviewers can modify any extracted field directly in the UI, review confidence meters and validation diagnostics, and approve the finalized record.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-400">
        <p>AI Experience Letter Information Extractor &bull; Built with FastAPI, Next.js, PyMuPDF, python-docx, Tesseract OCR, and Tailwind CSS</p>
      </footer>
    </div>
  );
}
