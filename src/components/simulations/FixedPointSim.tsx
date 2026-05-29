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

interface FixedPointSimProps {
  defaultExpr?: string;
  defaultX0?: string;
  defaultEs?: string;
  defaultImax?: string;
}

export default function FixedPointSim({
  defaultExpr = 'exp(-x)',
  defaultX0 = '0',
  defaultEs = '0.01',
  defaultImax = '20',
}: FixedPointSimProps) {
  const [expr, setExpr] = useState(defaultExpr);
  const [x0Str, setX0Str] = useState(defaultX0);
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
      const es = parseFloat(esStr);
      const imax = parseInt(imaxStr, 10);

      if (isNaN(x0) || isNaN(es) || isNaN(imax)) {
        throw new Error('Ingresa valores numéricos válidos en todos los campos.');
      }
      if (es <= 0) {
        throw new Error('La tolerancia εs (%) debe ser mayor que cero.');
      }
      if (imax <= 0) {
        throw new Error('El número máximo de iteraciones debe ser al menos 1.');
      }

      const res = runOpenMethod('punto-fijo', expr, x0, 0, es, imax);
      setIterations(res);
    } catch (e) {
      setError((e as Error).message);
      setIterations([]);
    }
  }, [expr, x0Str, esStr, imaxStr, reset]);

  // Run calculations automatically when inputs change
  useEffect(() => {
    setStatus('idle');
    handleRun();
  }, [handleRun, expr, x0Str, esStr, imaxStr]);

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
  }, [iterations, step]);

  const cur = step > 0 && iterations.length > 0
    ? iterations[Math.min(step - 1, iterations.length - 1)]
    : null;

  const x0Val = parseFloat(x0Str);
  const initialCenter = isNaN(x0Val) ? 0 : x0Val;
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
              label={<>Función <Latex>g(x)</Latex> para <Latex>x = g(x)</Latex></>}
              value={expr}
              onChange={e => setExpr(e.target.value)}
              disabled={playing}
              placeholder="exp(-x)"
              description="Operadores: +, -, *, /, ^ (o **). Funciones: sin, cos, tan, log, ln, exp, sqrt, abs, sinh, etc. Constantes: pi, e."
            />
          </div>

          <div>
            <InputField
              label={<>Estimación inicial <Latex>x_0</Latex></>}
              value={x0Str}
              onChange={e => setX0Str(e.target.value)}
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
      {expr && expr.trim() !== '' && (
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
              Diagrama de Telaraña (Cobweb Plot)
            </span>
            <span>
              <Dot color="rgba(100,116,139,0.5)" label={<Latex>y = x</Latex>} />
              <Dot color="#ef4444" label={<>Trayectoria <Latex>g(x)</Latex></>} />
              <Dot color="#f59e0b" label="Punto Fijo Est." />
            </span>
          </div>

          <SimulationCanvas
            expr={expr}
            centerX={centerX}
            defaultRange={defaultRange}
            includeIdentity={true}
            onDrawOverlay={onDrawOverlay}
          />

          {/* Current Step Metrics Cards */}
          {status === 'active' && cur && (
            <MetricsGrid>
              <MetricCard label={<><Latex>x_i</Latex> (estimación)</>} value={cur.xi.toFixed(6)} />
              <MetricCard label={<><Latex>{"x_{i+1} = g(x_i)"}</Latex></>} value={cur.xNext.toFixed(6)} color="#f59e0b" />
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
          headers={['Iter', <Latex>x_i</Latex>, <Latex>{"x_{i+1} = g(x_i)"}</Latex>, <Latex>\varepsilon_a \, (\%)</Latex>]}
          minWidth="550px"
        >
          {iterations.slice(0, step).map(it => (
            <tr
              key={it.i}
              style={{
                borderBottom: '1px solid var(--ifm-toc-border-color)',
              }}
            >
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
            </tr>
          ))}
        </SimulationTable>
      )}
    </div>
  );
}
