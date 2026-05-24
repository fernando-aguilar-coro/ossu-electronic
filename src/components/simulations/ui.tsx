import React from 'react';


// ── Dot ───────────────────────────────────────────────────────────────────
export function Dot({ color, label }: { color: string; label: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 16, fontSize: 12, fontWeight: 500, color: 'var(--ifm-font-color-base)' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: '0 0 4px rgba(0,0,0,0.15)' }} />
      {label}
    </span>
  );
}

// ── InputField ────────────────────────────────────────────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  description?: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

export function InputField({ label, description, style, containerStyle, ...props }: InputFieldProps) {
  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', opacity: props.disabled ? 0.65 : 1, transition: 'opacity 0.2s', ...containerStyle }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ifm-color-primary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      <input
        style={{
          width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)',
          background: props.disabled ? (isDark ? 'rgba(30,41,59,0.5)' : '#f1f5f9') : 'var(--ifm-background-color)',
          color: props.disabled ? (isDark ? '#64748b' : '#94a3b8') : 'var(--ifm-font-color-base)',
          fontFamily: 'var(--ifm-font-family-monospace)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
          cursor: props.disabled ? 'not-allowed' : 'text', transition: 'all 0.15s ease', ...style,
        }}
        {...props}
      />
      {description && (
        <span style={{ fontSize: 11, color: 'var(--ifm-color-secondary-contrast-foreground)', marginTop: 5, display: 'block', lineHeight: '1.3' }}>
          {description}
        </span>
      )}
    </div>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────
export function MetricCard({ label, value, color = 'var(--ifm-font-color-base)' }: { label: React.ReactNode; value: string; color?: string }) {
  return (
    <div style={{ background: 'var(--ifm-background-color)', border: '1px solid var(--ifm-toc-border-color)', borderRadius: 10, padding: '12px 14px', textAlign: 'center', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)', transition: 'transform 0.2s ease, border-color 0.2s ease' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ifm-color-secondary-contrast-foreground)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--ifm-font-family-monospace)', fontSize: 14, fontWeight: 700, color, wordBreak: 'break-all' }}>
        {value}
      </div>
    </div>
  );
}

// ── MetricsGrid ───────────────────────────────────────────────────────────
export function MetricsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginTop: 16 }}>
      {children}
    </div>
  );
}

// ── SimulationError ───────────────────────────────────────────────────────
export function SimulationError({ error }: { error: string }) {
  return (
    <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#ef4444', fontSize: 13, lineHeight: '1.4' }}>
      <strong>Error:</strong> {error}
    </div>
  );
}

// ── tabBtnStyle ───────────────────────────────────────────────────────────
export const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
  background: active ? 'var(--ifm-color-primary)' : 'transparent',
  color: active ? '#fff' : 'var(--ifm-font-color-base)',
  border: 'none', outline: 'none', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});
