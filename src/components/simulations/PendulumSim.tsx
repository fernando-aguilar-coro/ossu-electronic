import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { MetricCard, MetricsGrid } from './ui';
import { solvePendulumRK4 } from '../../services/numericalSolvers';
import { Latex } from './Latex';

export default function PendulumSim() {
  // Physical parameters
  const [gravity, setGravity] = useState<number>(9.81);
  const [length, setLength] = useState<number>(2.0);
  const [damping, setDamping] = useState<number>(0.1); // b (resistencia del aire)
  const [mass, setMass] = useState<number>(1.0);
  
  // Initial conditions sliders
  const [initThetaDeg, setInitThetaDeg] = useState<number>(60); // theta_0 in degrees
  const [initOmega, setInitOmega] = useState<number>(0);        // w0 (velocidad angular inicial) in rad/s

  // Consolidated physics state to avoid React state synchronization issues!
  const [state, setState] = useState({
    theta: (60 * Math.PI) / 180,
    omega: 0,
    time: 0,
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const trail = useRef<{ x: number; y: number }[]>([]);

  // Fixed dt for highly stable physical step (50 steps per second, dt = 0.02s)
  const dt = 0.02;

  // Reset to initial settings (applying the chosen initTheta and initOmega)
  const handleReset = () => {
    setState({
      theta: (initThetaDeg * Math.PI) / 180,
      omega: initOmega,
      time: 0,
    });
    trail.current = [];
  };

  // Reset automatically when initial conditions sliders change
  useEffect(() => {
    handleReset();
  }, [initThetaDeg, initOmega]);

  // Autoplay game loop running perfectly synchronously
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPlaying) {
      intervalId = setInterval(() => {
        setState(prev => {
          const next = solvePendulumRK4(prev.theta, prev.omega, {
            gravity,
            length,
            damping,
            mass,
            dt,
          });
          return {
            theta: next.theta,
            omega: next.omega,
            time: prev.time + dt,
          };
        });
      }, dt * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, gravity, length, damping, mass]);

  const handleSingleStep = () => {
    setState(prev => {
      const next = solvePendulumRK4(prev.theta, prev.omega, {
        gravity,
        length,
        damping,
        mass,
        dt,
      });
      return {
        theta: next.theta,
        omega: next.omega,
        time: prev.time + dt,
      };
    });
  };

  // Calculate Energies
  const h_height = length * (1 - Math.cos(state.theta));
  const ep = mass * gravity * h_height; // Potential energy m * g * h
  const velocity = length * state.omega;
  const ek = 0.5 * mass * velocity * velocity; // Kinetic energy 0.5 * m * v^2
  const et = ek + ep; // Total mechanical energy

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#0f172a' : '#f8fafc';
    const textColor = isDark ? '#cbd5e1' : '#334155';
    const rodColor = isDark ? '#475569' : '#94a3b8';

    const cx = canvas.width / 2;
    const cy = 60;
    const scale = 95; // pixels per meter scale

    const bobX = cx + length * scale * Math.sin(state.theta);
    const bobY = cy + length * scale * Math.cos(state.theta);

    if (isPlaying) {
      trail.current.push({ x: bobX, y: bobY });
      if (trail.current.length > 80) trail.current.shift();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid background
    ctx.strokeStyle = isDark ? 'rgba(99,102,241,0.04)' : 'rgba(0,0,0,0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }

    // Trail path
    if (trail.current.length > 1) {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trail.current[0].x, trail.current[0].y);
      for (let i = 1; i < trail.current.length; i++) {
        ctx.lineTo(trail.current[i].x, trail.current[i].y);
      }
      ctx.stroke();
    }

    // Reference center line
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + length * scale + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw string/rod
    ctx.strokeStyle = rodColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Pivot joint
    ctx.fillStyle = isDark ? '#6366f1' : '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Mass bob circle
    const bobRadius = 10 + mass * 6;
    const ratio = Math.max(0, Math.min(100, (et / 30) * 100)) / 100;
    const color = `rgb(${Math.round(99 + 130 * ratio)}, ${Math.round(102 - 50 * ratio)}, ${Math.round(241 - 100 * ratio)})`;

    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = isDark ? '#fff' : '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label of mass inside bob
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mass.toFixed(1)}k`, bobX, bobY + 3);
  }, [state.theta, length, mass, gravity, ep, ek, et]);

  return (
    <Card title="Laboratorio Virtual de Péndulo Físico (Solucionador RK4)">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* Play control bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--ifm-background-surface-color)', borderRadius: 10, border: '1px solid var(--ifm-toc-border-color)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ifm-color-primary)' }}>
            ⚙️ Integrador Activo: Runge-Kutta de 4° Orden (RK4)
          </span>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '6px 16px', borderRadius: 6, cursor: 'pointer', border: 'none', background: isPlaying ? '#ef4444' : '#10b981', color: '#fff', fontWeight: 650 }}>
              {isPlaying ? '⏸️ Pausar' : '▶️ Oscilar'}
            </button>
            <button onClick={handleSingleStep} disabled={isPlaying} style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none', background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontWeight: 600 }}>
              ⏭️ Paso Único
            </button>
            <button onClick={handleReset} style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none', background: 'rgba(0,0,0,0.05)', color: 'var(--ifm-font-color-base)', fontWeight: 600 }}>
              🔁 Reiniciar
            </button>
          </div>
        </div>

        {/* Workspace grid */}
        <div className="sim-workspace-grid">
          {/* Canvas physical area */}
          <div>
            <canvas ref={canvasRef} width={650} height={320} style={{ width: '100%', height: 'auto', border: '1px solid var(--ifm-toc-border-color)', borderRadius: 12, display: 'block' }} />
            <span style={{ display: 'block', textAlign: 'center', fontSize: 11, color: 'var(--ifm-color-secondary-contrast-foreground)', marginTop: 8 }}>
              💡 Al calibrar el ángulo o la velocidad inicial, el péndulo se reiniciará automáticamente con el nuevo estado.
            </span>
          </div>

          {/* Physics parameters controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: 11, color: 'var(--ifm-color-primary)', letterSpacing: '0.08em' }}>Condiciones Iniciales y Física</h4>

            <div style={{ background: 'var(--ifm-background-surface-color)', padding: 14, borderRadius: 10, border: '1px solid var(--ifm-toc-border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Sliders for Initial Conditions */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', color: 'var(--ifm-color-primary)' }}>Ángulo Inicial (θ₀): {initThetaDeg}°</label>
                <input type="range" min="-90" max="90" step="5" value={initThetaDeg} onChange={e => setInitThetaDeg(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', color: 'var(--ifm-color-primary)' }}>Velocidad Inicial (v₀ / ω₀): {initOmega.toFixed(2)} rad/s</label>
                <input type="range" min="-6.0" max="6.0" step="0.25" value={initOmega} onChange={e => setInitOmega(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
              </div>

              <div style={{ borderTop: '1px solid var(--ifm-toc-border-color)', paddingTop: 8, marginTop: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block' }}>Masa (m): {mass.toFixed(1)} kg</label>
                <input type="range" min="0.2" max="4.0" step="0.1" value={mass} onChange={e => setMass(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block' }}>Gravedad (g): {gravity.toFixed(2)} m/s²</label>
                <input type="range" min="0" max="25" step="0.5" value={gravity} onChange={e => setGravity(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block' }}>Longitud Hilo (L): {length.toFixed(2)} m</label>
                <input type="range" min="0.5" max="3.0" step="0.1" value={length} onChange={e => setLength(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block' }}>Rozamiento del Aire (b): {damping.toFixed(2)}</label>
                <input type="range" min="0" max="1.5" step="0.05" value={damping} onChange={e => setDamping(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
              </div>
            </div>

            {/* Realtime Energy bars */}
            <div style={{ background: 'var(--ifm-background-surface-color)', padding: 14, borderRadius: 10, border: '1px solid var(--ifm-toc-border-color)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 'bold' }}>Monitor de Energía en Tiempo Real:</span>

              {/* Kinetic Energy Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                  <span>Energía Cinética (Ek)</span>
                  <span style={{ fontFamily: 'monospace' }}>{ek.toFixed(2)} J</span>
                </div>
                <div style={{ width: '100%', height: 10, background: 'rgba(99,102,241,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (ek / 30) * 100)}%`, height: '100%', background: '#ef4444', transition: 'width 0.1s linear' }} />
                </div>
              </div>

              {/* Potential Energy Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                  <span>Energía Potencial (Ep)</span>
                  <span style={{ fontFamily: 'monospace' }}>{ep.toFixed(2)} J</span>
                </div>
                <div style={{ width: '100%', height: 10, background: 'rgba(99,102,241,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (ep / 30) * 100)}%`, height: '100%', background: '#3b82f6', transition: 'width 0.1s linear' }} />
                </div>
              </div>

              {/* Total Mechanical Energy Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                  <span style={{ fontWeight: 'bold' }}>Energía Total (Emec)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{et.toFixed(2)} J</span>
                </div>
                <div style={{ width: '100%', height: 10, background: 'rgba(99,102,241,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (et / 30) * 100)}%`, height: '100%', background: '#10b981', transition: 'width 0.1s linear' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live physical parameters metrics */}
        <MetricsGrid>
          <MetricCard label="Ángulo Actual" value={`${(state.theta * 180 / Math.PI).toFixed(1)}°`} color="var(--ifm-color-primary)" />
          <MetricCard label="Velocidad (Rad/s)" value={state.omega.toFixed(4)} color="#3b82f6" />
          <MetricCard label="Tiempo Físico" value={`${state.time.toFixed(2)}s`} color="#10b981" />
        </MetricsGrid>

        {/* ── Didactic Mathematics breakdown card ── */}
        <div style={{ marginTop: 15, padding: 18, background: 'var(--ifm-background-surface-color)', border: '1px solid var(--ifm-toc-border-color)', borderRadius: 12 }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: 13, textTransform: 'uppercase', color: 'var(--ifm-color-primary)', letterSpacing: '0.08em' }}>
            🧠 ¿Cómo se resuelve matemáticamente?
          </h4>
          <p style={{ fontSize: 12, margin: '0 0 12px 0', lineHeight: 1.6 }}>
            El movimiento oscilatorio de un péndulo simple con amortiguamiento viscoso (fricción del aire) se modela mediante la **Ecuación Diferencial Ordinaria (EDO) de segundo orden no lineal**:
          </p>
          <div style={{ margin: '12px 0', textAlign: 'center' }}>
            <Latex displayMode={true}>
              {"\\theta'' + \\frac{b}{m} \\theta' + \\frac{g}{L} \\sin(\\theta) = 0"}
            </Latex>
          </div>
          <p style={{ fontSize: 12, margin: '0 0 12px 0', lineHeight: 1.6 }}>
            Donde <Latex>{"\\theta"}</Latex> es la elongación angular, <Latex>{"b"}</Latex> es el coeficiente de rozamiento, <Latex>{"m"}</Latex> es la masa del péndulo, <Latex>{"g"}</Latex> es la aceleración de la gravedad y <Latex>{"L"}</Latex> es la longitud de la varilla. 
            <br /><br />
            Para resolverla numéricamente, desglosamos la ecuación en un **sistema acoplado de dos EDOs de primer orden**:
          </p>
          <div style={{ margin: '12px 0', textAlign: 'center' }}>
            <Latex displayMode={true}>
              {"\\frac{d\\theta}{dt} = \\omega, \\quad \\frac{d\\omega}{dt} = -\\frac{g}{L}\\sin(\\theta) - \\frac{b}{m}\\omega"}
            </Latex>
          </div>
          <p style={{ fontSize: 12, margin: '0 0 12px 0', lineHeight: 1.6 }}>
            El simulador integra este sistema en tiempo discreto (<Latex>{"\\Delta t = 0.02 \\text{ s}"}</Latex>) usando el método **Runge-Kutta de 4° Orden (RK4)**. Este método calcula cuatro pendientes estimadas por paso de tiempo para propagar la trayectoria con un error local de truncamiento de <Latex>{"O(\\Delta t^5)"}</Latex>:
          </p>
          <div style={{ margin: '12px 0', textAlign: 'center' }}>
            <Latex displayMode={true}>
              {"\\theta_{n+1} = \\theta_n + \\frac{\\Delta t}{6} (k_{1,\\theta} + 2k_{2,\\theta} + 2k_{3,\\theta} + k_{4,\\theta})"}
            </Latex>
          </div>
          <div style={{ margin: '12px 0', textAlign: 'center' }}>
            <Latex displayMode={true}>
              {"\\omega_{n+1} = \\omega_n + \\frac{\\Delta t}{6} (k_{1,\\omega} + 2k_{2,\\omega} + 2k_{3,\\omega} + k_{4,\\omega})"}
            </Latex>
          </div>

          <span style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 6, color: 'var(--ifm-font-color-base)' }}>Código TypeScript del Solucionador RK4:</span>
          <pre style={{ margin: 0, padding: 12, borderRadius: 8, background: '#1e293b', color: '#f8fafc', fontSize: 11, fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.4 }}>
{`// Fragmento de src/services/numericalSolvers.ts
export function solvePendulumRK4(thetaCur, omegaCur, params) {
  const fTheta = (t, w) => w;
  const fOmega = (t, w) => -(g / L) * Math.sin(t) - (b / m) * w;
  
  // RK4 Slopes:
  const k1_t = fTheta(thetaCur, omegaCur);
  const k1_w = fOmega(thetaCur, omegaCur);
  // ... k2, k3, k4 calculations ...
  
  let nextTheta = thetaCur + (dt / 6) * (k1_t + 2 * k2_t + 2 * k3_t + k4_t);
  let nextOmega = omegaCur + (dt / 6) * (k1_w + 2 * k2_w + 2 * k3_w + k4_w);
  return { theta: nextTheta, omega: nextOmega };
}`}
          </pre>
        </div>
      </div>
    </Card>
  );
}
