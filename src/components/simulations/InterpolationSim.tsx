import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Point,
  SplineInterval,
  runNewtonInterpolation,
  runLagrangeInterpolation,
  runCubicSplineInterpolation,
  generateEquidistantNodes,
  generateChebyshevNodes,
} from '../../services/interpolation';
import { Card, InputField, Latex, tabBtnStyle, Dot } from './shared';
import { evalFn } from '../../services/mathUtils';

export default function InterpolationSim() {
  // Config state
  const [method, setMethod] = useState<'newton' | 'lagrange' | 'spline'>('newton');
  const [mode, setMode] = useState<'free' | 'function'>('free');

  // Free mode points
  const defaultPoints: Point[] = [
    { x: -3.5, y: -1.5 },
    { x: -1.5, y: 1.8 },
    { x: 1.0, y: -0.8 },
    { x: 3.5, y: 2.2 },
  ];
  const [freePoints, setFreePoints] = useState<Point[]>(defaultPoints);
  
  // Function mode parameters
  const [expr, setExpr] = useState('1 / (1 + 25 * x^2)');
  const [funcMinX, setFuncMinX] = useState('-1.5');
  const [funcMaxX, setFuncMaxX] = useState('1.5');
  const [funcN, setFuncN] = useState('8');
  const [nodeType, setNodeType] = useState<'equidistant' | 'chebyshev'>('equidistant');

  // Query evaluator state
  const [queryX, setQueryX] = useState('0.0');

  // Canvas interaction refs & state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoverQueryX, setHoverQueryX] = useState<number | null>(null);

  // Active points computed based on mode
  const points = useMemo(() => {
    if (mode === 'free') {
      return [...freePoints].sort((p1, p2) => p1.x - p2.x);
    } else {
      const minX = parseFloat(funcMinX);
      const maxX = parseFloat(funcMaxX);
      const n = parseInt(funcN, 10);
      if (isNaN(minX) || isNaN(maxX) || isNaN(n) || minX >= maxX || n < 1) {
        return [];
      }
      if (nodeType === 'equidistant') {
        return generateEquidistantNodes(expr, minX, maxX, n);
      } else {
        return generateChebyshevNodes(expr, minX, maxX, n);
      }
    }
  }, [mode, freePoints, expr, funcMinX, funcMaxX, funcN, nodeType]);

  // Compute interpolation results
  const interpolation = useMemo(() => {
    if (points.length === 0) return null;
    try {
      if (method === 'newton') {
        return runNewtonInterpolation(points);
      } else if (method === 'lagrange') {
        return runLagrangeInterpolation(points);
      } else {
        return runCubicSplineInterpolation(points);
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [points, method]);

  // Set default query X based on points bounds
  useEffect(() => {
    if (points.length >= 2) {
      const xMid = (points[0].x + points[points.length - 1].x) / 2;
      setQueryX(xMid.toFixed(2));
    }
  }, [points]);

  // Sync points list to textarea
  const pointsText = useMemo(() => {
    return points.map(p => `${p.x.toFixed(2)}, ${p.y.toFixed(2)}`).join(';\n');
  }, [points]);

  // Handle textarea editing of points
  const handlePointsTextChange = (text: string) => {
    try {
      const newPoints: Point[] = [];
      const lines = text.split(';');
      for (const line of lines) {
        if (line.trim() === '') continue;
        const [xStr, yStr] = line.split(',');
        const x = parseFloat(xStr);
        const y = parseFloat(yStr);
        if (!isNaN(x) && !isNaN(y)) {
          newPoints.push({ x, y });
        }
      }
      if (newPoints.length > 0) {
        setFreePoints(newPoints);
      }
    } catch (e) {
      // Ignore intermediate syntax errors
    }
  };

  // Fixed coordinates viewport bounding box
  const bounds = useMemo(() => {
    if (points.length === 0) {
      return { xMin: -5, xMax: 5, yMin: -3, yMax: 3 };
    }
    const xCoords = points.map(p => p.x);
    const yCoords = points.map(p => p.y);

    let xMin = Math.min(...xCoords);
    let xMax = Math.max(...xCoords);
    let yMin = Math.min(...yCoords);
    let yMax = Math.max(...yCoords);

    // Padding
    const dx = (xMax - xMin) * 0.15 || 1.0;
    const dy = (yMax - yMin) * 0.25 || 1.0;

    xMin -= dx;
    xMax += dx;
    yMin -= dy;
    yMax += dy;

    // Enforce minimum spans
    if (xMax - xMin < 4) {
      const midX = (xMax + xMin) / 2;
      xMin = midX - 2;
      xMax = midX + 2;
    }
    if (yMax - yMin < 3) {
      const midY = (yMax + yMin) / 2;
      yMin = midY - 1.5;
      yMax = midY + 1.5;
    }

    return { xMin, xMax, yMin, yMax };
  }, [points, mode]); // Trigger bounds update only when points count or mode changes to keep it stable during drags

  // Drawing Canvas
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

    const { xMin, xMax, yMin, yMax } = bounds;

    // Coordinate conversion
    const toX = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const toY = (y: number) => PAD.top + ((yMax - y) / (yMax - yMin)) * plotH;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor  = isDark ? '#cbd5e1' : '#374151';
    const gridColor  = isDark ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.06)';
    const bgColor    = isDark ? '#0f1729' : '#f8fafc';
    const axisColor  = isDark ? 'rgba(148,163,184,0.4)' : 'rgba(0,0,0,0.25)';
    const originalCurveColor = isDark ? 'rgba(148,163,184,0.35)' : 'rgba(100,116,139,0.4)';
    const interpCurveColor = isDark ? '#10b981' : '#059669'; // vibrant emerald
    const ptColor = isDark ? '#818cf8' : '#4f46e5'; // Indigo

    // 1. Clear background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // 2. Draw grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let g = 0; g <= 6; g++) {
      const gx = PAD.left + (g / 6) * plotW;
      ctx.beginPath(); ctx.moveTo(gx, PAD.top); ctx.lineTo(gx, PAD.top + plotH); ctx.stroke();
    }
    for (let g = 0; g <= 4; g++) {
      const gy = PAD.top + (g / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(PAD.left, gy); ctx.lineTo(PAD.left + plotW, gy); ctx.stroke();
    }

    // 3. Draw axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    const y0 = toY(0);
    const x0 = toX(0);
    if (y0 >= PAD.top && y0 <= PAD.top + plotH) {
      ctx.beginPath(); ctx.moveTo(PAD.left, y0); ctx.lineTo(PAD.left + plotW, y0); ctx.stroke();
    }
    if (x0 >= PAD.left && x0 <= PAD.left + plotW) {
      ctx.beginPath(); ctx.moveTo(x0, PAD.top); ctx.lineTo(x0, PAD.top + plotH); ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = textColor;
    ctx.font = 'italic bold 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('y', x0 >= PAD.left && x0 <= PAD.left + plotW ? x0 - 8 : PAD.left + 15, PAD.top - 4);
    ctx.textAlign = 'left';
    ctx.fillText('x', PAD.left + plotW + 8, y0 >= PAD.top && y0 <= PAD.top + plotH ? y0 + 12 : PAD.top + plotH - 5);

    // 4. Draw reference function (dashed curve) in function mode
    if (mode === 'function' && expr) {
      ctx.beginPath();
      ctx.strokeStyle = originalCurveColor;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 5]);
      let first = true;
      const ptsCount = 300;
      for (let i = 0; i <= ptsCount; i++) {
        const xVal = xMin + (i / ptsCount) * (xMax - xMin);
        const yVal = evalFn(expr, xVal);
        const px = toX(xVal);
        const py = toY(yVal);
        if (isFinite(yVal) && py >= PAD.top && py <= PAD.top + plotH) {
          first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          first = false;
        } else {
          first = true;
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Draw interpolating polynomial curve (emerald green, solid and glowing)
    if (interpolation && points.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = interpCurveColor;
      ctx.lineWidth = 2.8;
      let first = true;
      const steps = 400;
      for (let i = 0; i <= steps; i++) {
        const xVal = xMin + (i / steps) * (xMax - xMin);
        const yVal = interpolation.evaluate(xVal);
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
    }

    // 6. Draw hover/query value overlay
    const activeQueryX = hoverQueryX !== null ? hoverQueryX : parseFloat(queryX);
    if (!isNaN(activeQueryX) && interpolation && points.length >= 2) {
      const qY = interpolation.evaluate(activeQueryX);
      const qXPix = toX(activeQueryX);
      const qYPix = toY(qY);

      if (isFinite(qY) && qXPix >= PAD.left && qXPix <= PAD.left + plotW) {
        // Draw vertical helper line
        ctx.beginPath();
        ctx.strokeStyle = isDark ? 'rgba(16,185,129,0.3)' : 'rgba(5,150,105,0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.moveTo(qXPix, PAD.top);
        ctx.lineTo(qXPix, PAD.top + plotH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw query point on curve
        if (qYPix >= PAD.top && qYPix <= PAD.top + plotH) {
          ctx.beginPath();
          ctx.arc(qXPix, qYPix, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b'; // Amber yellow
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Label
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillStyle = textColor;
          ctx.textAlign = 'left';
          ctx.fillText(`P(${activeQueryX.toFixed(2)}) = ${qY.toFixed(3)}`, qXPix + 8, qYPix - 4);
        }
      }
    }

    // 7. Draw data points as draggable indicators
    points.forEach((pt, index) => {
      const px = toX(pt.x);
      const py = toY(pt.y);
      const isDragging = dragIndex === index;

      if (px >= PAD.left - 5 && px <= PAD.left + plotW + 5 && py >= PAD.top - 5 && py <= PAD.top + plotH + 5) {
        ctx.beginPath();
        ctx.arc(px, py, isDragging ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isDragging ? '#f59e0b' : ptColor;
        ctx.fill();
        ctx.strokeStyle = isDark ? '#fff' : '#111827';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label above point
        ctx.font = '500 10px Inter, monospace';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(`P${index}(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`, px, py - 10);
      }
    });

    // 8. Tick values on axes
    ctx.fillStyle = textColor;
    ctx.font = '10px Inter, monospace';
    ctx.textAlign = 'center';
    for (let g = 0; g <= 6; g++) {
      const xVal = xMin + (g / 6) * (xMax - xMin);
      ctx.fillText(xVal.toFixed(1), PAD.left + (g / 6) * plotW, H - 8);
    }
    ctx.textAlign = 'right';
    for (let g = 0; g <= 4; g++) {
      const yVal = yMin + (g / 4) * (yMax - yMin);
      ctx.fillText(yVal.toFixed(1), PAD.left - 6, PAD.top + plotH - (g / 4) * plotH + 4);
    }

  }, [points, interpolation, bounds, expr, mode, queryX, hoverQueryX, dragIndex]);

  // Pixel coords -> Math coords
  const getCanvasMouseCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const PAD = { top: 25, right: 30, bottom: 40, left: 55 };
    const plotW = canvas.width - PAD.left - PAD.right;
    const plotH = canvas.height - PAD.top - PAD.bottom;
    const { xMin, xMax, yMin, yMax } = bounds;

    const xm = xMin + ((px - PAD.left) / plotW) * (xMax - xMin);
    const ym = yMax - ((py - PAD.top) / plotH) * (yMax - yMin);
    return { xm, ym, px, py };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'free') return; // Clicking only in free mode
    const coords = getCanvasMouseCoords(e);
    if (!coords) return;

    const PAD = { top: 25, right: 30, bottom: 40, left: 55 };
    const { xm, ym } = coords;

    // Check if clicked near an existing point
    let foundIndex = -1;
    const scaleX = (bounds.xMax - bounds.xMin) / (canvasRef.current!.width - PAD.left - PAD.right);
    const scaleY = (bounds.yMax - bounds.yMin) / (canvasRef.current!.height - PAD.top - PAD.bottom);

    for (let i = 0; i < points.length; i++) {
      const dx = (points[i].x - xm) / scaleX;
      const dy = (points[i].y - ym) / scaleY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 12) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      setDragIndex(foundIndex);
    } else {
      // Clicked in empty space -> Add new point!
      if (points.length < 15) {
        // Enforce boundary checks
        if (coords.px >= PAD.left && coords.px <= canvasRef.current!.width - PAD.right &&
            coords.py >= PAD.top && coords.py <= canvasRef.current!.height - PAD.bottom) {
          const newPt: Point = { x: Math.round(xm * 100) / 100, y: Math.round(ym * 100) / 100 };
          setFreePoints(prev => [...prev, newPt]);
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasMouseCoords(e);
    if (!coords) return;

    const PAD = { top: 25, right: 30, bottom: 40, left: 55 };

    if (dragIndex !== null && mode === 'free') {
      // Update dragged point coordinate
      const xm = Math.round(coords.xm * 100) / 100;
      const ym = Math.round(coords.ym * 100) / 100;

      setFreePoints(prev => {
        const nextPts = [...prev];
        // The sorted representation might shuffle indexes, so find the target point in freePoints
        const targetPt = points[dragIndex];
        const actualIdx = nextPts.findIndex(p => p.x === targetPt.x && p.y === targetPt.y);
        if (actualIdx !== -1) {
          nextPts[actualIdx] = { x: xm, y: ym };
        }
        return nextPts;
      });
    } else {
      // Hovering -> track X to query coordinate
      if (coords.px >= PAD.left && coords.px <= canvasRef.current!.width - PAD.right) {
        setHoverQueryX(coords.xm);
      } else {
        setHoverQueryX(null);
      }
    }
  };

  const handleMouseUp = () => {
    setDragIndex(null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'free') return;
    const coords = getCanvasMouseCoords(e);
    if (!coords) return;

    const PAD = { top: 25, right: 30, bottom: 40, left: 55 };
    const { xm, ym } = coords;

    const scaleX = (bounds.xMax - bounds.xMin) / (canvasRef.current!.width - PAD.left - PAD.right);
    const scaleY = (bounds.yMax - bounds.yMin) / (canvasRef.current!.height - PAD.top - PAD.bottom);

    let foundIndex = -1;
    for (let i = 0; i < points.length; i++) {
      const dx = (points[i].x - xm) / scaleX;
      const dy = (points[i].y - ym) / scaleY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 12) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      // Delete point
      const targetPt = points[foundIndex];
      setFreePoints(prev => prev.filter(p => !(p.x === targetPt.x && p.y === targetPt.y)));
    }
  };

  const clearCanvas = () => {
    setFreePoints([]);
  };

  const resetDefaultPoints = () => {
    setFreePoints(defaultPoints);
  };

  // Evaluate query value
  const queryResult = useMemo(() => {
    const qx = parseFloat(queryX);
    if (isNaN(qx) || !interpolation) return null;
    const interpY = interpolation.evaluate(qx);
    
    let trueY: number | null = null;
    let err: number | null = null;
    if (mode === 'function') {
      trueY = evalFn(expr, qx);
      if (!isNaN(trueY)) {
        err = Math.abs(trueY - interpY);
      }
    }
    return { interpY, trueY, err };
  }, [queryX, interpolation, mode, expr]);

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)' }}>
      {/* ── Methods Tabs ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--ifm-background-color)', borderRadius: 10, border: '1px solid var(--ifm-toc-border-color)', width: 'fit-content' }}>
          <button style={tabBtnStyle(method === 'newton')} onClick={() => setMethod('newton')}>
            Newton (Dif. Divididas)
          </button>
          <button style={tabBtnStyle(method === 'lagrange')} onClick={() => setMethod('lagrange')}>
            Lagrange
          </button>
          <button style={tabBtnStyle(method === 'spline')} onClick={() => setMethod('spline')}>
            Splines Cúbicos
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--ifm-background-color)', borderRadius: 10, border: '1px solid var(--ifm-toc-border-color)', width: 'fit-content' }}>
          <button style={tabBtnStyle(mode === 'free')} onClick={() => setMode('free')}>
            Lienzo Libre (Clics)
          </button>
          <button style={tabBtnStyle(mode === 'function')} onClick={() => setMode('function')}>
            Función Analítica
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: 16, marginBottom: 16 }} className="sim-col-span-2">
        {/* ── Left Side: Canvas & Query ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                Lienzo de Interpolación ({method === 'newton' ? 'Newton' : method === 'lagrange' ? 'Lagrange' : 'Splines Cúbicos Naturales'})
              </span>
              <span>
                <Dot color="#10b981" label="Curva Interpolada" />
                {mode === 'function' && <Dot color="rgba(148,163,184,0.5)" label="Función Original" />}
                <Dot color="#4f46e5" label="Nodos (Puntos)" />
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <canvas
                ref={canvasRef}
                width={700}
                height={320}
                style={{ width: '100%', borderRadius: 10, display: 'block', border: '1px solid var(--ifm-toc-border-color)', cursor: mode === 'free' ? 'crosshair' : 'default' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
              />
              {mode === 'free' && points.length === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: 10, pointerEvents: 'none' }}>
                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600, background: 'var(--ifm-background-color)', padding: '8px 16px', borderRadius: 8, boxShadow: 'var(--ifm-global-shadow-md)' }}>
                    Haz clic en el lienzo para añadir puntos interactivos
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>
                {mode === 'free' ? '💡 Clic: agregar punto | Arrastrar: mover punto | Doble clic: borrar punto' : '💡 Pasa el ratón por el lienzo para explorar valores de x.'}
              </span>
              {mode === 'free' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={clearCanvas} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer' }}>
                    Limpiar Lienzo
                  </button>
                  <button onClick={resetDefaultPoints} style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: '1px solid var(--ifm-toc-border-color)', background: 'var(--ifm-background-color)', color: 'var(--ifm-font-color-base)', cursor: 'pointer' }}>
                    Ejemplo Base
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* ── Query Evaluator ────────────────────────────────────────────────── */}
          {points.length >= 2 && (
            <Card>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 12, alignItems: 'center' }}>
                <div>
                  <InputField
                    label={<>Evaluar Punto <Latex>x</Latex></>}
                    type="range"
                    min={points[0].x.toString()}
                    max={points[points.length - 1].x.toString()}
                    step="0.01"
                    value={queryX}
                    onChange={e => setQueryX(e.target.value)}
                  />
                  <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 12, marginTop: 4 }}>
                    x = {parseFloat(queryX).toFixed(2)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: mode === 'function' ? '1fr 1fr 1fr' : '1fr', gap: 8 }}>
                  <div style={{ padding: '8px 10px', background: 'var(--ifm-background-color)', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--ifm-color-primary)', textTransform: 'uppercase' }}>Interpolado</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#10b981', marginTop: 2 }}>
                      {queryResult ? queryResult.interpY.toFixed(5) : '—'}
                    </div>
                  </div>
                  {mode === 'function' && (
                    <>
                      <div style={{ padding: '8px 10px', background: 'var(--ifm-background-color)', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Analítico Real</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--ifm-font-color-base)', marginTop: 2 }}>
                          {queryResult && queryResult.trueY !== null ? queryResult.trueY.toFixed(5) : '—'}
                        </div>
                      </div>
                      <div style={{ padding: '8px 10px', background: 'var(--ifm-background-color)', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', textAlign: 'center' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Error Absoluto</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#ef4444', marginTop: 2 }}>
                          {queryResult && queryResult.err !== null ? queryResult.err.toExponential(3) : '—'}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ── Right Side: Controls / Parameters ───────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'free' ? (
            <Card style={{ height: '100%' }}>
              <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ifm-color-primary)' }}>
                Nodos Actuales
              </span>
              <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 10px' }}>
                Coordenadas x, y separadas por comas. Cada punto por línea:
              </p>
              <textarea
                style={{ width: '100%', height: '220px', padding: '10px', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', background: 'var(--ifm-background-color)', color: 'var(--ifm-font-color-base)', fontFamily: 'monospace', fontSize: 12, resize: 'none', outline: 'none' }}
                value={pointsText}
                onChange={e => handlePointsTextChange(e.target.value)}
              />
              <span style={{ fontSize: 10, color: '#64748b', marginTop: 4, display: 'block', textAlign: 'right' }}>
                Puntos en lista: {points.length}
              </span>
            </Card>
          ) : (
            <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ifm-color-primary)' }}>
                Función Generadora
              </span>

              <InputField
                label="Fórmula f(x)"
                value={expr}
                onChange={e => setExpr(e.target.value)}
                description="Ej: 1 / (1 + 25 * x^2), sin(x), exp(-x)"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <InputField
                  label="Lím. inf. a"
                  value={funcMinX}
                  onChange={e => setFuncMinX(e.target.value)}
                />
                <InputField
                  label="Lím. sup. b"
                  value={funcMaxX}
                  onChange={e => setFuncMaxX(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ifm-color-primary)', marginBottom: 4, textTransform: 'uppercase' }}>
                  Nodos de Interpolación (n = {funcN})
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={funcN}
                  onChange={e => setFuncN(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ifm-color-primary)', marginBottom: 4, textTransform: 'uppercase' }}>
                  Distribución de Nodos
                </label>
                <select
                  style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', background: 'var(--ifm-background-color)', color: 'var(--ifm-font-color-base)', cursor: 'pointer' }}
                  value={nodeType}
                  onChange={e => setNodeType(e.target.value as any)}
                >
                  <option value="equidistant">Nodos Equiespaciados (Clásico)</option>
                  <option value="chebyshev">Nodos de Chebyshev (Controla Oscilaciones)</option>
                </select>
              </div>

              {points.length > 0 && (
                <div style={{ marginTop: 'auto', padding: '8px 10px', background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)', fontSize: 11, color: 'var(--ifm-font-color-base)' }}>
                  <strong>Fenómeno de Runge</strong>: Prueba 9 o más nodos equiespaciados con la función por defecto, luego cambia a Chebyshev para ver el control de oscilaciones.
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* ── Mathematical Details / Calculations ─────────────────────────────── */}
      {points.length > 0 && interpolation && (
        <Card>
          <span style={{ fontWeight: 700, fontSize: 15, display: 'block', marginBottom: 12, color: 'var(--ifm-font-color-base)' }}>
            Detalle Matemático y Estructura del Modelo
          </span>

          {method === 'newton' && 'matrix' in interpolation && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--ifm-font-color-base)' }}>
                <strong>Matriz de Diferencias Divididas de Newton</strong>. La primera columna representa <Latex>f(x_i)</Latex>, las siguientes representan diferencias de orden superior. La diagonal superior (fila 0) contiene los coeficientes del polinomio:
              </p>
              <div style={{ overflowX: 'auto', marginTop: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--ifm-toc-border-color)' }}>
                  <thead>
                    <tr style={{ background: 'var(--ifm-background-color)', borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                      <th style={{ padding: '8px 12px', fontSize: 11, textAlign: 'left' }}>x_i</th>
                      <th style={{ padding: '8px 12px', fontSize: 11, textAlign: 'right' }}>f[x_i]</th>
                      {points.slice(1).map((_, idx) => (
                        <th key={idx} style={{ padding: '8px 12px', fontSize: 11, textAlign: 'right' }}>
                          Orden {idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((pt, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
                        <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{pt.x.toFixed(3)}</td>
                        {points.map((_, cIdx) => {
                          const val = interpolation.matrix[rIdx][cIdx];
                          if (rIdx + cIdx >= points.length) return <td key={cIdx} style={{ padding: '6px 12px', textAlign: 'right', color: '#64748b' }}>—</td>;
                          const isCoef = rIdx === 0;
                          return (
                            <td
                              key={cIdx}
                              style={{
                                padding: '6px 12px',
                                fontFamily: 'monospace',
                                fontSize: 12,
                                textAlign: 'right',
                                color: isCoef ? '#10b981' : 'var(--ifm-font-color-base)',
                                fontWeight: isCoef ? '700' : '400',
                              }}
                            >
                              {val.toFixed(4)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: '#64748b', display: 'flex', gap: 14 }}>
                <Dot color="#10b981" label="Coeficientes del polinomio (primera fila)" />
              </div>
            </div>
          )}

          {method === 'lagrange' && 'getFormula' in interpolation && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--ifm-font-color-base)' }}>
                <strong>Polinomio Interpolante de Lagrange</strong>. Expresado en términos de la sumatoria ponderada por los polinomios base <Latex>L_i(x)</Latex>:
              </p>
              <div style={{ background: 'var(--ifm-background-color)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--ifm-toc-border-color)', marginTop: 8, overflowX: 'auto', whiteSpace: 'nowrap', fontFamily: 'var(--ifm-font-family-monospace)', fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                {interpolation.getFormula()}
              </div>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                La fórmula de Lagrange pondera cada valor <Latex>y_i</Latex> con un término fraccional que es <Latex>1</Latex> en <Latex>x_i</Latex> y <Latex>0</Latex> en todos los demás nodos.
              </p>
            </div>
          )}

          {method === 'spline' && 'intervals' in interpolation && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--ifm-font-color-base)' }}>
                <strong>Splines Cúbicos Naturales por Intervalos</strong>. El modelo construye polinomios cúbicos individuales de la forma <Latex>S_i(x) = a + b(x - x_i) + c(x - x_i)^2 + d(x - x_i)^3</Latex> para cada tramo:
              </p>
              <div style={{ overflowX: 'auto', marginTop: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--ifm-toc-border-color)' }}>
                  <thead>
                    <tr style={{ background: 'var(--ifm-background-color)', borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                      <th style={{ padding: '8px 12px', fontSize: 11, textAlign: 'left' }}>Intervalo [x_i, x_i+1]</th>
                      <th style={{ padding: '8px 12px', fontSize: 11, textAlign: 'right' }}>a (Orden 0)</th>
                      <th style={{ padding: '8px 12px', fontSize: 11, textAlign: 'right' }}>b (Orden 1)</th>
                      <th style={{ padding: '8px 12px', fontSize: 11, textAlign: 'right' }}>c (Orden 2)</th>
                      <th style={{ padding: '8px 12px', fontSize: 11, textAlign: 'right' }}>d (Orden 3)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(interpolation.intervals as SplineInterval[]).map((interval, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
                        <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 12 }}>
                          [{interval.xMin.toFixed(2)}, {interval.xMax.toFixed(2)}]
                        </td>
                        <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 12, textAlign: 'right' }}>{interval.a.toFixed(4)}</td>
                        <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 12, textAlign: 'right' }}>{interval.b.toFixed(4)}</td>
                        <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 12, textAlign: 'right' }}>{interval.c.toFixed(4)}</td>
                        <td style={{ padding: '6px 12px', fontFamily: 'monospace', fontSize: 12, textAlign: 'right' }}>{interval.d.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                La interpolación por Spline Cúbico Natural asegura que la curva resultante no solo sea continua, sino también que sus derivadas primera y segunda sean continuas en todos los empalmes, y establece momentos nulos <Latex>M_0 = M_n = 0</Latex> en los extremos.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
