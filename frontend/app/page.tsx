'use client';
import { useState } from 'react';
import Header from '../components/Header';
import UploadCard from '../components/UploadCard';
import PipelineVisualizer from '../components/PipelineVisualizer';
import ResultsDashboard from '../components/ResultsDashboard';
import { ProcessingResponse } from '../types/api';

export default function Home() {
  const [result, setResult] = useState<ProcessingResponse | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleReset = () => {
    setResult(null);
    setProcessing(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Header isMock={result?.is_mock ?? true} aiProvider={result?.ai_provider} />

      <main style={{ flex: 1, maxWidth: 1280, margin: '0 auto', width: '100%', padding: '40px 24px 80px' }}>
        {!result && !processing && (
          <div className="animate-fade-in">
            <UploadCard onResult={r => setResult(r as ProcessingResponse)} onProcessing={setProcessing} />
          </div>
        )}

        {processing && !result && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--accent-blue)',
              margin: '0 auto 20px',
            }} className="animate-spin" />
            <h2 style={{ margin: '0 0 8px', fontWeight: 700 }}>Analyzing Document…</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Extracting text, running AI analysis, validating fields.</p>
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <PipelineVisualizer stages={result.pipeline_stages} />
            <ResultsDashboard result={result} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Experience Letter Extractor · Powered by FastAPI + Next.js · Mock AI Mode by default · Add API keys for real extraction
        </p>
      </footer>
    </div>
  );
}
