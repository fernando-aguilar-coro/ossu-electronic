import React, { useState, useRef, useEffect, useCallback } from 'react';
import { evalFn } from '../../services/mathUtils';
import { runClosedMethod, Iteration } from '../../services/closedMethods';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import {
  Card,
  InputField,
  MetricCard,
  SimulationControls,
  Dot,
  tabBtnStyle,
} from './shared';

interface ClosedMethodsSimProps {
  defaultMethod?: 'biseccion' | 'falsa-posicion';
  defaultExpr?: string;
  defaultXl?: string;
  defaultXu?: string;
  defaultEs?: string;
  defaultImax?: string;
}

export default function ClosedMethodsSim({
  defaultMethod = 'biseccion',
  defaultExpr = 'exp(-x) - x',
  defaultXl = '0',
  defaultXu = '1',
  defaultEs = '1',
  defaultImax = '20',
}: ClosedMethodsSimProps) {
  const [method, setMethod] = useState<'biseccion' | 'falsa-posicion'>(defaultMethod);
  const [expr, setExpr] = useState(defaultExpr);
  const [xlStr, setXlStr] = useState(defaultXl);
  const [xuStr, setXuStr] = useState(defaultXu);
  const [esStr, setEsStr] = useState(defaultEs);
  const [imaxStr, setImaxStr] = useState(defaultImax);

  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize custom animation player hook (delay of 1000ms)
  const {
    step,
    setStep,
    playing,
    stop,
    play,
    next,
    prev,
    reset,
  } = useAnimationPlayer(iterations.length, 1000);

  // Run the algorithm
  const handleRun = useCallback(() => {
    reset();
    setError(null);
    try {
      const xl = parseFloat(xlStr);
      const xu = parseFloat(xuStr);
      const es = parseFloat(esStr);
      const imax = parseInt(imaxStr, 10);

      if ([xl, xu, es, imax].some(isNaN)) {
        throw new Error('Ingresa valores numéricos válidos en todos los campos.');
      }
      if (xl >= xu) {
        throw new Error('xl (límite inferior) debe ser estrictamente menor que xu (límite superior).');
      }
      if (es <= 0) {
        throw new Error('La tolerancia εs (%) debe ser mayor que cero.');
      }
      if (imax <= 0) {
        throw new Error('El número máximo de iteraciones debe ser al menos 1.');
      }

      const res = runClosedMethod(method, expr, xl, xu, es, imax);
      setIterations(res);
      setStep(1); // Set to first step automatically
    } catch (e) {
      setError((e as Error).message);
      setIterations([]);
    }
  }, [method, expr, xlStr, xuStr, esStr, imaxStr, reset, setStep]);

  // Run initial state on load/method change
  useEffect(() => {
    handleRun();
  }, [method]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const xl0 = parseFloat(xlStr);
    const xu0 = parseFloat(xuStr);
    if (isNaN(xl0) || isNaN(xu0)) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 20, right: 20, bottom: 40, left: 55 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    const pts = 300;
    const xVals: number[] = [];
    const yVals: number[] = [];
    const margin = (xu0 - xl0) * 0.15 || 1;
    const xMin = xl0 - margin;
    const xMax = xu0 + margin;

    for (let i = 0; i <= pts; i++) {
      const x = xMin + (i / pts) * (xMax - xMin);
      xVals.push(x);
      try {
        const y = evalFn(expr, x);
        yVals.push(y);
      } catch {
        yVals.push(NaN);
      }
    }

    const finiteY = yVals.filter(isFinite);
    if (finiteY.length === 0) return;
    const rawMin = Math.min(...finiteY);
    const rawMax = Math.max(...finiteY);
    const pad = (rawMax - rawMin) * 0.25 || 1;
    const yMin = rawMin - pad;
    const yMax = rawMax + pad;

    const toX = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const toY = (y: number) => PAD.top + ((yMax - y) / (yMax - yMin)) * plotH;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#374151';
    const gridColor = isDark ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.06)';
    const bgColor = isDark ? '#0f1729' : '#f8fafc';
    const axisColor = isDark ? 'rgba(148,163,184,0.4)' : 'rgba(0,0,0,0.25)';
    const curveColor = isDark ? '#818cf8' : '#4f46e5';

    // Clear and background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // Draw Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let g = 0; g <= 5; g++) {
      const gx = PAD.left + (g / 5) * plotW;
      const gy = PAD.top + (g / 5) * plotH;
      ctx.beginPath(); ctx.moveTo(gx, PAD.top); ctx.lineTo(gx, PAD.top + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(PAD.left + plotW, gy); ctx.stroke();
    }

    // Draw Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    const y0 = toY(0);
    if (y0 >= PAD.top && y0 <= PAD.top + plotH) {
      ctx.beginPath(); ctx.moveTo(PAD.left, y0); ctx.lineTo(PAD.left + plotW, y0); ctx.stroke();
    }
    const x0 = toX(0);
    if (x0 >= PAD.left && x0 <= PAD.left + plotW) {
      ctx.beginPath(); ctx.moveTo(x0, PAD.top); ctx.lineTo(x0, PAD.top + plotH); ctx.stroke();
    }

    // Shaded interval highlight
    if (step > 0 && iterations.length > 0) {
      const cur = iterations[Math.min(step - 1, iterations.length - 1)];
      ctx.fillStyle = isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.07)';
      ctx.fillRect(toX(cur.xl), PAD.top, toX(cur.xu) - toX(cur.xl), plotH);
    }

    // Draw Curve
    ctx.beginPath();
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 2.5;
    let first = true;
    for (let i = 0; i <= pts; i++) {
      const cx = toX(xVals[i]);
      const cy = toY(yVals[i]);
      if (!isFinite(yVals[i]) || cy < PAD.top - 5 || cy > PAD.top + plotH + 5) {
        first = true;
        continue;
      }
      if (first) {
        ctx.moveTo(cx, cy);
        first = false;
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    // Draw active markers, lines and geometry
    if (step > 0 && iterations.length > 0) {
      const cur = iterations[Math.min(step - 1, iterations.length - 1)];
      const y0c = isFinite(y0) ? y0 : PAD.top + plotH / 2;

      const fxl_val = evalFn(expr, cur.xl);
      const fxu_val = evalFn(expr, cur.xu);

      // Draw xl and xu points on curve
      const xl_pts = [[cur.xl, fxl_val, '#10b981', 'xₗ'], [cur.xu, fxu_val, '#ef4444', 'xᵤ']] as const;

      xl_pts.forEach(([xv, yv, color]) => {
        const cx = toX(xv);
        const cy = toY(yv);
        if (!isFinite(cy)) return;

        // Curve dot
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.strokeStyle = isDark ? '#fff' : '#1e293b'; ctx.lineWidth = 1; ctx.stroke();

        // Dashed lines to axis
        ctx.beginPath(); ctx.setLineDash([4, 4]);
        ctx.strokeStyle = color + '90'; ctx.lineWidth = 1.5;
        ctx.moveTo(cx, y0c); ctx.lineTo(cx, cy);
        ctx.stroke(); ctx.setLineDash([]);
      });

      // Draw Secant Line for Falsa Posición
      if (method === 'falsa-posicion' && isFinite(fxl_val) && isFinite(fxu_val)) {
        const cx_l = toX(cur.xl);
        const cy_l = toY(fxl_val);
        const cx_u = toX(cur.xu);
        const cy_u = toY(fxu_val);

        ctx.beginPath();
        ctx.strokeStyle = isDark ? 'rgba(245,158,11,0.6)' : 'rgba(217,119,6,0.6)';
        ctx.lineWidth = 2;
        ctx.moveTo(cx_l, cy_l);
        ctx.lineTo(cx_u, cy_u);
        ctx.stroke();
      }

      // Draw xr point
      const cxr = toX(cur.xr);
      const cyr = toY(cur.fxr);
      if (isFinite(cyr)) {
        // Curve point xr
        ctx.beginPath(); ctx.arc(cxr, cyr, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b'; ctx.fill();
        ctx.strokeStyle = isDark ? '#fff' : '#1e293b'; ctx.lineWidth = 1.5; ctx.stroke();

        // Vertical line to x-axis
        ctx.beginPath(); ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(245,158,11,0.7)'; ctx.lineWidth = 1.2;
        ctx.moveTo(cxr, y0c); ctx.lineTo(cxr, cyr);
        ctx.stroke(); ctx.setLineDash([]);
      }

      // Mark xr on the axis itself
      ctx.beginPath(); ctx.arc(cxr, y0c, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b'; ctx.fill();
      ctx.strokeStyle = isDark ? '#fff' : '#1e293b'; ctx.lineWidth = 1.2; ctx.stroke();
    }

    // Axes Labels
    ctx.fillStyle = textColor;
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (let g = 0; g <= 5; g++) {
      const xv = xMin + (g / 5) * (xMax - xMin);
      ctx.fillText(xv.toFixed(2), PAD.left + (g / 5) * plotW, H - 8);
    }
    ctx.textAlign = 'right';
    for (let g = 0; g <= 4; g++) {
      const yv = yMin + (g / 4) * (yMax - yMin);
      ctx.fillText(yv.toFixed(2), PAD.left - 6, PAD.top + plotH - (g / 4) * plotH + 4);
    }
  }, [expr, xlStr, xuStr, iterations, step, method]);

  const cur = step > 0 && iterations.length > 0
    ? iterations[Math.min(step - 1, iterations.length - 1)]
    : null;

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)' }}>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: 4,
          background: 'var(--ifm-background-color)',
          borderRadius: 10,
          width: 'fit-content',
          border: '1px solid var(--ifm-toc-border-color)',
          marginBottom: 16,
        }}
      >
        <button
          style={tabBtnStyle(method === 'biseccion')}
          onClick={() => {
            stop();
            setMethod('biseccion');
          }}
        >
          Método de Bisección
        </button>
        <button
          style={tabBtnStyle(method === 'falsa-posicion')}
          onClick={() => {
            stop();
            setMethod('falsa-posicion');
          }}
        >
          Falsa Posición
        </button>
      </div>

      {/* Inputs Card */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <InputField
              label="Función f(x)"
              value={expr}
              onChange={e => setExpr(e.target.value)}
              placeholder="exp(-x) - x"
              description="Disponible: x^2, exp(x), ln(x), sin(x), cos(x), tan(x), sqrt(x), abs(x). Soporta potencias con ^."
            />
          </div>
          <InputField
            label="xₗ (lím. inf.)"
            value={xlStr}
            onChange={e => setXlStr(e.target.value)}
          />
          <InputField
            label="xᵤ (lím. sup.)"
            value={xuStr}
            onChange={e => setXuStr(e.target.value)}
          />
          <InputField
            label="εs Tolerancia (%)"
            value={esStr}
            onChange={e => setEsStr(e.target.value)}
          />
          <InputField
            label="Máx. Iter."
            value={imaxStr}
            onChange={e => setImaxStr(e.target.value)}
          />
        </div>

        <SimulationControls
          playing={playing}
          hasIterations={iterations.length > 0}
          step={step}
          totalSteps={iterations.length}
          onCalculate={handleRun}
          onPlay={play}
          onPause={stop}
          onPrev={prev}
          onNext={next}
        />

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8,
              color: '#ef4444',
              fontSize: 13,
              lineHeight: '1.4',
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}
      </Card>

      {/* Chart Section */}
      {iterations.length > 0 && (
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ifm-font-color-base)' }}>
              Representación Geométrica del Intervalo
            </span>
            <span>
              <Dot color="#10b981" label="xₗ" />
              <Dot color="#ef4444" label="xᵤ" />
              <Dot color="#f59e0b" label="xᵣ (Raíz est.)" />
            </span>
          </div>
          <canvas
            ref={canvasRef}
            width={700}
            height={280}
            style={{
              width: '100%',
              borderRadius: 10,
              display: 'block',
              border: '1px solid var(--ifm-toc-border-color)',
            }}
          />

          {/* Current Step Metrics Cards */}
          {cur && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: 10,
                marginTop: 16,
              }}
            >
              <MetricCard label="xₗ (lím. inf.)" value={cur.xl.toFixed(6)} color="#10b981" />
              <MetricCard label="xᵤ (lím. sup.)" value={cur.xu.toFixed(6)} color="#ef4444" />
              <MetricCard label="xᵣ (estimación)" value={cur.xr.toFixed(6)} color="#f59e0b" />
              <MetricCard label="f(xᵣ)" value={cur.fxr.toExponential(4)} color="var(--ifm-color-primary)" />
              <MetricCard
                label="Error aprox. εₐ"
                value={cur.ea != null ? cur.ea.toFixed(4) + '%' : '—'}
                color={cur.ea != null && cur.ea < parseFloat(esStr) ? '#10b981' : 'var(--ifm-font-color-base)'}
              />
            </div>
          )}
        </Card>
      )}

      {/* Table Section */}
      {iterations.length > 0 && (
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--ifm-toc-border-color)',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Historial de Iteraciones calculadas
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ margin: 0, borderRadius: 0, border: 'none', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--ifm-background-color)' }}>
                  {['Iteración', 'xₗ', 'xᵤ', 'xᵣ', 'f(xᵣ)', 'εₐ (%)'].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        fontSize: 11,
                        fontWeight: 700,
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        color: 'var(--ifm-color-primary)',
                        borderBottom: '1px solid var(--ifm-toc-border-color)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {iterations.slice(0, step).map(it => (
                  <tr
                    key={it.i}
                    style={{
                      background: it.i === step ? 'var(--ifm-color-primary-lightest, rgba(99,102,241,0.06))' : undefined,
                      fontWeight: it.i === step ? 700 : 400,
                      borderBottom: '1px solid var(--ifm-toc-border-color)',
                    }}
                  >
                    <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.i}</td>
                    <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.xl.toFixed(6)}</td>
                    <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.xu.toFixed(6)}</td>
                    <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', color: '#f59e0b', fontWeight: 700, fontSize: 13 }}>{it.xr.toFixed(6)}</td>
                    <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.fxr.toExponential(3)}</td>
                    <td
                      style={{
                        padding: '8px 14px',
                        fontFamily: 'monospace',
                        textAlign: 'right',
                        fontSize: 13,
                        color: it.ea != null && it.ea < parseFloat(esStr) ? '#10b981' : undefined,
                        fontWeight: it.ea != null && it.ea < parseFloat(esStr) ? 700 : 400,
                      }}
                    >
                      {it.ea != null ? it.ea.toFixed(4) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
