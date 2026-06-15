import React from 'react';

interface SimulationControlsProps {
  playing: boolean;
  hasIterations: boolean;
  step: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  isIdle?: boolean;
}

const btn = (primary: boolean): React.CSSProperties => ({
  padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
  background: primary ? 'var(--ifm-color-primary)' : 'var(--ifm-background-surface-color)',
  color: primary ? '#fff' : 'var(--ifm-font-color-base)',
  outline: primary ? 'none' : '1px solid var(--ifm-toc-border-color)',
  display: 'inline-flex', alignItems: 'center', gap: 6,
  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
  boxShadow: primary ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
});

export function SimulationControls({ playing, hasIterations, step, totalSteps, onPlay, onPause, onPrev, onNext, onReset, isIdle = false }: SimulationControlsProps) {
  if (!hasIterations) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
      {isIdle ? (
        <button className="sim-btn" style={btn(true)} onClick={onPlay}>▶ Calcular</button>
      ) : (
        <>
          {!playing && step < totalSteps && <button className="sim-btn" style={btn(true)} onClick={onPlay}>{step > 1 ? '▶ Continuar' : '▶ Calcular'}</button>}
          {!playing && step >= totalSteps && <button className="sim-btn" style={btn(true)} onClick={onReset}>🔄 Reiniciar</button>}
          {playing && <button className="sim-btn" style={btn(false)} onClick={onPause}>⏸ Pausar</button>}
          <button className="sim-btn" style={btn(false)} onClick={onPrev} disabled={step <= 1}>← Ant.</button>
          <button className="sim-btn" style={btn(false)} onClick={onNext} disabled={step >= totalSteps}>Sig. →</button>
          <span style={{ fontSize: 13, color: 'var(--ifm-font-color-base)', marginLeft: 'auto', fontWeight: 500 }}>
            Iteración {step} / {totalSteps}
          </span>
        </>
      )}
    </div>
  );
}
