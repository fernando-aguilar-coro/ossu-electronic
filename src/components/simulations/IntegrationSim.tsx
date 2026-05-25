import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  runTrapezoidal,
  runSimpson13,
  runSimpson38,
  runExactIntegral
} from '../../services/integration';
import { evalFn } from '../../services/mathUtils';
import { Card, InputField, Latex, tabBtnStyle, Dot } from './shared';
import * as math from 'mathjs';

export default function IntegrationSim() {
  const [method, setMethod] = useState<'trapezoid' | 'simpson13' | 'simpson38'>('trapezoid');
  const [expr, setExpr] = useState('sin(x)');
  const [aStr, setAStr] = useState('0');
  const [bStr, setBStr] = useState('pi');
  const [nStr, setNStr] = useState('4');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Evaluated numeric integration bounds using mathjs
  const parsedBounds = useMemo(() => {
    try {
      // Evaluate boundary expressions like "pi", "pi/2", etc.
      let a = parseFloat(aStr);
      if (isNaN(a)) {
        const evalA = math.evaluate(aStr);
        a = typeof evalA === 'number' ? evalA : Number(evalA);
      }
      let b = parseFloat(bStr);
      if (isNaN(b)) {
        const evalB = math.evaluate(bStr);
        b = typeof evalB === 'number' ? evalB : Number(evalB);
      }
      return { a, b, error: null };
    } catch (e) {
      return { a: NaN, b: NaN, error: 'Límites de integración no válidos (ej: 0, pi, pi/2)' };
    }
  }, [aStr, bStr]);

  // Handle segment constraints according to Newton-Cotes rules
  const n = useMemo(() => {
    const parsedN = parseInt(nStr, 10);
    if (isNaN(parsedN) || parsedN < 1) return 1;

    if (method === 'simpson13') {
      // Must be even
      return parsedN % 2 === 0 ? parsedN : Math.max(2, parsedN - (parsedN % 2));
    }
    if (method === 'simpson38') {
      // Must be a multiple of 3
      return parsedN % 3 === 0 ? parsedN : Math.max(3, parsedN - (parsedN % 3));
    }
    return parsedN;
  }, [nStr, method]);

  // Adjust segment slider value to match method constraints
  const segmentWarning = useMemo(() => {
    const val = parseInt(nStr, 10);
    if (isNaN(val) || val < 1) return null;
    
    if (method === 'simpson13' && val % 2 !== 0) {
      return `Simpson 1/3 requiere un número par de segmentos. Se usará N = ${n}.`;
    }
    if (method === 'simpson38' && val % 3 !== 0) {
      return `Simpson 3/8 requiere segmentos múltiplos de 3. Se usará N = ${n}.`;
    }
    return null;
  }, [nStr, method, n]);

  // Compute integration results
  const results = useMemo(() => {
    const { a, b, error } = parsedBounds;
    if (error || isNaN(a) || isNaN(b)) return null;
    if (a >= b) return { estimate: NaN, exact: NaN, errRel: NaN, errAbs: NaN, error: 'El límite inferior (a) debe ser menor que el límite superior (b).' };

    try {
      let estimate = 0;
      if (method === 'trapezoid') {
        estimate = runTrapezoidal(expr, a, b, n);
      } else if (method === 'simpson13') {
        estimate = runSimpson13(expr, a, b, n);
      } else {
        estimate = runSimpson38(expr, a, b, n);
      }

      const exact = runExactIntegral(expr, a, b);
      const errAbs = Math.abs(exact - estimate);
      const errRel = exact !== 0 ? (errAbs / Math.abs(exact)) * 100 : 0;

      return { estimate, exact, errAbs, errRel, error: null };
    } catch (e) {
      return { estimate: NaN, exact: NaN, errRel: NaN, errAbs: NaN, error: 'Error al evaluar la función en el intervalo.' };
    }
  }, [expr, parsedBounds, n, method]);

  // Build weight coefficients and points for the table
  const integrationPoints = useMemo(() => {
    const { a, b } = parsedBounds;
    if (isNaN(a) || isNaN(b) || a >= b) return [];

    const h = (b - a) / n;
    const pts: { i: number; x: number; fx: number; w: number; contrib: number }[] = [];

    for (let i = 0; i <= n; i++) {
      const x = a + i * h;
      const fx = evalFn(expr, x);
      let w = 1;

      if (method === 'trapezoid') {
        w = (i === 0 || i === n) ? 1 : 2;
      } else if (method === 'simpson13') {
        if (i === 0 || i === n) {
          w = 1;
        } else {
          w = (i % 2 !== 0) ? 4 : 2;
        }
      } else {
        // Simpson 3/8
        if (i === 0 || i === n) {
          w = 1;
        } else {
          w = (i % 3 === 0) ? 2 : 3;
        }
      }

      pts.push({
        i,
        x,
        fx,
        w,
        contrib: w * fx
      });
    }
    return pts;
  }, [expr, parsedBounds, n, method]);

  // Draw Area and Curve on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 25, right: 30, bottom: 40, left: 55 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    const { a, b, error: boundsError } = parsedBounds;
    if (boundsError || isNaN(a) || isNaN(b) || a >= b) return;

    // Determine Y range on interval with extra margin
    const steps = 150;
    const yVals: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = a - 0.2 * (b - a) + (i / steps) * 1.4 * (b - a);
      yVals.push(evalFn(expr, x));
    }
    const finiteY = yVals.filter(isFinite);
    let yMin = finiteY.length > 0 ? Math.min(...finiteY, 0) : -1;
    let yMax = finiteY.length > 0 ? Math.max(...finiteY, 1) : 1;
    const dy = (yMax - yMin) * 0.2 || 0.5;
    yMin -= dy;
    yMax += dy;

    // Viewport bounds
    const xMin = a - 0.1 * (b - a);
    const xMax = b + 0.1 * (b - a);

    const toX = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const toY = (y: number) => PAD.top + ((yMax - y) / (yMax - yMin)) * plotH;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor  = isDark ? '#cbd5e1' : '#374151';
    const gridColor  = isDark ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.06)';
    const bgColor    = isDark ? '#0f1729' : '#f8fafc';
    const axisColor  = isDark ? 'rgba(148,163,184,0.4)' : 'rgba(0,0,0,0.25)';
    const curveColor = isDark ? '#818cf8' : '#4f46e5'; // Indigo original
    const areaColor  = isDark ? 'rgba(16,185,129,0.14)' : 'rgba(16,185,129,0.08)'; // Emerald tint
    const approxLineColor = isDark ? '#34d399' : '#059669'; // Emerald boundaries

    // Clear Canvas
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // Draw Grid
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
    for (let g = 0; g <= 6; g++) {
      const gx = PAD.left + (g / 6) * plotW;
      ctx.beginPath(); ctx.moveTo(gx, PAD.top); ctx.lineTo(gx, PAD.top + plotH); ctx.stroke();
    }
    for (let g = 0; g <= 4; g++) {
      const gy = PAD.top + (g / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(PAD.left + plotW, gy); ctx.stroke();
    }

    // Draw Axes
    ctx.strokeStyle = axisColor; ctx.lineWidth = 1.5;
    const y0 = toY(0);
    const x0 = toX(0);
    if (y0 >= PAD.top && y0 <= PAD.top + plotH) {
      ctx.beginPath(); ctx.moveTo(PAD.left, y0); ctx.lineTo(PAD.left + plotW, y0); ctx.stroke();
    }
    if (x0 >= PAD.left && x0 <= PAD.left + plotW) {
      ctx.beginPath(); ctx.moveTo(x0, PAD.top); ctx.lineTo(x0, PAD.top + plotH); ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = textColor; ctx.font = 'italic bold 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('y', x0 >= PAD.left && x0 <= PAD.left + plotW ? x0 - 8 : PAD.left + 15, PAD.top - 4);
    ctx.textAlign = 'left';
    ctx.fillText('x', PAD.left + plotW + 8, y0 >= PAD.top && y0 <= PAD.top + plotH ? y0 + 12 : PAD.top + plotH - 5);

    // 1. Draw approximated integration region & top boundaries
    const h = (b - a) / n;
    ctx.fillStyle = areaColor;

    if (method === 'trapezoid') {
      // ── Trapezoids geometry ──
      for (let i = 0; i < n; i++) {
        const xL = a + i * h;
        const xR = a + (i + 1) * h;
        const yL = evalFn(expr, xL);
        const yR = evalFn(expr, xR);

        ctx.beginPath();
        ctx.moveTo(toX(xL), toY(0));
        ctx.lineTo(toX(xL), toY(yL));
        ctx.lineTo(toX(xR), toY(yR));
        ctx.lineTo(toX(xR), toY(0));
        ctx.closePath();
        ctx.fill();

        // Top line
        ctx.beginPath();
        ctx.strokeStyle = approxLineColor;
        ctx.lineWidth = 2;
        ctx.moveTo(toX(xL), toY(yL));
        ctx.lineTo(toX(xR), toY(yR));
        ctx.stroke();
      }
    } else if (method === 'simpson13') {
      // ── Quadratic parabolas geometry (2 segments per group) ──
      for (let i = 0; i < n; i += 2) {
        const x0 = a + i * h;
        const x1 = a + (i + 1) * h;
        const x2 = a + (i + 2) * h;
        const y0 = evalFn(expr, x0);
        const y1 = evalFn(expr, x1);
        const y2 = evalFn(expr, x2);

        // Fill region under parabola
        ctx.beginPath();
        ctx.moveTo(toX(x0), toY(0));
        const subSteps = 15;
        for (let s = 0; s <= subSteps; s++) {
          const xVal = x0 + (s / subSteps) * (2 * h);
          // Lagrange quadratic interpolation
          const pVal =
            y0 * ((xVal - x1) * (xVal - x2)) / ((x0 - x1) * (x0 - x2)) +
            y1 * ((xVal - x0) * (xVal - x2)) / ((x1 - x0) * (x1 - x2)) +
            y2 * ((xVal - x0) * (xVal - x1)) / ((x2 - x0) * (x2 - x1));
          ctx.lineTo(toX(xVal), toY(pVal));
        }
        ctx.lineTo(toX(x2), toY(0));
        ctx.closePath();
        ctx.fill();

        // Draw parabolic border
        ctx.beginPath();
        ctx.strokeStyle = approxLineColor;
        ctx.lineWidth = 2;
        ctx.moveTo(toX(x0), toY(y0));
        for (let s = 0; s <= subSteps; s++) {
          const xVal = x0 + (s / subSteps) * (2 * h);
          const pVal =
            y0 * ((xVal - x1) * (xVal - x2)) / ((x0 - x1) * (x0 - x2)) +
            y1 * ((xVal - x0) * (xVal - x2)) / ((x1 - x0) * (x1 - x2)) +
            y2 * ((xVal - x0) * (xVal - x1)) / ((x2 - x0) * (x2 - x1));
          ctx.lineTo(toX(xVal), toY(pVal));
        }
        ctx.stroke();
      }
    } else {
      // ── Cubic polynomials geometry (3 segments per group) ──
      for (let i = 0; i < n; i += 3) {
        const x0 = a + i * h;
        const x1 = a + (i + 1) * h;
        const x2 = a + (i + 2) * h;
        const x3 = a + (i + 3) * h;
        const y0 = evalFn(expr, x0);
        const y1 = evalFn(expr, x1);
        const y2 = evalFn(expr, x2);
        const y3 = evalFn(expr, x3);

        ctx.beginPath();
        ctx.moveTo(toX(x0), toY(0));
        const subSteps = 20;
        for (let s = 0; s <= subSteps; s++) {
          const xVal = x0 + (s / subSteps) * (3 * h);
          // Lagrange cubic interpolation
          const pVal =
            y0 * ((xVal - x1) * (xVal - x2) * (xVal - x3)) / ((x0 - x1) * (x0 - x2) * (x0 - x3)) +
            y1 * ((xVal - x0) * (xVal - x2) * (xVal - x3)) / ((x1 - x0) * (x1 - x2) * (x1 - x3)) +
            y2 * ((xVal - x0) * (xVal - x1) * (xVal - x3)) / ((x2 - x0) * (x2 - x1) * (x2 - x3)) +
            y3 * ((xVal - x0) * (xVal - x1) * (xVal - x2)) / ((x3 - x0) * (x3 - x1) * (x3 - x2));
          ctx.lineTo(toX(xVal), toY(pVal));
        }
        ctx.lineTo(toX(x3), toY(0));
        ctx.closePath();
        ctx.fill();

        // Draw border
        ctx.beginPath();
        ctx.strokeStyle = approxLineColor;
        ctx.lineWidth = 2;
        ctx.moveTo(toX(x0), toY(y0));
        for (let s = 0; s <= subSteps; s++) {
          const xVal = x0 + (s / subSteps) * (3 * h);
          const pVal =
            y0 * ((xVal - x1) * (xVal - x2) * (xVal - x3)) / ((x0 - x1) * (x0 - x2) * (x0 - x3)) +
            y1 * ((xVal - x0) * (xVal - x2) * (xVal - x3)) / ((x1 - x0) * (x1 - x2) * (x1 - x3)) +
            y2 * ((xVal - x0) * (xVal - x1) * (xVal - x3)) / ((x2 - x0) * (x2 - x1) * (x2 - x3)) +
            y3 * ((xVal - x0) * (xVal - x1) * (xVal - x2)) / ((x3 - x0) * (x3 - x1) * (x3 - x2));
          ctx.lineTo(toX(xVal), toY(pVal));
        }
        ctx.stroke();
      }
    }

    // 2. Draw vertical divider lines for segments
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= n; i++) {
      const xVal = a + i * h;
      const yVal = evalFn(expr, xVal);
      ctx.beginPath();
      ctx.moveTo(toX(xVal), toY(0));
      ctx.lineTo(toX(xVal), toY(yVal));
      ctx.stroke();

      // Node dot on curve
      ctx.beginPath();
      ctx.arc(toX(xVal), toY(yVal), 4, 0, Math.PI * 2);
      ctx.fillStyle = approxLineColor;
      ctx.fill();
    }

    // 3. Draw original function curve (indigo, solid)
    ctx.beginPath();
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 2.5;
    let first = true;
    const curveSteps = 300;
    for (let i = 0; i <= curveSteps; i++) {
      const xVal = xMin + (i / curveSteps) * (xMax - xMin);
      const yVal = evalFn(expr, xVal);
      const px = toX(xVal);
      const py = toY(yVal);
      if (isFinite(yVal) && py >= PAD.top - 10 && py <= PAD.top + plotH + 10) {
        first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        first = false;
      } else {
        first = true;
      }
    }
    ctx.stroke();

    // 4. Hover query tooltip
    if (hoverX !== null && hoverX >= a && hoverX <= b) {
      const yVal = evalFn(expr, hoverX);
      const px = toX(hoverX);
      const py = toY(yVal);

      if (isFinite(yVal) && py >= PAD.top && py <= PAD.top + plotH) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(245,158,11,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.moveTo(px, PAD.top);
        ctx.lineTo(px, PAD.top + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';
        ctx.fillText(`f(${hoverX.toFixed(2)}) = ${yVal.toFixed(3)}`, px + 8, py - 4);
      }
    }

    // 5. Bounds tick labels on axis
    ctx.fillStyle = textColor;
    ctx.font = '10px Inter, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`a = ${a.toFixed(2)}`, toX(a), H - 24);
    ctx.fillText(`b = ${b.toFixed(2)}`, toX(b), H - 24);

    for (let g = 0; g <= 6; g++) {
      const xVal = xMin + (g / 6) * (xMax - xMin);
      ctx.fillText(xVal.toFixed(2), PAD.left + (g / 6) * plotW, H - 8);
    }
    ctx.textAlign = 'right';
    for (let g = 0; g <= 4; g++) {
      const yVal = yMin + (g / 4) * (yMax - yMin);
      ctx.fillText(yVal.toFixed(1), PAD.left - 6, PAD.top + plotH - (g / 4) * plotH + 4);
    }

  }, [expr, parsedBounds, n, method, hoverX]);

  // Canvas mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;

    const PAD = { top: 25, right: 30, bottom: 40, left: 55 };
    const plotW = canvas.width - PAD.left - PAD.right;
    
    const { a, b } = parsedBounds;
    if (isNaN(a) || isNaN(b) || a >= b) return;

    const xMin = a - 0.1 * (b - a);
    const xMax = b + 0.1 * (b - a);
    const xm = xMin + ((px - PAD.left) / plotW) * (xMax - xMin);

    if (xm >= a && xm <= b) {
      setHoverX(xm);
    } else {
      setHoverX(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverX(null);
  };

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)' }}>
      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--ifm-background-color)', borderRadius: 10, border: '1px solid var(--ifm-toc-border-color)', width: 'fit-content', marginBottom: 16 }}>
        <button style={tabBtnStyle(method === 'trapezoid')} onClick={() => setMethod('trapezoid')}>
          Regla del Trapecio
        </button>
        <button style={tabBtnStyle(method === 'simpson13')} onClick={() => setMethod('simpson13')}>
          Regla de Simpson 1/3
        </button>
        <button style={tabBtnStyle(method === 'simpson38')} onClick={() => setMethod('simpson38')}>
          Regla de Simpson 3/8
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: 16, marginBottom: 16 }} className="sim-col-span-2">
        {/* ── Left Side: Canvas & Metrics ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                Representación Geométrica (Newton-Cotes)
              </span>
              <span>
                <Dot color="#4f46e5" label="Función Analítica" />
                <Dot color="#10b981" label="Área Aproximada" />
              </span>
            </div>

            <canvas
              ref={canvasRef}
              width={700}
              height={300}
              style={{ width: '100%', borderRadius: 10, display: 'block', border: '1px solid var(--ifm-toc-border-color)', cursor: 'crosshair' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />

            <span style={{ fontSize: 11, color: '#64748b', marginTop: 8, display: 'block' }}>
              💡 Pasa el ratón por la región de integración para consultar los valores analíticos de f(x).
            </span>
          </Card>

          {/* ── Metrics Grid ── */}
          {results && !results.error && (
            <Card>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                <div style={{ padding: '8px 10px', background: 'var(--ifm-background-color)', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--ifm-color-primary)', textTransform: 'uppercase' }}>Valor Estimado</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#10b981', marginTop: 2 }}>
                    {results.estimate.toFixed(6)}
                  </div>
                </div>
                <div style={{ padding: '8px 10px', background: 'var(--ifm-background-color)', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Valor Real Exacto</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: 'var(--ifm-font-color-base)', marginTop: 2 }}>
                    {results.exact.toFixed(6)}
                  </div>
                </div>
                <div style={{ padding: '8px 10px', background: 'var(--ifm-background-color)', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Error Absoluto</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#ef4444', marginTop: 2 }}>
                    {results.errAbs.toExponential(4)}
                  </div>
                </div>
                <div style={{ padding: '8px 10px', background: 'var(--ifm-background-color)', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: results.errRel < 1.0 ? '#10b981' : '#f59e0b', textTransform: 'uppercase' }}>Error Relativo</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: results.errRel < 1.0 ? '#10b981' : '#f59e0b', marginTop: 2 }}>
                    {results.errRel.toFixed(4)} %
                  </div>
                </div>
              </div>
            </Card>
          )}

          {results?.error && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#ef4444', fontSize: 13 }}>
              <strong>Aviso:</strong> {results.error}
            </div>
          )}
        </div>

        {/* ── Right Side: Controls ── */}
        <div>
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ifm-color-primary)' }}>
              Parámetros de Integración
            </span>

            <InputField
              label="Función f(x)"
              value={expr}
              onChange={e => setExpr(e.target.value)}
              placeholder="sin(x)"
              description="Disponible: x, exp(x), ln(x), sin(x), cos(x), tan(x), etc."
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <InputField
                label="Límite inf. (a)"
                value={aStr}
                onChange={e => setAStr(e.target.value)}
                placeholder="0"
              />
              <InputField
                label="Límite sup. (b)"
                value={bStr}
                onChange={e => setBStr(e.target.value)}
                placeholder="pi"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ifm-color-primary)', marginBottom: 4, textTransform: 'uppercase' }}>
                Subintervalos (N = {n})
              </label>
              <input
                type="range"
                min={method === 'simpson38' ? "3" : method === 'simpson13' ? "2" : "1"}
                max="24"
                step={method === 'simpson13' ? "2" : method === 'simpson38' ? "3" : "1"}
                value={nStr}
                onChange={e => setNStr(e.target.value)}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {segmentWarning && (
              <div style={{ padding: '8px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, color: '#f59e0b', fontSize: 11, lineHeight: '1.3' }}>
                {segmentWarning}
              </div>
            )}

            <div style={{ marginTop: 'auto', padding: '8px 10px', background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)', fontSize: 11 }}>
              <strong>Tip educativo:</strong> Compara Trapecio con Simpson usando el mismo <Latex>N = 6</Latex> y observa cómo el error disminuye significativamente en las reglas parabólicas/cúbicas.
            </div>
          </Card>
        </div>
      </div>

      {/* ── Table of Sample Points and Coefficients ── */}
      {integrationPoints.length > 0 && results && !results.error && (
        <Card>
          <span style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 12 }}>
            Tabla de Ponderación e Integrandos por Segmento
          </span>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--ifm-toc-border-color)' }}>
              <thead>
                <tr style={{ background: 'var(--ifm-background-color)', borderBottom: '2px solid var(--ifm-toc-border-color)', fontSize: 11 }}>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Nodo i</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>x_i</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Altura f(x_i)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Peso w_i</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Contribución w_i · f(x_i)</th>
                </tr>
              </thead>
              <tbody>
                {integrationPoints.map((pt) => (
                  <tr key={pt.i} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)', fontSize: 12 }}>
                    <td style={{ padding: '6px 12px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 600 }}>{pt.i}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{pt.x.toFixed(4)}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{pt.fx.toFixed(4)}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, color: 'var(--ifm-color-primary)' }}>{pt.w}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#10b981', fontWeight: 600 }}>{pt.contrib.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
            * Las reglas compuestas estiman la integral ponderando cada punto de muestra. Las sumas resultantes se multiplican por el factor de paso correspondiente:
            {method === 'trapezoid' && <> <Latex>h / 2</Latex> (Trapecio)</>}
            {method === 'simpson13' && <> <Latex>h / 3</Latex> (Simpson 1/3)</>}
            {method === 'simpson38' && <> <Latex>3h / 8</Latex> (Simpson 3/8)</>}.
          </p>
        </Card>
      )}
    </div>
  );
}
