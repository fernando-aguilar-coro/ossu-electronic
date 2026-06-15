import React, { useState, useEffect, useRef } from 'react';
import { LEVELS, PROJECTILES } from './game/levels';
import { getAnalyticalPos, getGroundTime } from './game/physics';
import GameCanvas from './game/GameCanvas';
import SolverPanel from './game/SolverPanel';
import { Latex } from './shared';

// Simple sound synthesizer
function playSound(type: 'shoot' | 'win' | 'lose') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    if (type === 'shoot') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.35);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      osc.frequency.setValueAtTime(550, now + 0.2);
      osc.frequency.setValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'lose') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.6);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (e) {
    // Autoplay policy restriction
  }
}

export default function GameSim() {
  const [levelIndex, setLevelIndex] = useState<number>(0);
  const level = LEVELS[levelIndex];

  // Allowed projectiles for the active level
  const allowedProjectiles = PROJECTILES.filter((p) =>
    level.allowedProjectiles.includes(p.id)
  );

  const [activeProjId, setActiveProjId] = useState<string>(allowedProjectiles[0]?.id || 'classic');
  
  // Keep active projectile in sync with level allowed list
  useEffect(() => {
    const isAllowed = level.allowedProjectiles.includes(activeProjId);
    if (!isAllowed && allowedProjectiles.length > 0) {
      setActiveProjId(allowedProjectiles[0].id);
    }
    handleReset();
  }, [levelIndex]);

  const projectile = PROJECTILES.find((p) => p.id === activeProjId) || PROJECTILES[0];

  const [angle, setAngle] = useState<number>(45); // launch angle in degrees
  const [isFlying, setIsFlying] = useState(false);
  const [flightTime, setFlightTime] = useState(0);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [gameState, setGameState] = useState<'aiming' | 'flying' | 'hit' | 'miss' | 'collision'>('aiming');

  const animationRef = useRef<number | null>(null);

  const k = projectile.friction / projectile.mass;
  const angleRad = (angle * Math.PI) / 180;
  const v0x = level.v0 * Math.cos(angleRad);
  const v0y = level.v0 * Math.sin(angleRad);

  const getPos = (t: number) => {
    return getAnalyticalPos(t, angle, level, projectile);
  };

  // Find ground hit time
  const getGroundHitTime = () => {
    let t = 0;
    const dt = 0.01;
    while (t < 20) {
      const pos = getPos(t);
      if (pos.y <= 0 && t > 0) return t;
      t += dt;
    }
    return 10;
  };
  const maxTime = getGroundHitTime();

  // Reset launch when active parameters change
  useEffect(() => {
    if (gameState !== 'flying') {
      handleReset();
    }
  }, [angle, activeProjId]);

  const handleLaunch = () => {
    if (gameState === 'flying') return;
    playSound('shoot');
    setIsFlying(true);
    setFlightTime(0);
    setGameState('flying');
    setTrail([]);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = ((Date.now() - startTime) / 1000) * 1.4; // speed scale
      setFlightTime(elapsed);

      const pos = getPos(elapsed);
      setTrail((prev) => [...prev, pos]);

      // Check obstacle collision
      if (level.obstacleX !== undefined && level.obstacleY !== undefined) {
        if (
          pos.x >= level.obstacleX &&
          pos.x <= level.obstacleX + (level.obstacleW || 0) &&
          pos.y >= level.obstacleY &&
          pos.y <= level.obstacleY + (level.obstacleH || 0)
        ) {
          setGameState('collision');
          setIsFlying(false);
          playSound('lose');
          return;
        }
      }

      // Check target collision
      const dx = pos.x - level.targetX;
      const dy = pos.y - level.targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= level.targetRadius) {
        setGameState('hit');
        setIsFlying(false);
        playSound('win');
        return;
      }

      // Check ground/boundary
      if (pos.y <= 0 || elapsed >= maxTime || pos.x > 110) {
        setGameState('miss');
        setIsFlying(false);
        playSound('lose');
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleReset = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsFlying(false);
    setFlightTime(0);
    setGameState('aiming');
    setTrail([]);
  };

  const handleApplyAngle = (solvedAng: number) => {
    // Round to 2 decimal places
    setAngle(Math.round(solvedAng * 100) / 100);
    handleReset();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Top Header Selector: Level & Projectile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        background: 'var(--ifm-background-surface-color)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--ifm-toc-border-color)'
      }}>
        {/* Level Select */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--ifm-color-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Seleccionar Nivel:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {LEVELS.map((lvl, idx) => (
              <button
                key={lvl.id}
                onClick={() => setLevelIndex(idx)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--ifm-toc-border-color)',
                  background: levelIndex === idx ? '#10b981' : 'var(--ifm-background-color)',
                  color: levelIndex === idx ? '#fff' : 'var(--ifm-font-color-base)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Nivel {lvl.id}
              </button>
            ))}
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--ifm-color-secondary-contrast-foreground)', lineHeight: '1.4' }}>
            {level.description}
          </p>
        </div>

        {/* Projectile Select */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--ifm-color-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Seleccionar Proyectil:
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {allowedProjectiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProjId(p.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--ifm-toc-border-color)',
                  background: activeProjId === p.id ? p.color : 'var(--ifm-background-color)',
                  color: activeProjId === p.id ? '#fff' : 'var(--ifm-font-color-base)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--ifm-color-secondary-contrast-foreground)', lineHeight: '1.4' }}>
            {projectile.description} (Masa: {projectile.mass} kg, Fricción: {projectile.friction} kg/s)
          </p>
        </div>
      </div>

      {/* Physics HUD Overlay Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* HUD - Physical Variables */}
        <div style={{
          background: 'var(--ifm-background-surface-color)',
          border: '1px solid var(--ifm-toc-border-color)',
          padding: '16px',
          borderRadius: '12px',
          color: 'var(--ifm-font-color-base)',
          fontSize: '13px',
          fontFamily: 'monospace',
          lineHeight: '1.5',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontWeight: 'bold', color: '#10b981', marginBottom: '8px', fontSize: '14px' }}>PARÁMETROS FÍSICOS</div>
          Masa (m): {projectile.mass.toFixed(1)} kg<br />
          Fricción (b): {projectile.friction.toFixed(2)} kg/s<br />
          Gravedad (g): {level.gravity.toFixed(1)} m/s²<br />
          Velocidad (v₀): {level.v0.toFixed(1)} m/s<br />
          Altura inicial (h): {level.h.toFixed(1)} m<br />
          Fuerza Viento (Fv): {level.wind.toFixed(1)} N<br />
          Constante &gamma; (b/m): {k.toFixed(4)} s⁻¹<br />
          Objetivo en: ({level.targetX.toFixed(1)}, {level.targetY.toFixed(1)})
        </div>

        {/* HUD - Solver formulas */}
        <div style={{
          background: 'var(--ifm-background-surface-color)',
          border: '1px solid var(--ifm-toc-border-color)',
          padding: '16px',
          borderRadius: '12px',
          color: 'var(--ifm-font-color-base)',
          fontSize: '13px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontWeight: 'bold', color: '#6366f1', marginBottom: '8px', fontSize: '14px', fontFamily: 'monospace' }}>FÓRMULAS FÍSICAS</div>
          <div style={{ margin: '8px 0', overflowX: 'auto' }}>
            <Latex>{`y(t) = h + \\frac{1}{\\gamma} \\left( v_0 \\sin\\theta + \\frac{g}{\\gamma} \\right) \\left(1 - e^{-\\gamma t}\\right) - \\frac{g}{\\gamma}t`}</Latex>
          </div>
          <div style={{ margin: '8px 0', overflowX: 'auto' }}>
            <Latex>{`x(t) = \\left(v_0 \\cos\\theta - \\frac{F_v}{b}\\right) \\frac{1 - e^{-\\gamma t}}{\\gamma} + \\frac{F_v}{b}t`}</Latex>
          </div>
          <hr style={{ margin: '8px 0', borderColor: 'var(--ifm-toc-border-color)' }} />
          <div style={{ fontFamily: 'monospace', lineHeight: '1.5' }}>
            <strong>Ángulo actual:</strong> {angle}°<br />
            v<sub>0x</sub> = {v0x.toFixed(3)} m/s | v<sub>0y</sub> = {v0y.toFixed(3)} m/s
          </div>
        </div>
      </div>

      {/* Render the Canvas */}
      <GameCanvas
        level={level}
        projectile={projectile}
        angle={angle}
        isFlying={isFlying}
        flightTime={flightTime}
        trail={trail}
        gameState={gameState}
        setAngle={setAngle}
      />

      {/* Manual firing controls */}
      <div style={{
        background: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-toc-border-color)',
        padding: '14px 20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--ifm-font-color-base)', fontSize: '13px', fontWeight: 'bold' }}>Ángulo θ:</span>
          <input
            type="number"
            min="0"
            max="90"
            value={angle}
            disabled={isFlying}
            onChange={(e) => {
              const val = Math.min(90, Math.max(0, parseFloat(e.target.value) || 0));
              setAngle(val);
            }}
            style={{
              width: '75px',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid var(--ifm-toc-border-color)',
              background: 'var(--ifm-background-color)',
              color: 'var(--ifm-font-color-base)',
              textAlign: 'center',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
          <input
            type="range"
            min="0"
            max="90"
            value={angle}
            disabled={isFlying}
            onChange={(e) => setAngle(parseFloat(e.target.value))}
            style={{ width: '180px', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleLaunch}
            disabled={isFlying}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 22px',
              fontWeight: 'bold',
              cursor: isFlying ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              boxShadow: '0 2px 6px rgba(16,185,129,0.3)'
            }}
          >
            Lanzar Proyectil 🚀
          </button>
          
          <button
            onClick={handleReset}
            style={{
              background: '#64748b',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 22px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Reiniciar Tiro 🔄
          </button>
        </div>
      </div>

      {/* Root finder helper panel */}
      <SolverPanel
        level={level}
        projectile={projectile}
        onApplyAngle={handleApplyAngle}
      />
    </div>
  );
}
