import React, { useState, useRef, useEffect, useCallback } from 'react';
import { evalFn, getDerivative } from '../../services/mathUtils';
import { runOpenMethod, OpenIteration } from '../../services/openMethods';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import {
  Card,
  InputField,
  MetricCard,
  SimulationControls,
  Dot,
  tabBtnStyle,
} from './shared';

interface OpenMethodsSimProps {
  defaultMethod?: 'punto-fijo' | 'newton-raphson' | 'secante';
  defaultExpr?: string;
  defaultX0?: string;
  defaultX1?: string;
  defaultEs?: string;
  defaultImax?: string;
}

export default function OpenMethodsSim({
  defaultMethod = 'punto-fijo',
  defaultExpr = '',
  defaultX0 = '0',
  defaultX1 = '1',
  defaultEs = '0.01',
  defaultImax = '20',
}: OpenMethodsSimProps) {
  const [method, setMethod] = useState<'punto-fijo' | 'newton-raphson' | 'secante'>(defaultMethod);

  // Set logical expression default based on method
  const getExprDefault = (m: string) => {
    if (defaultExpr) return defaultExpr;
    return m === 'punto-fijo' ? 'exp(-x)' : 'exp(-x) - x';
  };

  const [expr, setExpr] = useState(() => getExprDefault(defaultMethod));
  const [derivExprManual, setDerivExprManual] = useState('');
  const [x0Str, setX0Str] = useState(defaultX0);
  const [x1Str, setX1Str] = useState(defaultX1);
  const [esStr, setEsStr] = useState(defaultEs);
  const [imaxStr, setImaxStr] = useState(defaultImax);

  const [iterations, setIterations] = useState<OpenIteration[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize custom animation player hook (delay of 1200ms)
  const {
    step,
    setStep,
    playing,
    stop,
    play,
    next,
    prev,
    reset,
  } = useAnimationPlayer(iterations.length, 1200);

  // Run the algorithm
  const handleRun = useCallback(() => {
    reset();
    setError(null);
    try {
      const x0 = parseFloat(x0Str);
      const x1 = parseFloat(x1Str);
      const es = parseFloat(esStr);
      const imax = parseInt(imaxStr, 10);

      if (isNaN(x0) || (method === 'secante' && isNaN(x1)) || isNaN(es) || isNaN(imax)) {
        throw new Error('Ingresa valores numéricos válidos en todos los campos.');
      }
      if (es <= 0) {
        throw new Error('La tolerancia εs (%) debe ser mayor que cero.');
      }
      if (imax <= 0) {
        throw new Error('El número máximo de iteraciones debe ser al menos 1.');
      }

      const res = runOpenMethod(method, expr, x0, x1, es, imax, derivExprManual);
      setIterations(res);
      setStep(1); // Set to first step automatically
    } catch (e) {
      setError((e as Error).message);
      setIterations([]);
    }
  }, [method, expr, x0Str, x1Str, esStr, imaxStr, derivExprManual, reset, setStep]);

  // Handle method changes and their specific defaults
  const handleMethodChange = (m: 'punto-fijo' | 'newton-raphson' | 'secante') => {
    stop();
    setMethod(m);
    setExpr(m === 'punto-fijo' ? 'exp(-x)' : 'exp(-x) - x');
    setDerivExprManual('');
    if (m === 'secante') {
      setX0Str('0');
      setX1Str('1');
    } else {
      setX0Str('0');
    }
  };

  useEffect(() => {
    handleRun();
  }, [method]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x0Val = parseFloat(x0Str);
    const x1Val = parseFloat(x1Str);
    if (isNaN(x0Val)) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 20, right: 20, bottom: 40, left: 55 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    // Define X range based on iterations or start points
    let xMin = -1;
    let xMax = 2;

    if (iterations.length > 0) {
      const allX = iterations.map(it => [it.xi, it.xNext, it.xiPrev ?? 0]).flat().filter(isFinite);
      if (allX.length > 0) {
        const rawMin = Math.min(...allX);
        const rawMax = Math.max(...allX);
        const diff = rawMax - rawMin || 1;
        xMin = rawMin - diff * 0.25;
        xMax = rawMax + diff * 0.25;
      }
    } else {
      const val1 = x0Val;
      const val2 = method === 'secante' ? x1Val : x0Val + 1;
      const rawMin = Math.min(val1, val2);
      const rawMax = Math.max(val1, val2);
      const diff = rawMax - rawMin || 1;
      xMin = rawMin - diff * 0.5;
      xMax = rawMax + diff * 0.5;
    }

    // Generate curve points
    const pts = 300;
    const xVals: number[] = [];
    const yValsExpr: number[] = [];
    for (let i = 0; i <= pts; i++) {
      const cx = xMin + (i / pts) * (xMax - xMin);
      xVals.push(cx);
      yValsExpr.push(evalFn(expr, cx));
    }

    // Determine Y limits
    const finiteY = yValsExpr.filter(isFinite);
    if (method === 'punto-fijo') {
      // In Fixed Point, we should include the diagonal line y = x in Y limits too
      finiteY.push(xMin, xMax);
    }
    const rawYMin = Math.min(...finiteY, 0); // Always show x-axis if possible
    const rawYMax = Math.max(...finiteY, 0);
    const padY = (rawYMax - rawYMin) * 0.2 || 1;
    const yMin = rawYMin - padY;
    const yMax = rawYMax + padY;

    const toX = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const toY = (y: number) => PAD.top + ((yMax - y) / (yMax - yMin)) * plotH;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#374151';
    const gridColor = isDark ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.06)';
    const bgColor = isDark ? '#0f1729' : '#f8fafc';
    const axisColor = isDark ? 'rgba(148,163,184,0.4)' : 'rgba(0,0,0,0.25)';
    const identityColor = isDark ? 'rgba(148,163,184,0.45)' : 'rgba(100,116,139,0.5)';
    const curveColor = isDark ? '#818cf8' : '#4f46e5';

    // Clear and background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let g = 0; g <= 5; g++) {
      const gx = PAD.left + (g / 5) * plotW;
      const gy = PAD.top + (g / 5) * plotH;
      ctx.beginPath(); ctx.moveTo(gx, PAD.top); ctx.lineTo(gx, PAD.top + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(PAD.left + plotW, gy); ctx.stroke();
    }

    // Axes
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

    // Draw Identity Line y = x for Punto Fijo
    if (method === 'punto-fijo') {
      ctx.beginPath();
      ctx.strokeStyle = identityColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(toX(xMin), toY(xMin));
      ctx.lineTo(toX(xMax), toY(xMax));
      ctx.stroke();
      ctx.setLineDash([]);

      // Label identity
      ctx.fillStyle = textColor + '90';
      ctx.font = 'italic 11px Inter, sans-serif';
      ctx.fillText('y = x', toX(xMax) - 30, toY(xMax) + 14);
    }

    // Draw Function Curve
    ctx.beginPath();
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 2.5;
    let first = true;
    for (let i = 0; i <= pts; i++) {
      const cx = toX(xVals[i]);
      const cy = toY(yValsExpr[i]);
      if (!isFinite(yValsExpr[i]) || cy < PAD.top - 5 || cy > PAD.top + plotH + 5) {
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

    // ── Method Specific Canvas Annotations ────────────────────────────────────
    if (step > 0 && iterations.length > 0) {
      const curIdx = Math.min(step - 1, iterations.length - 1);
      const cur = iterations[curIdx];
      const y0c = isFinite(y0) ? y0 : PAD.top + plotH / 2;

      if (method === 'punto-fijo') {
        // Draw the web path up to the current iteration
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.8;
        // Start at (x0, 0)
        ctx.moveTo(toX(iterations[0].xi), y0c);

        for (let idx = 0; idx <= curIdx; idx++) {
          const it = iterations[idx];
          const cx_i = toX(it.xi);
          const cy_next = toY(it.xNext);

          // Vertical line from (xi, xi) to (xi, g(xi))
          ctx.lineTo(cx_i, cy_next);

          // Horizontal line from (xi, g(xi)) to (g(xi), g(xi)) [which is (xNext, xNext) on y=x]
          ctx.lineTo(toX(it.xNext), cy_next);
        }
        ctx.stroke();

        // Highlight current point
        const cx_curr = toX(cur.xi);
        const cy_curr = toY(cur.xNext);

        ctx.beginPath(); ctx.arc(cx_curr, cy_curr, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke();

        ctx.beginPath(); ctx.arc(toX(cur.xNext), cy_curr, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke();

      } else if (method === 'newton-raphson') {
        // Draw Newton Tangent
        const cx_curr = toX(cur.xi);
        const cy_curr = toY(cur.fxi ?? 0);
        const cx_next = toX(cur.xNext);

        // Vertical line to curve
        ctx.beginPath(); ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(79,70,229,0.5)'; ctx.lineWidth = 1.2;
        ctx.moveTo(cx_curr, y0c); ctx.lineTo(cx_curr, cy_curr);
        ctx.stroke(); ctx.setLineDash([]);

        // Tangent line
        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.moveTo(cx_curr, cy_curr);
        ctx.lineTo(cx_next, y0c);
        ctx.stroke();

        // Highlight point on curve and new estimate
        ctx.beginPath(); ctx.arc(cx_curr, cy_curr, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#4f46e5'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke();

        ctx.beginPath(); ctx.arc(cx_next, y0c, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke();

      } else {
        // Secante
        if (cur.xiPrev !== undefined && cur.fxiPrev !== undefined && cur.fxiCurr !== undefined) {
          const cx_prev = toX(cur.xiPrev);
          const cy_prev = toY(cur.fxiPrev);
          const cx_curr = toX(cur.xi);
          const cy_curr = toY(cur.fxiCurr);
          const cx_next = toX(cur.xNext);

          // Draw secant line connecting (xi-1, f(xi-1)) and (xi, f(xi)) down to x_next on axis
          ctx.beginPath();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.moveTo(cx_prev, cy_prev);
          ctx.lineTo(cx_next, y0c);
          ctx.stroke();

          // Highlight the two curve points used
          ctx.beginPath(); ctx.arc(cx_prev, cy_prev, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981'; ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.stroke();

          ctx.beginPath(); ctx.arc(cx_curr, cy_curr, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#4f46e5'; ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.stroke();

          // Highlight the shooted intersection point
          ctx.beginPath(); ctx.arc(cx_next, y0c, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b'; ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke();
        }
      }
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
  }, [expr, x0Str, x1Str, iterations, step, method]);

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
          style={tabBtnStyle(method === 'punto-fijo')}
          onClick={() => handleMethodChange('punto-fijo')}
        >
          Iteración de Punto Fijo
        </button>
        <button
          style={tabBtnStyle(method === 'newton-raphson')}
          onClick={() => handleMethodChange('newton-raphson')}
        >
          Newton-Raphson
        </button>
        <button
          style={tabBtnStyle(method === 'secante')}
          onClick={() => handleMethodChange('secante')}
        >
          Método de la Secante
        </button>
      </div>

      {/* Inputs Card */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
          <div style={{ gridColumn: method === 'newton-raphson' ? '1 / 3' : '1 / -1' }}>
            <InputField
              label={method === 'punto-fijo' ? 'Función g(x) para x = g(x)' : 'Función f(x)'}
              value={expr}
              onChange={e => setExpr(e.target.value)}
              placeholder={method === 'punto-fijo' ? 'exp(-x)' : 'exp(-x) - x'}
              description="Disponible: x^2, exp(x), ln(x), sin(x), cos(x), tan(x), sqrt(x). Soporta ^."
            />
          </div>

          {method === 'newton-raphson' && (
            <div style={{ gridColumn: '3 / -1' }}>
              <InputField
                label="Derivada f'(x) [Opcional]"
                value={derivExprManual}
                onChange={e => setDerivExprManual(e.target.value)}
                placeholder="Auto-calcular (Simbólica/Numérica)"
                description="Dejar vacío para calcular derivada analítica simbólica automáticamente."
              />
            </div>
          )}

          <div>
            <InputField
              label={method === 'secante' ? 'Estimación x₀' : 'Estimación inicial x₀'}
              value={x0Str}
              onChange={e => setX0Str(e.target.value)}
            />
          </div>

          {method === 'secante' && (
            <div>
              <InputField
                label="Estimación x₁"
                value={x1Str}
                onChange={e => setX1Str(e.target.value)}
              />
            </div>
          )}

          <div style={{ gridColumn: method === 'secante' ? 'auto' : '2 / 3' }}>
            <InputField
              label="εs Tolerancia (%)"
              value={esStr}
              onChange={e => setEsStr(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: method === 'secante' ? 'auto' : '3 / 4' }}>
            <InputField
              label="Máx. Iteraciones"
              value={imaxStr}
              onChange={e => setImaxStr(e.target.value)}
            />
          </div>
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
              {method === 'punto-fijo' ? 'Diagrama de Telaraña (Cobweb Plot)' : 'Trazado Geométrico de Aproximaciones'}
            </span>
            <span>
              {method === 'punto-fijo' && (
                <>
                  <Dot color="rgba(100,116,139,0.5)" label="y = x" />
                  <Dot color="#ef4444" label="Trayectoria g(x)" />
                  <Dot color="#f59e0b" label="Punto Fijo Est." />
                </>
              )}
              {method === 'newton-raphson' && (
                <>
                  <Dot color="#4f46e5" label="f(x_i)" />
                  <Dot color="#f59e0b" label="Recta Tangente" />
                </>
              )}
              {method === 'secante' && (
                <>
                  <Dot color="#10b981" label="f(x_{i-1})" />
                  <Dot color="#4f46e5" label="f(x_i)" />
                  <Dot color="#f59e0b" label="Recta Secante" />
                </>
              )}
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
              {method === 'punto-fijo' && (
                <>
                  <MetricCard label="xᵢ (estimación)" value={cur.xi.toFixed(6)} />
                  <MetricCard label="xᵢ₊₁ = g(xᵢ)" value={cur.xNext.toFixed(6)} color="#f59e0b" />
                  <MetricCard
                    label="Error aprox. εₐ"
                    value={cur.ea != null ? cur.ea.toFixed(4) + '%' : '—'}
                    color={cur.ea != null && cur.ea < parseFloat(esStr) ? '#10b981' : 'var(--ifm-font-color-base)'}
                  />
                </>
              )}

              {method === 'newton-raphson' && (
                <>
                  <MetricCard label="xᵢ (estimación)" value={cur.xi.toFixed(6)} />
                  <MetricCard label="f(x\u1d62)" value={cur.fxi ? cur.fxi.toExponential(4) : '—'} color="#4f46e5" />
                  <MetricCard label="f'(x\u1d62)" value={cur.dfxi ? cur.dfxi.toExponential(4) : '—'} color="var(--ifm-color-primary)" />
                  <MetricCard label="xᵢ₊₁ (siguiente)" value={cur.xNext.toFixed(6)} color="#f59e0b" />
                  <MetricCard
                    label="Error aprox. εₐ"
                    value={cur.ea != null ? cur.ea.toFixed(4) + '%' : '—'}
                    color={cur.ea != null && cur.ea < parseFloat(esStr) ? '#10b981' : 'var(--ifm-font-color-base)'}
                  />
                </>
              )}

              {method === 'secante' && (
                <>
                  <MetricCard label="xᵢ₋₁ (anterior)" value={cur.xiPrev ? cur.xiPrev.toFixed(6) : '—'} color="#10b981" />
                  <MetricCard label="xᵢ (actual)" value={cur.xi.toFixed(6)} color="#4f46e5" />
                  <MetricCard label="xᵢ₊₁ (siguiente)" value={cur.xNext.toFixed(6)} color="#f59e0b" />
                  <MetricCard label="f(x\u1d62)" value={cur.fxiCurr ? cur.fxiCurr.toExponential(4) : '—'} />
                  <MetricCard
                    label="Error aprox. εₐ"
                    value={cur.ea != null ? cur.ea.toFixed(4) + '%' : '—'}
                    color={cur.ea != null && cur.ea < parseFloat(esStr) ? '#10b981' : 'var(--ifm-font-color-base)'}
                  />
                </>
              )}
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
            Tabla de Iteraciones del Algoritmo
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ margin: 0, border: 'none', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--ifm-background-color)' }}>
                  {method === 'punto-fijo' && ['Iter', 'xᵢ', 'xᵢ₊₁ = g(xᵢ)', 'εₐ (%)'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textAlign: 'right', color: 'var(--ifm-color-primary)', borderBottom: '1px solid var(--ifm-toc-border-color)' }}>{h}</th>
                  ))}
                  {method === 'newton-raphson' && ['Iter', 'xᵢ', 'f(xᵢ)', "f'(xᵢ)", 'x\u1d62\u208a\u2081', 'ε\u2090 (%)'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textAlign: 'right', color: 'var(--ifm-color-primary)', borderBottom: '1px solid var(--ifm-toc-border-color)' }}>{h}</th>
                  ))}
                  {method === 'secante' && ['Iter', 'x\u1d62\u208b\u2081', 'x\u1d62', 'f(x\u1d62\u208b\u2081)', 'f(x\u1d62)', 'x\u1d62\u208a\u2081', 'ε\u2090 (%)'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textAlign: 'right', color: 'var(--ifm-color-primary)', borderBottom: '1px solid var(--ifm-toc-border-color)' }}>{h}</th>
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
                    {/* Punto Fijo Columns */}
                    {method === 'punto-fijo' && (
                      <>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.i}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.xi.toFixed(6)}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>{it.xNext.toFixed(6)}</td>
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
                      </>
                    )}

                    {/* Newton-Raphson Columns */}
                    {method === 'newton-raphson' && (
                      <>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.i}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.xi.toFixed(6)}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.fxi !== undefined ? it.fxi.toExponential(3) : '—'}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.dfxi !== undefined ? it.dfxi.toExponential(3) : '—'}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>{it.xNext.toFixed(6)}</td>
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
                      </>
                    )}

                    {/* Secante Columns */}
                    {method === 'secante' && (
                      <>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.i}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.xiPrev !== undefined ? it.xiPrev.toFixed(6) : '—'}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.xi.toFixed(6)}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.fxiPrev !== undefined ? it.fxiPrev.toExponential(3) : '—'}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.fxiCurr !== undefined ? it.fxiCurr.toExponential(3) : '—'}</td>
                        <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>{it.xNext.toFixed(6)}</td>
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
                      </>
                    )}
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
