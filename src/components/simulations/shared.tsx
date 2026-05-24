import React from 'react';

// ── Legend Dot Component ──────────────────────────────────────────────────
export interface DotProps {
  color: string;
  label: string;
}

export function Dot({ color, label }: DotProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginRight: 16,
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--ifm-font-color-base)',
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          boxShadow: '0 0 4px rgba(0,0,0,0.15)',
        }}
      />
      {label}
    </span>
  );
}

// ── Card Component ────────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: string | number;
}

export function Card({ children, style, padding = '20px 24px', ...props }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--ifm-card-background-color, var(--ifm-background-surface-color))',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 14,
        padding,
        marginBottom: 16,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ── InputField Component ──────────────────────────────────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  containerStyle?: React.CSSProperties;
}

export function InputField({ label, description, style, containerStyle, ...props }: InputFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...containerStyle }}>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--ifm-color-primary)',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </label>
      <input
        style={{
          width: '100%',
          padding: '9px 12px',
          borderRadius: 8,
          border: '1px solid var(--ifm-toc-border-color)',
          background: 'var(--ifm-background-color)',
          color: 'var(--ifm-font-color-base)',
          fontFamily: 'var(--ifm-font-family-monospace)',
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          ...style,
        }}
        {...props}
      />
      {description && (
        <span
          style={{
            fontSize: 11,
            color: 'var(--ifm-color-secondary-contrast-foreground)',
            marginTop: 5,
            display: 'block',
            lineHeight: '1.3',
          }}
        >
          {description}
        </span>
      )}
    </div>
  );
}

// ── MetricCard Component ──────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string;
  color?: string;
}

export function MetricCard({ label, value, color = 'var(--ifm-font-color-base)' }: MetricCardProps) {
  return (
    <div
      style={{
        background: 'var(--ifm-background-color)',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 10,
        padding: '12px 14px',
        textAlign: 'center',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--ifm-color-secondary-contrast-foreground)',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--ifm-font-family-monospace)',
          fontSize: 14,
          fontWeight: 700,
          color,
          wordBreak: 'break-all',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ── SimulationControls Component ──────────────────────────────────────────
interface SimulationControlsProps {
  playing: boolean;
  hasIterations: boolean;
  step: number;
  totalSteps: number;
  onCalculate: () => void;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function SimulationControls({
  playing,
  hasIterations,
  step,
  totalSteps,
  onCalculate,
  onPlay,
  onPause,
  onPrev,
  onNext,
}: SimulationControlsProps) {
  const btnStyle = (primary: boolean): React.CSSProperties => ({
    padding: '9px 18px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    background: primary ? 'var(--ifm-color-primary)' : 'var(--ifm-background-surface-color)',
    color: primary ? '#fff' : 'var(--ifm-font-color-base)',
    outline: primary ? 'none' : '1px solid var(--ifm-toc-border-color)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: primary ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <button style={btnStyle(true)} onClick={onCalculate}>
        ▶ Calcular
      </button>

      {hasIterations && (
        <>
          {!playing && step < totalSteps && (
            <button style={btnStyle(false)} onClick={onPlay}>
              ⏵ Animar
            </button>
          )}
          {playing && (
            <button style={btnStyle(false)} onClick={onPause}>
              ⏸ Pausar
            </button>
          )}
          <button style={btnStyle(false)} onClick={onPrev} disabled={step <= 1}>
            ← Ant.
          </button>
          <button style={btnStyle(false)} onClick={onNext} disabled={step >= totalSteps}>
            Sig. →
          </button>
          <span
            style={{
              fontSize: 13,
              color: 'var(--ifm-font-color-base)',
              marginLeft: 'auto',
              fontWeight: 500,
            }}
          >
            Iteración {step} / {totalSteps}
          </span>
        </>
      )}
    </div>
  );
}

// ── TabButton CSS Utility ──────────────────────────────────────────────────
export const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
  background: active ? 'var(--ifm-color-primary)' : 'transparent',
  color: active ? '#fff' : 'var(--ifm-font-color-base)',
  border: 'none',
  outline: 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});
