import React, { useState } from 'react';
import { Level, Projectile, IterationStep } from './types';
import { solveRoot, SolverMethod } from './solvers';
import { checkObstacleCollision } from './physics';
import { Latex } from '../shared';

interface SolverPanelProps {
  level: Level;
  projectile: Projectile;
  onApplyAngle: (ang: number) => void;
}

export default function SolverPanel({ level, projectile, onApplyAngle }: SolverPanelProps) {
  const [method, setMethod] = useState<SolverMethod>('bisection');
  const [paramA, setParamA] = useState<string>('0');
  const [paramB, setParamB] = useState<string>('60');
  const [tolerance, setTolerance] = useState<string>('0.1');

  const [steps, setSteps] = useState<IterationStep[]>([]);
  const [solvedRoot, setSolvedRoot] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSolve = () => {
    setErrorMsg(null);
    setSolvedRoot(null);
    setSteps([]);

    const a = parseFloat(paramA);
    const b = parseFloat(paramB);
    const tol = parseFloat(tolerance);

    if (isNaN(a) || isNaN(b) || isNaN(tol)) {
      setErrorMsg('Ingresa valores numéricos válidos en todos los campos.');
      return;
    }

    const res = solveRoot(method, level, projectile, a, b, tol);
    setSteps(res.steps);
    setSolvedRoot(res.root);
    setErrorMsg(res.errorMsg);
  };

  const gamma = (projectile.friction / projectile.mass).toFixed(4);

  return (
    <div style={{
      background: 'var(--ifm-background-surface-color)',
      border: '1px solid var(--ifm-toc-border-color)',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      marginTop: '20px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚙️ Solucionador Numérico de Apuntado
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--ifm-color-secondary-contrast-foreground)', lineHeight: '1.5', marginBottom: '15px' }}>
        Para dar en el blanco a $(x_T, y_T) = ({level.targetX.toFixed(1)}, {level.targetY.toFixed(1)})$, debemos hallar la raíz de la función trascendental:
      </p>

      {/* LaTeX Equation */}
      <div style={{ padding: '12px 10px', background: 'var(--ifm-background-color)', borderRadius: '8px', border: '1px solid var(--ifm-toc-border-color)', display: 'flex', justifyContent: 'center', marginBottom: '15px', overflowX: 'auto' }}>
        <Latex>{`f(\\theta) = y(x_T) - y_T = h - y_T + x_T \\tan\\theta + \\frac{g x_T}{\\gamma v_0 \\cos\\theta} + \\frac{g}{\\gamma^2} \\ln\\left(1 - \\frac{\\gamma x_T}{v_0 \\cos\\theta}\\right) = 0`}</Latex>
      </div>

      {/* Method Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--ifm-toc-border-color)', paddingBottom: '10px' }}>
        {(['bisection', 'false_position', 'secant'] as SolverMethod[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMethod(m);
              setSolvedRoot(null);
              setSteps([]);
              setErrorMsg(null);
              if (m === 'secant') {
                setParamA('30');
                setParamB('45');
              } else {
                setParamA('0');
                setParamB('60');
              }
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: method === m ? '#6366f1' : 'transparent',
              color: method === m ? '#fff' : 'var(--ifm-font-color-base)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {m === 'bisection' && 'Bisección'}
            {m === 'false_position' && 'Falsa Posición'}
            {m === 'secant' && 'Secante'}
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--ifm-color-primary)', marginBottom: '5px', textTransform: 'uppercase' }}>
            {method === 'secant' ? 'Aproximación x0 (°)' : 'Límite Inferior a (°)'}
          </label>
          <input
            type="text"
            value={paramA}
            onChange={(e) => setParamA(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--ifm-toc-border-color)', background: 'var(--ifm-background-color)', color: 'var(--ifm-font-color-base)', fontFamily: 'monospace', fontSize: '13px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--ifm-color-primary)', marginBottom: '5px', textTransform: 'uppercase' }}>
            {method === 'secant' ? 'Aproximación x1 (°)' : 'Límite Superior b (°)'}
          </label>
          <input
            type="text"
            value={paramB}
            onChange={(e) => setParamB(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--ifm-toc-border-color)', background: 'var(--ifm-background-color)', color: 'var(--ifm-font-color-base)', fontFamily: 'monospace', fontSize: '13px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--ifm-color-primary)', marginBottom: '5px', textTransform: 'uppercase' }}>
            Tolerancia (%)
          </label>
          <input
            type="text"
            value={tolerance}
            onChange={(e) => setTolerance(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--ifm-toc-border-color)', background: 'var(--ifm-background-color)', color: 'var(--ifm-font-color-base)', fontFamily: 'monospace', fontSize: '13px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSolve}
            style={{
              flex: 1.2,
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '12px',
              boxShadow: '0 2px 6px rgba(99,102,241,0.2)'
            }}
          >
            Calcular Raíz 🔍
          </button>
          {solvedRoot !== null && (
            <button
              onClick={() => onApplyAngle(solvedRoot)}
              style={{
                flex: 1,
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '12px',
                boxShadow: '0 2px 6px rgba(16,185,129,0.2)'
              }}
            >
              Aplicar ({solvedRoot.toFixed(2)}°)
            </button>
          )}
        </div>
      </div>

      {/* Solver error reporting */}
      {errorMsg && (
        <div style={{ padding: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '13px', margin: '15px 0' }}>
          <strong>Error en el Solucionador:</strong> {errorMsg}
        </div>
      )}

      {/* Warning if the root collides with the wall */}
      {solvedRoot !== null && checkObstacleCollision(solvedRoot, level, projectile) && (
        <div style={{ padding: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', color: '#d97706', fontSize: '13px', margin: '15px 0', lineHeight: '1.4' }}>
          <strong>⚠️ Advertencia:</strong> El ángulo calculado ({solvedRoot.toFixed(2)}°) chocará con el muro del nivel. Intenta cambiar los intervalos o aproximaciones iniciales para encontrar la trayectoria bombeada (por ejemplo, buscando en un intervalo más alto como [50, 75]).
        </div>
      )}

      {/* Iterations table display */}
      {steps.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)', color: 'var(--ifm-color-secondary-contrast-foreground)' }}>
                <th style={{ padding: '8px 6px' }}>It</th>
                <th style={{ padding: '8px 6px' }}>
                  {method === 'secant' ? 'x₀' : 'a (inf)'}
                </th>
                <th style={{ padding: '8px 6px' }}>
                  {method === 'secant' ? 'x₁' : 'b (sup)'}
                </th>
                <th style={{ padding: '8px 6px', color: '#6366f1', fontWeight: 'bold' }}>
                  {method === 'secant' ? 'x₂ (nuevo)' : 'θm (medio)'}
                </th>
                <th style={{ padding: '8px 6px' }}>f(a) / f(x₀)</th>
                <th style={{ padding: '8px 6px' }}>f(θm) / f(x₂)</th>
                <th style={{ padding: '8px 6px' }}>Error (%)</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s) => {
                const collides = checkObstacleCollision(s.thetaM, level, projectile);
                return (
                  <tr key={s.step} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
                    <td style={{ padding: '6px', fontFamily: 'monospace' }}>{s.step}</td>
                    <td style={{ padding: '6px', fontFamily: 'monospace' }}>{s.thetaA.toFixed(4)}°</td>
                    <td style={{ padding: '6px', fontFamily: 'monospace' }}>{s.thetaB.toFixed(4)}°</td>
                    <td style={{ padding: '6px', fontFamily: 'monospace', color: '#6366f1', fontWeight: 'bold' }}>
                      {s.thetaM.toFixed(4)}° {collides && <span title="Choca contra el muro" style={{ cursor: 'help' }}>🧱</span>}
                    </td>
                    <td style={{ padding: '6px', fontFamily: 'monospace', color: s.fA < 0 ? '#ef4444' : '#10b981' }}>{s.fA.toFixed(4)}</td>
                    <td style={{ padding: '6px', fontFamily: 'monospace', color: s.fM < 0 ? '#ef4444' : '#10b981' }}>{s.fM.toFixed(4)}</td>
                    <td style={{ padding: '6px', fontFamily: 'monospace' }}>{s.error.toFixed(4)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
