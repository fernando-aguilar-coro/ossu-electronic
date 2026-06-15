import React, { useRef, useEffect, useState } from 'react';
import { evalFn } from '../../services/mathUtils';

export interface SimulationCanvasProps {
  expr: string;
  centerX: number;
  defaultRange: number;
  includeIdentity?: boolean;
  onDrawOverlay?: (
    ctx: CanvasRenderingContext2D,
    toX: (x: number) => number,
    toY: (y: number) => number,
    y0: number,
    isDark: boolean
  ) => void;
}

export function SimulationCanvas({ expr, centerX, defaultRange, includeIdentity = false, onDrawOverlay }: SimulationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [size, setSize] = useState({ width: 700, height: 280 });

  useEffect(() => { setZoom(1); }, [centerX]);

  // ResizeObserver to make canvas fully responsive
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width || 700;
        // Keep a stable 2.5:1 aspect ratio
        const height = width / 2.5;
        setSize({ width, height });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const zoomFactor = isNaN(zoom) || zoom <= 0 ? 1 : zoom;
  const cx = isNaN(centerX) ? 0 : centerX;
  const dr = isNaN(defaultRange) || defaultRange <= 0 ? 2 : defaultRange;
  const xMin = cx - (dr * zoomFactor) / 2;
  const xMax = cx + (dr * zoomFactor) / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const W = size.width;
    const H = size.height;
    
    // Scale for high-DPI (Retina) screens
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const PAD = { top: 20, right: 20, bottom: 40, left: 55 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    const pts = 300;
    const xVals: number[] = [];
    const yValsExpr: number[] = [];
    for (let i = 0; i <= pts; i++) {
      const p = xMin + (i / pts) * (xMax - xMin);
      xVals.push(p);
      yValsExpr.push(evalFn(expr, p));
    }

    const finiteY = yValsExpr.filter(isFinite);
    if (includeIdentity) finiteY.push(xMin, xMax);
    if (finiteY.length === 0) return;

    const rawYMin = Math.min(...finiteY, 0);
    const rawYMax = Math.max(...finiteY, 0);
    const padY = (rawYMax - rawYMin) * 0.2 || 1;
    const yMin = rawYMin - padY;
    const yMax = rawYMax + padY;

    const toX = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const toY = (y: number) => PAD.top + ((yMax - y) / (yMax - yMin)) * plotH;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor  = isDark ? '#cbd5e1' : '#374151';
    const gridColor  = isDark ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.06)';
    const bgColor    = isDark ? '#0f1729' : '#f8fafc';
    const axisColor  = isDark ? 'rgba(148,163,184,0.4)' : 'rgba(0,0,0,0.25)';
    const identColor = isDark ? 'rgba(148,163,184,0.45)' : 'rgba(100,116,139,0.5)';
    const curveColor = isDark ? '#818cf8' : '#4f46e5';

    // Background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
    for (let g = 0; g <= 5; g++) {
      const gx = PAD.left + (g / 5) * plotW;
      const gy = PAD.top  + (g / 5) * plotH;
      ctx.beginPath(); ctx.moveTo(gx, PAD.top); ctx.lineTo(gx, PAD.top + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(PAD.left + plotW, gy); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = axisColor; ctx.lineWidth = 1.5;
    const y0 = toY(0);
    const x0 = toX(0);
    if (y0 >= PAD.top && y0 <= PAD.top + plotH) { ctx.beginPath(); ctx.moveTo(PAD.left, y0); ctx.lineTo(PAD.left + plotW, y0); ctx.stroke(); }
    if (x0 >= PAD.left && x0 <= PAD.left + plotW) { ctx.beginPath(); ctx.moveTo(x0, PAD.top); ctx.lineTo(x0, PAD.top + plotH); ctx.stroke(); }

    // Axis labels (x / y)
    ctx.fillStyle = textColor; ctx.font = 'italic bold 12px Inter, system-ui, sans-serif';
    ctx.fillText('y', x0 >= PAD.left && x0 <= PAD.left + plotW ? x0 - 12 : PAD.left + 5, PAD.top - 4);
    ctx.fillText('x', PAD.left + plotW + 8, y0 >= PAD.top && y0 <= PAD.top + plotH ? y0 + 4 : PAD.top + plotH - 5);

    // Identity line y = x
    if (includeIdentity) {
      ctx.beginPath(); ctx.strokeStyle = identColor; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
      ctx.moveTo(toX(xMin), toY(xMin)); ctx.lineTo(toX(xMax), toY(xMax)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = textColor + '90'; ctx.font = 'italic 11px Inter, sans-serif';
      ctx.fillText('y = x', toX(xMax) - 30, toY(xMax) + 14);
    }

    // Function curve
    ctx.beginPath(); ctx.strokeStyle = curveColor; ctx.lineWidth = 2.5;
    let first = true;
    for (let i = 0; i <= pts; i++) {
      const px = toX(xVals[i]);
      const py = toY(yValsExpr[i]);
      if (!isFinite(yValsExpr[i]) || py < PAD.top - 5 || py > PAD.top + plotH + 5) { first = true; continue; }
      first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      first = false;
    }
    ctx.stroke();

    // Overlay
    if (onDrawOverlay && isFinite(y0)) onDrawOverlay(ctx, toX, toY, y0, isDark);

    // Tick labels
    ctx.fillStyle = textColor; ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (let g = 0; g <= 5; g++) ctx.fillText((xMin + (g / 5) * (xMax - xMin)).toFixed(2), PAD.left + (g / 5) * plotW, H - 8);
    ctx.textAlign = 'right';
    for (let g = 0; g <= 4; g++) ctx.fillText((yMin + (g / 4) * (yMax - yMin)).toFixed(2), PAD.left - 6, PAD.top + plotH - (g / 4) * plotH + 4);
  }, [expr, xMin, xMax, includeIdentity, onDrawOverlay, size]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <canvas ref={canvasRef}
        style={{ width: '100%', height: size.height, borderRadius: 10, display: 'block', border: '1px solid var(--ifm-toc-border-color)' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, justifyContent: 'center', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', background: 'var(--ifm-background-color)' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ifm-font-color-base)' }}>🔍 Zoom:</span>
        <input type="range" min="0.05" max="3.0" step="0.05" value={zoom}
          onChange={e => setZoom(parseFloat(e.target.value))} style={{ width: 180, cursor: 'pointer' }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--ifm-font-color-base)' }}>{Math.round(100 / zoom)}%</span>
        <button onClick={() => setZoom(1)}
          style={{ padding: '2px 8px', fontSize: 11, fontWeight: 600, borderRadius: 4, border: '1px solid var(--ifm-toc-border-color)', background: 'var(--ifm-background-surface-color)', color: 'var(--ifm-font-color-base)', cursor: 'pointer' }}>
          Centrar
        </button>
      </div>
    </div>
  );
}
