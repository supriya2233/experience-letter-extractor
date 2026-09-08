'use client';
import { PipelineStage } from '../types/api';

interface PipelineVisualizerProps {
  stages: PipelineStage[];
}

const STATUS_COLORS = {
  completed: 'var(--accent-green)',
  running:   'var(--accent-blue)',
  skipped:   'var(--text-muted)',
  error:     'var(--accent-red)',
  pending:   'var(--border-bright)',
};

const STATUS_ICONS = {
  completed: '✓',
  running:   '⟳',
  skipped:   '—',
  error:     '✕',
  pending:   '·',
};

export default function PipelineVisualizer({ stages }: PipelineVisualizerProps) {
  return (
    <div className="glass-card animate-fade-in" style={{ padding: '20px 24px' }}>
      <h3 style={{ margin: '0 0 20px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Processing Pipeline
      </h3>

      {/* Desktop: horizontal */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
        {stages.map((stage, idx) => {
          const color = STATUS_COLORS[stage.status] || 'var(--border-bright)';
          const icon = STATUS_ICONS[stage.status] || '·';
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage.stage_id} style={{ display: 'flex', alignItems: 'flex-start', flex: isLast ? '0 0 auto' : 1, minWidth: 0 }}>
              {/* Stage */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                {/* Icon circle */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: stage.status === 'completed' ? `${color}20` : 'var(--bg-primary)',
                  border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 700,
                  color: color,
                  flexShrink: 0,
                  animation: stage.status === 'running' ? 'pulse-ring 2s infinite' : 'none',
                }}>
                  {stage.status === 'running'
                    ? <div className="animate-spin" style={{ width: 14, height: 14, border: `2px solid ${color}`, borderTopColor: 'transparent', borderRadius: '50%' }} />
                    : icon
                  }
                </div>
                {/* Label */}
                <p style={{
                  margin: '6px 0 2px', fontSize: '0.7rem', fontWeight: 600,
                  color: stage.status === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)',
                  textAlign: 'center', whiteSpace: 'nowrap',
                }}>{stage.name}</p>
                {/* Duration */}
                {stage.duration_ms != null && stage.status === 'completed' && (
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {stage.duration_ms.toFixed(0)}ms
                  </p>
                )}
                {stage.status === 'skipped' && (
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>skipped</p>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div style={{
                  flex: 1, height: 2, marginTop: 17, marginLeft: 0,
                  background: idx < stages.findIndex(s => s.status !== 'completed') || stages.every(s => s.status === 'completed')
                    ? 'var(--accent-green)' : 'var(--border)',
                  transition: 'background 0.4s',
                  minWidth: 12,
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage detail cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
        {stages.filter(s => s.status !== 'pending').map(stage => (
          <div key={stage.stage_id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px',
            background: 'var(--bg-primary)',
            borderRadius: 8,
            border: `1px solid ${STATUS_COLORS[stage.status]}22`,
          }}>
            <span style={{ color: STATUS_COLORS[stage.status], fontSize: '0.8rem', width: 14, textAlign: 'center' }}>
              {STATUS_ICONS[stage.status]}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: 140 }}>{stage.name}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: 1 }}>{stage.detail}</span>
            {stage.duration_ms != null && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{stage.duration_ms.toFixed(0)}ms</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
