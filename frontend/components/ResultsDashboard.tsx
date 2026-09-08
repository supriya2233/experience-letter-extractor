'use client';

import React, { useState } from 'react';
import {
  FileCheck,
  FileText,
  Code2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  Save,
  Download,
  Calendar,
  Building,
  User,
  Briefcase,
  Clock,
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import { ProcessingResponse, ExperienceLetterData } from '../types';

interface ResultsDashboardProps {
  data: ProcessingResponse;
  onApprove: (updatedData: ExperienceLetterData) => Promise<void>;
  isApproving: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  data,
  onApprove,
  isApproving
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'raw' | 'json' | 'validation'>('review');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ExperienceLetterData>(data.extracted_data);
  const [copied, setCopied] = useState(false);
  const [approvedState, setApprovedState] = useState(data.extracted_data.validation_status.includes('Approved'));

  const handleInputChange = (field: keyof ExperienceLetterData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleApproveClick = async () => {
    await onApprove(formData);
    setApprovedState(true);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(formData.employee_name || 'experience_letter').toLowerCase().replace(/\s+/g, '_')}_extracted.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConfidenceBadge = (field: string) => {
    const score = formData.confidence_scores[field];
    if (score === undefined || score === 0 || !formData[field as keyof ExperienceLetterData]) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/60">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Not Found / Low (0%)
        </span>
      );
    }
    if (score >= 90) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> {score}% &bull; High Certainty
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> {score}% &bull; Estimated
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Document Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight">
                {formData.company_name || 'Organization'}: Experience Record
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {formData.document_type || 'Experience Letter'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span><strong>File:</strong> {data.document.filename} ({data.document.page_count} pg)</span>
              <span>&bull;</span>
              <span><strong>Method:</strong> {data.document.method}</span>
              <span>&bull;</span>
              <span><strong>AI:</strong> {data.ai_provider}</span>
              <span>&bull;</span>
              <span><strong>Execution:</strong> {data.processing_time_ms} ms</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {approvedState ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Approved by Reviewer
              </span>
            ) : data.validation.is_valid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/40 text-xs font-bold">
                <FileCheck className="h-4 w-4" />
                Ready for Review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                <AlertTriangle className="h-4 w-4" />
                Attention Required
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-6 pt-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('review')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'review'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          Structured Info & Human Review
        </button>

        <button
          onClick={() => setActiveTab('raw')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'raw'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          Extracted Raw Text
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700">
            {data.document.raw_text.length} chars
          </span>
        </button>

        <button
          onClick={() => setActiveTab('json')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'json'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Code2 className="h-4 w-4" />
          AI Structured JSON Output
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'validation'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Validation Diagnostics
          {data.validation.warning_count > 0 && (
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
              {data.validation.warning_count}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Human-in-the-Loop Review Panel */}
      {activeTab === 'review' && (
        <div className="p-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Extracted Employee Information (HITL Review)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify AI output. You can edit any field before finalizing and approving the record.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Save className="h-3.5 w-3.5" /> Save Edits
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Fields
                </button>
              )}

              <button
                type="button"
                disabled={isApproving || approvedState}
                onClick={handleApproveClick}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  approvedState
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {approvedState ? 'Information Approved' : 'Approve Information'}
              </button>

              <button
                type="button"
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                title="Download JSON"
              >
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Employee Name */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-600" /> Employee Name
                </label>
                {getConfidenceBadge('employee_name')}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.employee_name || ''}
                  onChange={(e) => handleInputChange('employee_name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formData.employee_name || <span className="text-slate-400 italic">Not detected</span>}
                </div>
              )}
            </div>

            {/* Company Name */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-indigo-600" /> Employing Organization
                </label>
                {getConfidenceBadge('company_name')}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.company_name || ''}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formData.company_name || <span className="text-slate-400 italic">Not detected</span>}
                </div>
              )}
            </div>

            {/* Designation */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-cyan-600" /> Designation / Role
                </label>
                {getConfidenceBadge('designation')}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.designation || ''}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formData.designation || <span className="text-slate-400 italic">Not detected</span>}
                </div>
              )}
            </div>

            {/* Employment Type */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-purple-600" /> Employment Type
                </label>
                {getConfidenceBadge('employment_type')}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.employment_type || ''}
                  onChange={(e) => handleInputChange('employment_type', e.target.value)}
                  placeholder="e.g. Full-time, Part-time, Contract"
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formData.employment_type || <span className="text-slate-400 italic">Unspecified</span>}
                </div>
              )}
            </div>

            {/* Joining Date */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Joining Date (Start)
                </label>
                {getConfidenceBadge('joining_date')}
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.joining_date || ''}
                  onChange={(e) => handleInputChange('joining_date', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold font-mono text-slate-900 dark:text-white">
                  {formData.joining_date || <span className="text-red-500 italic font-sans">Missing from document</span>}
                </div>
              )}
            </div>

            {/* Last Working Date */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-rose-600" /> Last Working Date (End)
                </label>
                {getConfidenceBadge('last_working_date')}
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.last_working_date || ''}
                  onChange={(e) => handleInputChange('last_working_date', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold font-mono text-slate-900 dark:text-white">
                  {formData.last_working_date || <span className="text-red-500 italic font-sans">Missing from document</span>}
                </div>
              )}
            </div>

            {/* Employment Duration */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" /> Calculated Tenure / Duration
                </label>
                {getConfidenceBadge('employment_duration')}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.employment_duration || ''}
                  onChange={(e) => handleInputChange('employment_duration', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formData.employment_duration || <span className="text-slate-400 italic">Not specified</span>}
                </div>
              )}
            </div>

            {/* Issue Date */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Letter Issue Date
                </label>
                {getConfidenceBadge('letter_issue_date')}
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.letter_issue_date || ''}
                  onChange={(e) => handleInputChange('letter_issue_date', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold font-mono text-slate-900 dark:text-white">
                  {formData.letter_issue_date || <span className="text-slate-400 italic font-sans">Unspecified</span>}
                </div>
              )}
            </div>

            {/* Signatory Name */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-600" /> Signatory Authority
                </label>
                {getConfidenceBadge('signatory_name')}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.signatory_name || ''}
                  onChange={(e) => handleInputChange('signatory_name', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formData.signatory_name || <span className="text-slate-400 italic">Not found</span>}
                </div>
              )}
            </div>

            {/* Signatory Designation */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-slate-600" /> Signatory Designation
                </label>
                {getConfidenceBadge('signatory_designation')}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.signatory_designation || ''}
                  onChange={(e) => handleInputChange('signatory_designation', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formData.signatory_designation || <span className="text-slate-400 italic">Not found</span>}
                </div>
              )}
            </div>
          </div>

          {/* Confidence calibration notice */}
          <div className="mt-6 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <span className="font-bold">Confidence & Extraction Certainty: </span>
              {formData.confidence_note}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Raw Extracted Text */}
      {activeTab === 'raw' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Raw Extracted Document Text
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Text stream as ingested from the {data.document.method}.
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(data.document.raw_text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-800 max-h-[500px] overflow-y-auto">
            {data.document.raw_text}
          </pre>
        </div>
      )}

      {/* Tab 3: AI JSON Output */}
      {activeTab === 'json' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Structured JSON Representation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Normalized JSON payload generated by the {data.ai_provider} layer.
              </p>
            </div>
            <button
              onClick={handleCopyJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-800 max-h-[500px] overflow-y-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 4: Validation Diagnostics */}
      {activeTab === 'validation' && (
        <div className="p-6">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Quality & Cross-Field Rules Validation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automated rules verification for mandatory fields, ISO date formatting, and chronology consistency.
            </p>
          </div>

          <div className="space-y-3">
            {data.validation.checks.map((check, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-4 ${
                  check.status === 'pass'
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                    : check.status === 'warning'
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                    : 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {check.status === 'pass' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    {check.status === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    {check.status === 'fail' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {check.label}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {check.message}
                    </p>
                    {check.value && (
                      <span className="inline-block mt-1 font-mono text-[11px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        Observed: {check.value}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    check.status === 'pass'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                      : check.status === 'warning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200'
                  }`}
                >
                  {check.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

