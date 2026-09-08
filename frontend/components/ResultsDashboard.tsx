'use client';
import { useState } from 'react';
import { ProcessingResponse, ExperienceLetterData } from '../types/api';

interface ResultsDashboardProps {
  result: ProcessingResponse;
  onReset: () => void;
}

const FIELDS: { key: keyof ExperienceLetterData; label: string; icon: string }[] = [
  { key: 'document_type',      label: 'Document Type',      icon: '📄' },
  { key: 'employee_name',      label: 'Employee Name',       icon: '👤' },
  { key: 'company_name',       label: 'Company Name',        icon: '🏢' },
  { key: 'designation',        label: 'Designation / Role',  icon: '💼' },
  { key: 'employment_type',    label: 'Employment Type',     icon: '⏱️' },
  { key: 'joining_date',       label: 'Joining Date',        icon: '📅' },
  { key: 'last_working_date',  label: 'Last Working Date',   icon: '📅' },
  { key: 'employment_duration',label: 'Duration',            icon: '⏳' },
  { key: 'letter_issue_date',  label: 'Letter Issue Date',   icon: '🗓️' },
  { key: 'signatory_name',     label: 'Signatory Name',      icon: '✍️' },
  { key: 'signatory_designation', label: 'Signatory Role',   icon: '🎖️' },
];

const STATUS_COLORS = { pass: 'var(--accent-green)', warning: 'var(--accent-amber)', fail: 'var(--accent-red)' };
const STATUS_ICONS  = { pass: '✓', warning: '⚠', fail: '✕' };

function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--accent-green)' : score >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="confidence-bar" style={{ flex: 1 }}>
        <div className="confidence-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span style={{ fontSize: '0.72rem', color, fontWeight: 600, minWidth: 30, textAlign: 'right' }}>{score}%</span>
    </div>
  );
}

export default function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const [tab, setTab] = useState<'info' | 'text' | 'json' | 'validation' | 'review'>('info');
  const [editData, setEditData] = useState<ExperienceLetterData>({ ...result.extracted_data });
  const [approved, setApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalMsg, setApprovalMsg] = useState('');

  const { document: doc, extracted_data: data, validation, is_mock, ai_provider, raw_ai_json, processing_time_ms } = result;
  const jsonText = JSON.stringify(raw_ai_json ?? data, null, 2);

  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = doc.filename.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-');
    link.href = url;
    link.download = `${baseName || 'extraction-result'}.json`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleApprove = async () => {
    setApproving(true);
    await Promise.resolve();
    setApproved(true);
    setApprovalMsg('Record approved successfully on this device!');
    setApproving(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 700 }}>Results</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {doc.filename} · {doc.file_type.toUpperCase()} · {processing_time_ms.toFixed(0)}ms
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className={`badge ${is_mock ? 'badge-amber' : 'badge-green'}`}>{is_mock ? '🤖 Mock' : `✨ ${ai_provider}`}</span>
          <span className={`badge ${validation.overall_status === 'PASS' ? 'badge-green' : validation.overall_status === 'WARNING' ? 'badge-amber' : 'badge-red'}`}>
            {validation.overall_status}
          </span>
          <button id="reset-btn" className="btn-secondary" onClick={onReset} style={{ padding: '4px 14px', fontSize: '0.8rem' }}>
            ← New Upload
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Passed Checks', value: validation.passed_count, color: 'var(--accent-green)' },
          { label: 'Warnings',      value: validation.warning_count, color: 'var(--accent-amber)' },
          { label: 'Failed Checks', value: validation.fail_count,    color: 'var(--accent-red)' },
          { label: 'Pages',         value: doc.page_count,           color: 'var(--accent-blue)' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '14px 16px' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 10, padding: 4, overflowX: 'auto' }}>
        {([
          { id: 'info',       label: '📋 Structured Info' },
          { id: 'review',     label: '✏️ Review & Edit' },
          { id: 'validation', label: '✅ Validation' },
          { id: 'text',       label: '📄 Raw Text' },
          { id: 'json',       label: '{ } AI JSON' },
        ] as { id: typeof tab; label: string }[]).map(t => (
          <button key={t.id} id={`tab-${t.id}`} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Structured Info */}
      {tab === 'info' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {FIELDS.map(f => {
              const val = data[f.key] as string | null;
              const score = data.confidence_scores?.[f.key as string] ?? 0;
              const hasVal = val && String(val).trim();
              return (
                <div key={f.key} style={{
                  background: 'var(--bg-primary)', borderRadius: 10,
                  padding: '14px 16px',
                  border: `1px solid ${hasVal ? 'var(--border)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</span>
                  </div>
                  <p style={{
                    margin: '0 0 10px', fontWeight: 600, fontSize: '0.9rem',
                    color: hasVal ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontStyle: hasVal ? 'normal' : 'italic',
                  }}>
                    {hasVal || 'Not found'}
                  </p>
                  {f.key in data.confidence_scores && <ConfidenceBar score={score} />}
                </div>
              );
            })}
          </div>
          <p style={{ margin: '16px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{data.confidence_note}</p>
        </div>
      )}

      {/* Tab: Review & Edit */}
      {tab === 'review' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Human Review</h3>
            {approved && <span className="badge badge-green">✓ Approved</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {FIELDS.filter(f => f.key !== 'confidence_scores' && f.key !== 'confidence_note' && f.key !== 'processing_method' && f.key !== 'validation_status').map(f => {
              const score = (editData.confidence_scores as Record<string, number>)?.[f.key] ?? -1;
              const valCheck = validation.checks.find(c => c.field === f.key);
              const inputClass = `field-input${valCheck?.status === 'warning' ? ' warn' : valCheck?.status === 'fail' ? ' fail' : ''}`;
              return (
                <div key={f.key}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <span>{f.icon}</span>{f.label}
                    {valCheck && (
                      <span style={{ marginLeft: 'auto', color: STATUS_COLORS[valCheck.status], fontSize: '0.7rem' }}>
                        {STATUS_ICONS[valCheck.status]} {valCheck.status}
                      </span>
                    )}
                    {score >= 0 && <span style={{ color: score >= 80 ? 'var(--accent-green)' : 'var(--accent-amber)', fontSize: '0.7rem' }}>{score}%</span>}
                  </label>
                  <input
                    id={`edit-${f.key}`}
                    className={inputClass}
                    value={(editData[f.key] as string) || ''}
                    onChange={e => setEditData(prev => ({ ...prev, [f.key]: e.target.value || null }))}
                    placeholder={`Enter ${f.label.toLowerCase()}…`}
                  />
                  {valCheck && valCheck.status !== 'pass' && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: STATUS_COLORS[valCheck.status] }}>{valCheck.message}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button id="approve-btn" className="btn-primary" onClick={handleApprove} disabled={approving || approved}>
              {approving ? 'Approving…' : approved ? '✓ Approved' : '✅ Approve Information'}
            </button>
            <button id="reset-review-btn" className="btn-secondary" onClick={() => setEditData({ ...result.extracted_data })}>
              Reset
            </button>
          </div>
          {approvalMsg && (
            <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: approved ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{approvalMsg}</p>
          )}
        </div>
      )}

      {/* Tab: Validation */}
      {tab === 'validation' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              padding: '6px 16px', borderRadius: 8, fontWeight: 700,
              background: validation.overall_status === 'PASS' ? 'rgba(16,185,129,0.1)' : validation.overall_status === 'WARNING' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
              color: validation.overall_status === 'PASS' ? 'var(--accent-green)' : validation.overall_status === 'WARNING' ? 'var(--accent-amber)' : 'var(--accent-red)',
              border: `1px solid currentColor`,
            }}>
              {validation.overall_status}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {validation.passed_count} passed · {validation.warning_count} warnings · {validation.fail_count} failed
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {validation.checks.map((check, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                background: 'var(--bg-primary)', borderRadius: 10,
                border: `1px solid ${STATUS_COLORS[check.status]}22`,
              }}>
                <span style={{ color: STATUS_COLORS[check.status], fontWeight: 700, fontSize: '0.9rem', marginTop: 1 }}>{STATUS_ICONS[check.status]}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{check.label}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{check.message}</p>
                  {check.value && <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{check.value}</p>}
                </div>
                <span className={`badge ${check.status === 'pass' ? 'badge-green' : check.status === 'warning' ? 'badge-amber' : 'badge-red'}`}>{check.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Raw Text */}
      {tab === 'text' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Extracted Text</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {doc.is_scanned && <span className="badge badge-purple">OCR</span>}
              <span className="badge badge-blue">{doc.method}</span>
            </div>
          </div>
          <pre style={{
            margin: 0, padding: '16px', background: 'var(--bg-primary)', borderRadius: 10,
            fontSize: '0.8rem', lineHeight: 1.7, color: 'var(--text-secondary)',
            overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            border: '1px solid var(--border)', maxHeight: 450, overflowY: 'auto',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {doc.raw_text || '(no text extracted)'}
          </pre>
        </div>
      )}

      {/* Tab: AI JSON */}
      {tab === 'json' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Raw AI JSON Output</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                id="copy-json-btn"
                className="btn-secondary"
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                onClick={() => navigator.clipboard.writeText(jsonText)}
              >
                Copy JSON
              </button>
              <button
                id="download-json-btn"
                className="btn-secondary"
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                onClick={handleDownloadJson}
              >
                Download JSON
              </button>
            </div>
          </div>
          <pre style={{
            margin: 0, padding: '16px', background: 'var(--bg-primary)', borderRadius: 10,
            fontSize: '0.78rem', lineHeight: 1.7, color: '#a78bfa',
            overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            border: '1px solid var(--border)', maxHeight: 500, overflowY: 'auto',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {jsonText}
          </pre>
        </div>
      )}
    </div>
  );
}
