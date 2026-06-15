import React, { useEffect, useRef } from 'react';
import { Level, Projectile } from './types';
import { getAnalyticalPos } from './physics';

interface GameCanvasProps {
  level: Level;
  projectile: Projectile;
  angle: number;
  isFlying: boolean;
  flightTime: number;
  trail: { x: number; y: number }[];
  gameState: 'aiming' | 'flying' | 'hit' | 'miss' | 'collision';
  setAngle: (ang: number) => void;
}

export default function GameCanvas({
  level,
  projectile,
  angle,
  isFlying,
  flightTime,
  trail,
  gameState,
  setAngle,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);

  const angleRad = (angle * Math.PI) / 180;

  // Exact coordinates helper
  const getPos = (t: number) => {
    return getAnalyticalPos(t, angle, level, projectile);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Scale mappings
    const minX = -10, maxX = 90;
    const minY = -5, maxY = 35;
    const toCanvasX = (x: number) => ((x - minX) / (maxX - minX)) * W;
    const toCanvasY = (y: number) => H - ((y - minY) / (maxY - minY)) * H;

    // Inverse mappings for dragging
    const toWorldX = (cx: number) => minX + (cx / W) * (maxX - minX);
    const toWorldY = (cy: number) => minY + ((H - cy) / H) * (maxY - minY);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Sky Background
      ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
      ctx.fillRect(0, 0, W, H);

      // Ground (below y = 0)
      ctx.fillStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.fillRect(0, toCanvasY(0), W, H - toCanvasY(0));
      ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(0));
      ctx.lineTo(W, toCanvasY(0));
      ctx.stroke();

      // Draw obstacle if defined in the level
      if (level.obstacleX !== undefined && level.obstacleY !== undefined) {
        ctx.fillStyle = isDark ? '#ef4444' : '#dc2626';
        ctx.fillRect(
          toCanvasX(level.obstacleX),
          toCanvasY(level.obstacleY + (level.obstacleH || 0)),
          toCanvasX(level.obstacleX + (level.obstacleW || 0)) - toCanvasX(level.obstacleX),
          toCanvasY(level.obstacleY) - toCanvasY(level.obstacleY + (level.obstacleH || 0))
        );
        ctx.strokeStyle = isDark ? '#fca5a5' : '#7f1d1d';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
          toCanvasX(level.obstacleX),
          toCanvasY(level.obstacleY + (level.obstacleH || 0)),
          toCanvasX(level.obstacleX + (level.obstacleW || 0)) - toCanvasX(level.obstacleX),
          toCanvasY(level.obstacleY) - toCanvasY(level.obstacleY + (level.obstacleH || 0))
        );
      }

      // Draw target
      const tx = toCanvasX(level.targetX);
      const ty = toCanvasY(level.targetY);
      const tr = level.targetRadius * (W / (maxX - minX));
      
      ctx.beginPath();
      ctx.arc(tx, ty, tr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tx, ty, tr * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      // Launch tower
      ctx.strokeStyle = isDark ? '#64748b' : '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(toCanvasX(0), toCanvasY(0));
      ctx.lineTo(toCanvasX(0), toCanvasY(level.h));
      ctx.stroke();

      // Aiming vector guide
      const launcherX = toCanvasX(0);
      const launcherY = toCanvasY(level.h);

      if (gameState === 'aiming') {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(launcherX, launcherY);
        ctx.lineTo(
          launcherX + Math.cos(angleRad) * 50,
          launcherY - Math.sin(angleRad) * 50
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Trail
      if (trail.length > 0) {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(trail[0].x), toCanvasY(trail[0].y));
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(toCanvasX(trail[i].x), toCanvasY(trail[i].y));
        }
        ctx.stroke();
      }

      // Draw Projectile
      const currentPos = isFlying || gameState !== 'aiming' ? getPos(flightTime) : { x: 0, y: level.h };
      if (currentPos.y >= -2) {
        ctx.beginPath();
        ctx.arc(toCanvasX(currentPos.x), toCanvasY(currentPos.y), 8, 0, Math.PI * 2);
        ctx.fillStyle = projectile.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Game state text overlay
      if (gameState === 'hit') {
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 ¡VICTORIA! IMPACTO DIRECTO', W / 2, 50);
      } else if (gameState === 'miss') {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💥 Intento fallido. Vuelve a intentar.', W / 2, 50);
      } else if (gameState === 'collision') {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧱 ¡COLISIÓN CON EL MURO! Intenta un tiro bombeado.', W / 2, 50);
      }
    };

    draw();

    // Mouse handlers for aiming drag
    const getMouseAngle = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const scaleX = W / rect.width;
      const scaleY = H / rect.height;

      const wx = toWorldX(mx * scaleX);
      const wy = toWorldY(my * scaleY);

      const dx = wx - 0;
      const dy = wy - level.h;

      let angRad = Math.atan2(dy, dx);
      let angDeg = Math.round((angRad * 180) / Math.PI);
      
      if (angDeg < 0) angDeg = 0;
      if (angDeg > 90) angDeg = 90;
      return angDeg;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isFlying) return;
      isDraggingRef.current = true;
      const newAng = getMouseAngle(e);
      setAngle(newAng);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || isFlying) return;
      const newAng = getMouseAngle(e);
      setAngle(newAng);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [angle, flightTime, isFlying, trail, gameState, level, projectile]);

  return (
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--ifm-toc-border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      <canvas
        ref={canvasRef}
        width={1000}
        height={420}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: isFlying ? 'not-allowed' : 'crosshair' }}
      />
    </div>
  );
}
