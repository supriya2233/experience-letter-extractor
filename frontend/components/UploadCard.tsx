'use client';
import { useState, useRef, useCallback } from 'react';
import { SampleDocument } from '../types/api';
import { processFile as runFilePipeline, processSample as runSamplePipeline, SAMPLES } from '../lib/pipeline';

interface UploadCardProps {
  onResult: (data: unknown) => void;
  onProcessing: (val: boolean) => void;
}

const ACCEPTED = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg'];
const MAX_MB = 20;

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadCard({ onResult, onProcessing }: UploadCardProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [samples, setSamples] = useState<SampleDocument[]>([]);
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [loadingSample, setLoadingSample] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) return `Unsupported type "${ext}". Use PDF, DOCX, TXT, PNG, or JPEG.`;
    if (f.size > MAX_MB * 1024 * 1024) return `File too large (${formatBytes(f.size)}). Max ${MAX_MB} MB.`;
    return '';
  };

  const processFile = useCallback(async (f: File) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setFile(f);
    setError('');
    setProgress(0);
    onProcessing(true);

    // Simulate progress until response
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 12, 88));
    }, 250);

    try {
      clearInterval(interval);
      setProgress(100);
      const data = await runFilePipeline(f);
      onResult(data);
    } catch (e: unknown) {
      clearInterval(interval);
      setError((e as Error).message || 'Upload failed.');
      setProgress(0);
    } finally {
      onProcessing(false);
    }
  }, [onProcessing, onResult]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const loadSamples = async () => {
    if (samplesLoaded) { setShowSamples(s => !s); return; }
    setSamples(SAMPLES);
    setSamplesLoaded(true);
    setShowSamples(true);
  };

  const processSample = async (id: string) => {
    setLoadingSample(id);
    setError('');
    onProcessing(true);
    try {
      const data = await runSamplePipeline(id);
      onResult(data);
      setShowSamples(false);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoadingSample('');
      onProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Hero section */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--gradient-blue)',
          fontSize: 32, marginBottom: 20,
          boxShadow: '0 0 40px rgba(59,130,246,0.3)',
        }}>📋</div>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Extract Experience Letter Data
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Upload a PDF, DOCX, text file, or image — our AI extracts and validates all fields instantly.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{ padding: '48px 32px', textAlign: 'center', position: 'relative', marginBottom: 16 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          id="file-upload-input"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          id="ocr-image-input"
        />

        <div style={{ fontSize: 40, marginBottom: 12 }}>
          {dragOver ? '📂' : '☁️'}
        </div>
        <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {dragOver ? 'Drop your file here' : 'Drag & drop your file here'}
        </p>
        <p style={{ margin: '0 0 20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          or click to browse — PDF, DOCX, TXT, PNG, JPEG · Max {MAX_MB} MB
        </p>

        <button
          id="choose-file-btn"
          className="btn-primary"
          onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
          style={{ pointerEvents: 'none' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Choose File
        </button>
        <button
          id="ocr-upload-btn"
          className="btn-secondary"
          onClick={e => { e.stopPropagation(); imageInputRef.current?.click(); }}
          style={{ marginTop: 10 }}
        >
          🖼️ Upload Image for OCR
        </button>
      </div>

      {/* Progress bar */}
      {progress > 0 && progress < 100 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Processing…</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
          <div className="confidence-bar">
            <div className="confidence-fill" style={{ width: `${progress}%`, background: 'var(--gradient-blue)' }} />
          </div>
        </div>
      )}

      {/* Uploaded file info */}
      {file && (
        <div className="glass-card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 24 }}>
            {file.name.endsWith('.pdf') ? '📄' : file.name.endsWith('.docx') ? '📝' : file.name.match(/\.(png|jpe?g)$/i) ? '🖼️' : '📃'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatBytes(file.size)}</p>
          </div>
          {progress === 100 && <span className="badge badge-green">✓ Done</span>}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          color: '#f87171', fontSize: '0.875rem', display: 'flex', gap: 8,
        }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or try a sample</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Sample selector */}
      <button
        id="load-samples-btn"
        className="btn-secondary"
        onClick={loadSamples}
        style={{ width: '100%', marginBottom: showSamples ? 12 : 0 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        {showSamples ? 'Hide Samples' : 'Try a Sample Document'}
      </button>

      {showSamples && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} className="animate-fade-in">
          {samples.map(s => (
            <button
              key={s.id}
              id={`sample-btn-${s.id}`}
              onClick={() => processSample(s.id)}
              disabled={!!loadingSample}
              style={{
                background: loadingSample === s.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
              className="glass-card"
            >
              <div style={{ fontSize: 24 }}>📋</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{s.title}</p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.description}</p>
              </div>
              {loadingSample === s.id
                ? <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%' }} />
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              }
            </button>
          ))}
        </div>
      )}

      {/* Accepted types */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20, justifyContent: 'center' }}>
        {['PDF', 'DOCX', 'TXT', 'PNG', 'JPEG'].map(t => (
          <span key={t} className="badge badge-blue">{t}</span>
        ))}
        <span className="badge badge-green">OCR for Images</span>
        <span className="badge badge-green">AI Extraction</span>
      </div>
    </div>
  );
}
