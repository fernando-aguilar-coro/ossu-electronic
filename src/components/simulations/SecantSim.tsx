import React, { useState, useEffect, useCallback } from 'react';
import { runOpenMethod, OpenIteration } from '../../services/openMethods';
import { useAnimationPlayer } from '../../hooks/useAnimationPlayer';
import {
  Card,
  InputField,
  MetricCard,
  SimulationControls,
  Dot,
  SimulationCanvas,
  SimulationError,
  MetricsGrid,
  SimulationTable,
  Latex,
} from './shared';

interface SecantSimProps {
  defaultExpr?: string;
  defaultX0?: string;
  defaultX1?: string;
  defaultEs?: string;
  defaultImax?: string;
}

export default function SecantSim({
  defaultExpr = 'exp(-x) - x',
  defaultX0 = '0',
  defaultX1 = '1',
  defaultEs = '0.01',
  defaultImax = '20',
}: SecantSimProps) {
  const [expr, setExpr] = useState(defaultExpr);
  const [x0Str, setX0Str] = useState(defaultX0);
  const [x1Str, setX1Str] = useState(defaultX1);
  const [esStr, setEsStr] = useState(defaultEs);
  const [imaxStr, setImaxStr] = useState(defaultImax);

  const [iterations, setIterations] = useState<OpenIteration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'active'>('idle');

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

      if (isNaN(x0) || isNaN(x1) || isNaN(es) || isNaN(imax)) {
        throw new Error('Ingresa valores numéricos válidos en todos los campos.');
      }
      if (es <= 0) {
        throw new Error('La tolerancia εs (%) debe ser mayor que cero.');
      }
      if (imax <= 0) {
        throw new Error('El número máximo de iteraciones debe ser al menos 1.');
      }

      const res = runOpenMethod('secante', expr, x0, x1, es, imax);
      setIterations(res);
    } catch (e) {
      setError((e as Error).message);
      setIterations([]);
    }
  }, [expr, x0Str, x1Str, esStr, imaxStr, reset]);

  // Run calculations automatically when inputs change
  useEffect(() => {
    setStatus('idle');
    handleRun();
  }, [handleRun, expr, x0Str, x1Str, esStr, imaxStr]);

  const handlePlay = useCallback(() => {
    setStatus('active');
    play();
  }, [play]);

  const handleReset = useCallback(() => {
    setStatus('idle');
    reset();
  }, [reset]);


  const onDrawOverlay = useCallback((
    ctx: CanvasRenderingContext2D,
    toX: (x: number) => number,
    toY: (y: number) => number,
    y0c: number,
    isDark: boolean
  ) => {
    if (status === 'idle' || step <= 0 || iterations.length === 0) return;
    const curIdx = Math.min(step - 1, iterations.length - 1);
    const cur = iterations[curIdx];

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
  }, [iterations, step]);

  const cur = step > 0 && iterations.length > 0
    ? iterations[Math.min(step - 1, iterations.length - 1)]
    : null;

  const x0Val = parseFloat(x0Str);
  const x1Val = parseFloat(x1Str);
  const initialCenter = isNaN(x0Val) || isNaN(x1Val) ? 0.5 : (x0Val + x1Val) / 2;
  const centerX = cur ? cur.xNext : initialCenter;

  let defaultRange = 2;
  if (iterations.length > 0) {
    const allX = iterations.map(it => [it.xi, it.xNext]).flat().filter(isFinite);
    if (allX.length > 0) {
      const rawMin = Math.min(...allX);
      const rawMax = Math.max(...allX);
      defaultRange = Math.max(2, (rawMax - rawMin) * 1.5);
    }
  }

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)' }}>
      {/* Inputs Card */}
      <Card>
        <div className="sim-input-grid">
          <div className="sim-col-span-full">
            <InputField
              label={<>Función <Latex>f(x)</Latex></>}
              value={expr}
              onChange={e => setExpr(e.target.value)}
              disabled={playing}
              placeholder="exp(-x) - x"
              description="Disponible: x^2, exp(x), ln(x), sin(x), cos(x), tan(x), sqrt(x). Soporta ^."
            />
          </div>

          <div>
            <InputField
              label={<>Estimación <Latex>x_0</Latex></>}
              value={x0Str}
              onChange={e => setX0Str(e.target.value)}
              disabled={playing}
            />
          </div>

          <div>
            <InputField
              label={<>Estimación <Latex>x_1</Latex></>}
              value={x1Str}
              onChange={e => setX1Str(e.target.value)}
              disabled={playing}
            />
          </div>

          <div>
            <InputField
              label={<><Latex>\varepsilon_s</Latex> Tolerancia (%)</>}
              value={esStr}
              onChange={e => setEsStr(e.target.value)}
              disabled={playing}
            />
          </div>

          <div>
            <InputField
              label="Máx. Iteraciones"
              value={imaxStr}
              onChange={e => setImaxStr(e.target.value)}
              disabled={playing}
            />
          </div>
        </div>

        <SimulationControls
          playing={playing}
          hasIterations={iterations.length > 0}
          step={step}
          totalSteps={iterations.length}
          onPlay={handlePlay}
          onPause={stop}
          onPrev={prev}
          onNext={next}
          onReset={handleReset}
          isIdle={status === 'idle'}
        />

        {error && <SimulationError error={error} />}
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
              Trazado Geométrico de Aproximaciones (Método de la Secante)
            </span>
            <span>
              <Dot color="#10b981" label={<Latex>{"f(x_{i-1})"}</Latex>} />
              <Dot color="#4f46e5" label={<Latex>f(x_i)</Latex>} />
              <Dot color="#f59e0b" label="Recta Secante" />
            </span>
          </div>

          <SimulationCanvas
            expr={expr}
            centerX={centerX}
            defaultRange={defaultRange}
            onDrawOverlay={onDrawOverlay}
          />

          {/* Current Step Metrics Cards */}
          {status === 'active' && cur && (
            <MetricsGrid>
              <MetricCard label={<><Latex>{"x_{i-1}"}</Latex> (anterior)</>} value={cur.xiPrev ? cur.xiPrev.toFixed(6) : '—'} color="#10b981" />
              <MetricCard label={<><Latex>x_i</Latex> (actual)</>} value={cur.xi.toFixed(6)} color="#4f46e5" />
              <MetricCard label={<><Latex>{"x_{i+1}"}</Latex> (siguiente)</>} value={cur.xNext.toFixed(6)} color="#f59e0b" />
              <MetricCard label={<Latex>f(x_i)</Latex>} value={cur.fxiCurr ? cur.fxiCurr.toExponential(4) : '—'} />
              <MetricCard
                label={<>Error aprox. <Latex>\varepsilon_a</Latex></>}
                value={cur.ea != null ? cur.ea.toFixed(4) + '%' : '—'}
                color={cur.ea != null && cur.ea < parseFloat(esStr) ? '#10b981' : 'var(--ifm-font-color-base)'}
              />
            </MetricsGrid>
          )}
        </Card>
      )}

      {/* Table Section */}
      {status === 'active' && iterations.length > 0 && (
        <SimulationTable
          title="Tabla de Iteraciones del Algoritmo"
          headers={['Iter', <Latex>{"x_{i-1}"}</Latex>, <Latex>x_i</Latex>, <Latex>{"f(x_{i-1})"}</Latex>, <Latex>f(x_i)</Latex>, <Latex>{"x_{i+1}"}</Latex>, <Latex>\varepsilon_a \, (\%)</Latex>]}
          minWidth="650px"
        >
          {iterations.slice(0, step).map(it => (
            <tr
              key={it.i}
              style={{
                borderBottom: '1px solid var(--ifm-toc-border-color)',
              }}
            >
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
            </tr>
          ))}
        </SimulationTable>
      )}
    </div>
  );
}
