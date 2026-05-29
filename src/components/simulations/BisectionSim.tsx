import React, { useState, useEffect, useCallback } from 'react';
import { evalFn } from '../../services/mathUtils';
import { runClosedMethod, Iteration } from '../../services/closedMethods';
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

interface BisectionSimProps {
  defaultExpr?: string;
  defaultXa?: string;
  defaultXb?: string;
  defaultEs?: string;
  defaultImax?: string;
}

export default function BisectionSim({
  defaultExpr = 'exp(-x) - x',
  defaultXa = '0',
  defaultXb = '1',
  defaultEs = '1',
  defaultImax = '20',
}: BisectionSimProps) {
  const [expr, setExpr] = useState(defaultExpr);
  const [xaStr, setXaStr] = useState(defaultXa);
  const [xbStr, setXbStr] = useState(defaultXb);
  const [esStr, setEsStr] = useState(defaultEs);
  const [imaxStr, setImaxStr] = useState(defaultImax);

  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'active'>('idle');

  const { step, playing, stop, play, next, prev, reset } = useAnimationPlayer(iterations.length, 1000);

  const handleRun = useCallback(() => {
    reset();
    setError(null);
    try {
      const xa = parseFloat(xaStr);
      const xb = parseFloat(xbStr);
      const es = parseFloat(esStr);
      const imax = parseInt(imaxStr, 10);

      if ([xa, xb, es, imax].some(isNaN)) {
        throw new Error('Ingresa valores numéricos válidos en todos los campos.');
      }
      if (xa >= xb) {
        throw new Error('xa (límite inferior) debe ser estrictamente menor que xb (límite superior).');
      }
      if (es <= 0) {
        throw new Error('La tolerancia εs (%) debe ser mayor que cero.');
      }
      if (imax <= 0) {
        throw new Error('El número máximo de iteraciones debe ser al menos 1.');
      }

      const res = runClosedMethod('biseccion', expr, xa, xb, es, imax);
      setIterations(res);
    } catch (e) {
      setError((e as Error).message);
      setIterations([]);
    }
  }, [expr, xaStr, xbStr, esStr, imaxStr, reset]);

  useEffect(() => {
    setStatus('idle');
    handleRun();
  }, [handleRun]);

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
    const cur = iterations[Math.min(step - 1, iterations.length - 1)];

    // Shaded interval highlight
    ctx.fillStyle = isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.07)';
    ctx.fillRect(toX(cur.xa), 20, toX(cur.xb) - toX(cur.xa), ctx.canvas.height - 60);

    const fxa_val = evalFn(expr, cur.xa);
    const fxb_val = evalFn(expr, cur.xb);

    // Draw xa and xb points on curve
    const pts = [[cur.xa, fxa_val, '#10b981', 'f(x_a)'], [cur.xb, fxb_val, '#ef4444', 'f(x_b)']] as const;
    pts.forEach(([xv, yv, color, lbl]) => {
      const cx = toX(xv);
      const cy = toY(yv);
      if (!isFinite(cy)) return;

      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = isDark ? '#fff' : '#1e293b'; ctx.lineWidth = 1; ctx.stroke();

      ctx.beginPath(); ctx.setLineDash([4, 4]);
      ctx.strokeStyle = color + '90'; ctx.lineWidth = 1.5;
      ctx.moveTo(cx, y0c); ctx.lineTo(cx, cy);
      ctx.stroke(); ctx.setLineDash([]);

      ctx.font = '500 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.fillText(`${lbl} = ${yv.toFixed(4)}`, cx + 8, cy - 4);
    });

    // Draw xr point
    const cxr = toX(cur.xr);
    const cyr = toY(cur.fxr);
    if (isFinite(cyr)) {
      ctx.beginPath(); ctx.arc(cxr, cyr, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b'; ctx.fill();
      ctx.strokeStyle = isDark ? '#fff' : '#1e293b'; ctx.lineWidth = 1.5; ctx.stroke();

      ctx.beginPath(); ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(245,158,11,0.7)'; ctx.lineWidth = 1.2;
      ctx.moveTo(cxr, y0c); ctx.lineTo(cxr, cyr);
      ctx.stroke(); ctx.setLineDash([]);

      ctx.font = 'bold 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
      ctx.fillText(`f(x_r) = ${cur.fxr.toFixed(4)}`, cxr + 8, cyr - 4);
    }

    ctx.beginPath(); ctx.arc(cxr, y0c, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b'; ctx.fill();
    ctx.strokeStyle = isDark ? '#fff' : '#1e293b'; ctx.lineWidth = 1.2; ctx.stroke();
  }, [iterations, step, expr, status]);

  const cur = step > 0 && iterations.length > 0
    ? iterations[Math.min(step - 1, iterations.length - 1)]
    : null;

  const xa0 = parseFloat(xaStr);
  const xb0 = parseFloat(xbStr);
  const initialCenter = isNaN(xa0) || isNaN(xb0) ? 0.5 : (xa0 + xb0) / 2;
  const centerX = cur ? cur.xr : initialCenter;
  const defaultRange = isNaN(xa0) || isNaN(xb0) || xa0 >= xb0 ? 2 : 1.3 * (xb0 - xa0);

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)' }}>
      <Card>
        <div className="sim-input-grid">
          <div className="sim-col-span-full">
            <InputField
              label="Función f(x)"
              value={expr}
              onChange={e => setExpr(e.target.value)}
              disabled={playing}
              placeholder="exp(-x) - x"
              description="Operadores: +, -, *, /, ^ (o **). Funciones: sin, cos, tan, log, ln, exp, sqrt, abs, sinh, etc. Constantes: pi, e."
            />
          </div>
          <InputField
            label={<><Latex>x_a</Latex> (lím. inf.)</>}
            value={xaStr}
            onChange={e => setXaStr(e.target.value)}
            disabled={playing}
          />
          <InputField
            label={<><Latex>x_b</Latex> (lím. sup.)</>}
            value={xbStr}
            onChange={e => setXbStr(e.target.value)}
            disabled={playing}
          />
          <InputField
            label={<><Latex>\varepsilon_s</Latex> Tolerancia (%)</>}
            value={esStr}
            onChange={e => setEsStr(e.target.value)}
            disabled={playing}
          />
          <InputField
            label="Máx. Iter."
            value={imaxStr}
            onChange={e => setImaxStr(e.target.value)}
            disabled={playing}
          />
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

      {expr && expr.trim() !== '' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ifm-font-color-base)' }}>
              Representación Geométrica (Bisección)
            </span>
            <span>
              <Dot color="#10b981" label={<Latex>x_a</Latex>} />
              <Dot color="#ef4444" label={<Latex>x_b</Latex>} />
              <Dot color="#f59e0b" label={<><Latex>x_r</Latex> (Raíz est.)</>} />
            </span>
          </div>

          <SimulationCanvas
            expr={expr}
            centerX={centerX}
            defaultRange={defaultRange}
            onDrawOverlay={onDrawOverlay}
          />

          {status === 'active' && cur && (
            <MetricsGrid>
              <MetricCard label={<><Latex>x_a</Latex> (lím. inf.)</>} value={cur.xa.toFixed(6)} color="#10b981" />
              <MetricCard label={<Latex>f(x_a)</Latex>} value={evalFn(expr, cur.xa).toExponential(4)} color="#10b981" />
              <MetricCard label={<><Latex>x_b</Latex> (lím. sup.)</>} value={cur.xb.toFixed(6)} color="#ef4444" />
              <MetricCard label={<Latex>f(x_b)</Latex>} value={evalFn(expr, cur.xb).toExponential(4)} color="#ef4444" />
              <MetricCard label={<><Latex>x_r</Latex> (estimación)</>} value={cur.xr.toFixed(6)} color="#f59e0b" />
              <MetricCard label={<Latex>f(x_r)</Latex>} value={cur.fxr.toExponential(4)} color="var(--ifm-color-primary)" />
              <MetricCard
                label={<>Error aprox. <Latex>\varepsilon_a</Latex></>}
                value={cur.ea != null ? cur.ea.toFixed(4) + '%' : '—'}
                color={cur.ea != null && cur.ea < parseFloat(esStr) ? '#10b981' : 'var(--ifm-font-color-base)'}
              />
            </MetricsGrid>
          )}
        </Card>
      )}

      {status === 'active' && iterations.length > 0 && (
        <SimulationTable
          headers={[
            'Iteración',
            <Latex>x_a</Latex>,
            <Latex>f(x_a)</Latex>,
            <Latex>x_b</Latex>,
            <Latex>f(x_b)</Latex>,
            <Latex>x_r</Latex>,
            <Latex>f(x_r)</Latex>,
            <Latex>\varepsilon_a \, (\%)</Latex>
          ]}
          minWidth="680px"
        >
          {iterations.slice(0, step).map(it => (
            <tr key={it.i} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
              <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.i}</td>
              <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.xa.toFixed(6)}</td>
              <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{evalFn(expr, it.xa).toExponential(3)}</td>
              <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{it.xb.toFixed(6)}</td>
              <td style={{ padding: '8px 14px', fontFamily: 'monospace', textAlign: 'right', fontSize: 13 }}>{evalFn(expr, it.xb).toExponential(3)}</td>
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
        </SimulationTable>
      )}
    </div>
  );
}
