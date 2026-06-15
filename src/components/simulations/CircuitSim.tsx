import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { Dot, MetricCard, MetricsGrid } from './ui';
import { solveCircuit, CircuitNode, CircuitBranch } from '../../services/numericalSolvers';
import { Latex } from './Latex';

export default function CircuitSim() {
  const [method, setMethod] = useState<'gauss' | 'gauss-seidel' | 'jacobi'>('gauss');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [iteration, setIteration] = useState<number>(0);
  const [error, setError] = useState<number>(0);
  const [tolerance, setTolerance] = useState<number>(1e-4); // Tolerancia ajustable

  // Estado para guardar el historial de las iteraciones
  const [history, setHistory] = useState<{
    iter: number;
    voltages: { [key: number]: number };
    error: number;
  }[]>([]);

  // 1. Nodos por defecto (Puntos de conexión eléctrica)
  const [nodes, setNodes] = useState<CircuitNode[]>([
    { id: 0, x: 80, y: 160, name: 'Fuente (+) 12V', isFixed: true, voltage: 12 },
    { id: 1, x: 250, y: 70, name: 'Junta A', isFixed: false, voltage: 6 },
    { id: 2, x: 250, y: 250, name: 'Junta B', isFixed: false, voltage: 6 },
    { id: 3, x: 450, y: 70, name: 'Junta C', isFixed: false, voltage: 6 },
    { id: 4, x: 450, y: 250, name: 'Junta D', isFixed: false, voltage: 6 },
    { id: 5, x: 620, y: 160, name: 'Tierra (GND)', isFixed: true, voltage: 0 }
  ]);

  // 2. Ramas (Resistores y Fuentes de Corriente)
  const [branches, setBranches] = useState<CircuitBranch[]>([
    { id: 0, from: 0, to: 1, type: 'resistor', resistance: 2.0, currentValue: 0 },
    { id: 1, from: 0, to: 2, type: 'resistor', resistance: 4.0, currentValue: 0 },
    { id: 2, from: 1, to: 3, type: 'resistor', resistance: 2.0, currentValue: 0 },
    { id: 3, from: 2, to: 4, type: 'resistor', resistance: 1.0, currentValue: 0 },
    { id: 4, from: 1, to: 2, type: 'resistor', resistance: 5.0, currentValue: 0 },
    { id: 5, from: 3, to: 4, type: 'resistor', resistance: 10.0, currentValue: 0 },
    { id: 6, from: 3, to: 5, type: 'resistor', resistance: 2.0, currentValue: 0 },
    { id: 7, from: 4, to: 5, type: 'resistor', resistance: 4.0, currentValue: 0 },
    { id: 8, from: 2, to: 3, type: 'currentSource', resistance: 0, currentValue: 2.0 }
  ]);

  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const flowOffset = useRef<number>(0);

  // Estado del sistema de ecuaciones (Matrix view)
  const [matrixState, setMatrixState] = useState<{
    matrixA: number[][];
    vectorB: number[];
    varNodeIds: number[];
  }>({ matrixA: [], vectorB: [], varNodeIds: [] });

  // Estado de arrastre
  const [draggedNode, setDraggedNode] = useState<number | null>(null);

  // Reiniciar simulación a aproximación inicial
  const resetSim = () => {
    setNodes(prev => prev.map(node => {
      if (node.isFixed) return node;
      return { ...node, voltage: 6.0 }; // Estimación inicial arbitraria
    }));
    setIteration(0);
    setError(0);
  };

  // Ejecutar un paso del resolvedor numérico
  const stepSim = () => {
    const { nextVoltages, maxDiff, matrixA, vectorB, varNodeIds } = solveCircuit(nodes, branches, method);
    
    setNodes(prev => prev.map((node, i) => ({ ...node, voltage: nextVoltages[i] })));
    setIteration(prev => {
      const nextIter = prev + 1;
      
      const voltMap: { [key: number]: number } = {};
      varNodeIds.forEach(id => {
        const nextIdx = nodes.findIndex(node => node.id === id);
        voltMap[id] = nextIdx !== -1 ? nextVoltages[nextIdx] : 0;
      });

      setHistory(h => [
        ...h,
        { iter: nextIter, voltages: voltMap, error: maxDiff }
      ]);
      return nextIter;
    });
    setError(maxDiff);
    setMatrixState({ matrixA, vectorB, varNodeIds });

    // Detener automáticamente las iteraciones si ya convergió a la tolerancia deseada
    if (method === 'gauss' || maxDiff < tolerance) {
      setIsPlaying(false);
    }
  };

  // Efecto para actualizar matrices estáticas al cambiar topología y reiniciar iteración
  useEffect(() => {
    const { matrixA, vectorB, varNodeIds } = solveCircuit(nodes, branches, 'gauss');
    setMatrixState({ matrixA, vectorB, varNodeIds });
    setIteration(0);
    setError(0);
    setHistory([]);
    // Reiniciar los voltajes a la estimación inicial de 6.0V para ver la convergencia desde cero
    setNodes(prev => prev.map(node => {
      if (node.isFixed) return node;
      return { ...node, voltage: 6.0 };
    }));
  }, [method, branches, tolerance]);

  // Bucle automático si está reproduciéndose
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        stepSim();
      }, method === 'gauss' ? 400 : 150);
    }
    return () => clearInterval(timer);
  }, [isPlaying, nodes, method, branches, tolerance]);

  // Renderizado gráfico premium de circuito en canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#0f172a' : '#f8fafc';
    const textColor = isDark ? '#cbd5e1' : '#334155';
    const wireColor = isDark ? '#475569' : '#94a3b8';

    const drawResistor = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, isSelected: boolean) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / len;
      const uy = dy / len;
      const px = -uy;
      const py = ux;

      ctx.strokeStyle = isSelected ? '#10b981' : wireColor;
      ctx.lineWidth = isSelected ? 3.5 : 2;

      // Cables de conexión
      const startX = x1 + ux * len * 0.28;
      const startY = y1 + uy * len * 0.28;
      const endX = x1 + ux * len * 0.72;
      const endY = y1 + uy * len * 0.72;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(startX, startY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Dibujar zig-zag estándar del resistor
      const zigZagCount = 6;
      const step = (len * 0.44) / zigZagCount;
      const amp = 9;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      for (let i = 0; i <= zigZagCount; i++) {
        const curX = startX + ux * step * i;
        const curY = startY + uy * step * i;
        if (i === 0 || i === zigZagCount) {
          ctx.lineTo(curX, curY);
        } else {
          const side = i % 2 === 0 ? 1 : -1;
          ctx.lineTo(curX + px * amp * side, curY + py * amp * side);
        }
      }
      ctx.stroke();

      // Símbolo "R"
      const mx = (x1 + x2) / 2 + px * 16;
      const my = (y1 + y2) / 2 + py * 16;
      ctx.fillStyle = textColor;
      ctx.font = 'italic 10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
    };

    const drawCurrentSource = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, val: number, isSelected: boolean) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / len;
      const uy = dy / len;
      const px = -uy;
      const py = ux;

      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const radius = 15;

      ctx.strokeStyle = isSelected ? '#10b981' : wireColor;
      ctx.lineWidth = isSelected ? 3.5 : 2;

      // Cables
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(mx - ux * radius, my - uy * radius);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(mx + ux * radius, my + uy * radius);
      ctx.stroke();

      // Círculo de la fuente
      ctx.beginPath();
      ctx.arc(mx, my, radius, 0, 2 * Math.PI);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.stroke();

      // Flecha de dirección
      const arrowLen = 14;
      const arrowStartX = mx - ux * (arrowLen / 2);
      const arrowStartY = my - uy * (arrowLen / 2);
      const arrowEndX = mx + ux * (arrowLen / 2);
      const arrowEndY = my + uy * (arrowLen / 2);

      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(arrowEndX, arrowEndY);
      ctx.stroke();

      // Punta de flecha
      ctx.fillStyle = isSelected ? '#10b981' : wireColor;
      ctx.beginPath();
      ctx.moveTo(arrowEndX, arrowEndY);
      ctx.lineTo(arrowEndX - ux * 5 + px * 4, arrowEndY - uy * 5 + py * 4);
      ctx.lineTo(arrowEndX - ux * 5 - px * 4, arrowEndY - uy * 5 - py * 4);
      ctx.closePath();
      ctx.fill();
    };

    const drawGroundSymbol = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      ctx.strokeStyle = wireColor;
      ctx.lineWidth = 2;

      // Conector hacia abajo
      ctx.beginPath();
      ctx.moveTo(x, y + 16);
      ctx.lineTo(x, y + 30);
      ctx.stroke();

      // Líneas horizontales de tierra
      ctx.beginPath(); ctx.moveTo(x - 12, y + 30); ctx.lineTo(x + 12, y + 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 7, y + 34); ctx.lineTo(x + 7, y + 34); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 2, y + 38); ctx.lineTo(x + 2, y + 38); ctx.stroke();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      flowOffset.current += 1.4;

      // Rejilla de fondo
      ctx.strokeStyle = isDark ? 'rgba(99,102,241,0.05)' : 'rgba(0,0,0,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // 1. Dibujar Ramas/Componentes
      branches.forEach(branch => {
        const fromNode = nodes.find(n => n.id === branch.from);
        const toNode = nodes.find(n => n.id === branch.to);
        if (!fromNode || !toNode) return;

        const isSelected = selectedBranch === branch.id;

        // Calcular corriente física: V = I * R => I = (V_from - V_to) / R
        let current = 0;
        if (branch.type === 'resistor') {
          current = (fromNode.voltage - toNode.voltage) / branch.resistance;
          drawResistor(ctx, fromNode.x, fromNode.y, toNode.x, toNode.y, isSelected);
        } else if (branch.type === 'currentSource') {
          current = branch.currentValue;
          drawCurrentSource(ctx, fromNode.x, fromNode.y, toNode.x, toNode.y, current, isSelected);
        }

        // Flujo de electrones animados
        const absCurrent = Math.abs(current);
        if (absCurrent > 0.005) {
          ctx.save();
          // Color de electrones: azul brillante para resistores, dorado para fuentes de corriente
          ctx.strokeStyle = branch.type === 'resistor' ? '#60a5fa' : '#fbbf24';
          ctx.lineWidth = Math.min(4, 1.5 + absCurrent * 0.8);
          ctx.setLineDash([6, 15]);
          ctx.lineDashOffset = (current > 0 ? -1 : 1) * flowOffset.current;
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
          ctx.restore();
        }
      });

      // 2. Dibujar Nodos
      nodes.forEach(node => {
        // Tierra tiene representación diferente
        const isGroundNode = node.isFixed && node.voltage === 0 && node.name.includes('Tierra');
        if (isGroundNode) {
          drawGroundSymbol(ctx, node.x, node.y);
        }

        // Degradado de color del nodo basado en voltaje (Rojo=Alto voltaje, Azul=Tierra/Negativo)
        const vMin = -2;
        const vMax = 12;
        const ratio = Math.max(0, Math.min(1, (node.voltage - vMin) / (vMax - vMin)));
        
        // Rojo (239, 68, 68) para positivo, Azul (59, 130, 246) para cero/negativo
        const r = Math.round(239 * ratio + 59 * (1 - ratio));
        const g = Math.round(68 * ratio + 130 * (1 - ratio));
        const b = Math.round(68 * ratio + 246 * (1 - ratio));
        const nodeColor = `rgb(${r}, ${g}, ${b})`;

        // Halo de brillo
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = selectedNode === node.id ? 20 : 8;

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.isFixed ? 18 : 14, 0, 2 * Math.PI);
        ctx.fill();

        ctx.shadowBlur = 0; // Reiniciar sombra
        
        ctx.strokeStyle = selectedNode === node.id ? '#10b981' : (isDark ? '#fff' : '#000');
        ctx.lineWidth = selectedNode === node.id ? 3 : 2;
        ctx.stroke();

        // Etiquetas de los nodos
        ctx.fillStyle = textColor;
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y - 24);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${node.voltage.toFixed(1)}V`, node.x, node.y + 4);
      });
    };

    const loop = () => {
      render();
      animationRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animationRef.current);
  }, [nodes, branches, selectedBranch, selectedNode]);

  // Manejo de clicks y arrastres en canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Scale client mouse coordinates to match internal canvas resolution
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // 1. Detectar click en Nodos
    const clickedNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 22;
    });

    if (clickedNode) {
      setDraggedNode(clickedNode.id);
      setSelectedNode(clickedNode.id);
      setSelectedBranch(null);
      return;
    }

    // 2. Detectar click en Ramas (Distancia a segmento de línea)
    let minDistance = 15;
    let clickedBranchId: number | null = null;

    branches.forEach(branch => {
      const fromNode = nodes.find(n => n.id === branch.from);
      const toNode = nodes.find(n => n.id === branch.to);
      if (!fromNode || !toNode) return;

      // Distancia de (x,y) al segmento de línea de fromNode a toNode
      const A = x - fromNode.x;
      const B = y - fromNode.y;
      const C = toNode.x - fromNode.x;
      const D = toNode.y - fromNode.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;
      if (param < 0) {
        xx = fromNode.x;
        yy = fromNode.y;
      } else if (param > 1) {
        xx = toNode.x;
        yy = toNode.y;
      } else {
        xx = fromNode.x + param * C;
        yy = fromNode.y + param * D;
      }

      const dx = x - xx;
      const dy = y - yy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDistance) {
        minDistance = dist;
        clickedBranchId = branch.id;
      }
    });

    if (clickedBranchId !== null) {
      setSelectedBranch(clickedBranchId);
      setSelectedNode(null);
    } else {
      setSelectedNode(null);
      setSelectedBranch(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNode === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Scale client mouse coordinates to match internal canvas resolution
    const x = Math.max(20, Math.min(canvas.width - 20, (e.clientX - rect.left) * (canvas.width / rect.width)));
    const y = Math.max(20, Math.min(canvas.height - 20, (e.clientY - rect.top) * (canvas.height / rect.height)));

    setNodes(prev => prev.map(n => n.id === draggedNode ? { ...n, x, y } : n));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  // Modificar propiedades de Nodos
  const makeNodeJunction = (id: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, isFixed: false, voltage: 6.0 } : n));
    setIteration(0);
    setError(0);
    setHistory([]);
  };

  const makeNodeFixed = (id: number, val: number, name: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, isFixed: true, voltage: val, name } : n));
    setIteration(0);
    setError(0);
    setHistory([]);
  };

  const setNodeVoltage = (id: number, val: number) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, voltage: val } : n));
    setIteration(0);
    setError(0);
    setHistory([]);
  };

  return (
    <Card title="Simulador de Circuitos Lineales Pro — (Modela y resuelve Kirchhoff)">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* Panel Superior de Control de Solver */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: 'var(--ifm-background-surface-color)', borderRadius: 10,
          border: '1px solid var(--ifm-toc-border-color)'
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setMethod('gauss'); setIsPlaying(false); }}
              style={{
                padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none',
                background: method === 'gauss' ? 'var(--ifm-color-primary)' : 'rgba(0,0,0,0.05)',
                color: method === 'gauss' ? '#fff' : 'var(--ifm-font-color-base)', fontWeight: 600
              }}
            >
              📐 Gauss-Jordan (Directo)
            </button>
            <button
              onClick={() => { setMethod('gauss-seidel'); }}
              style={{
                padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none',
                background: method === 'gauss-seidel' ? 'var(--ifm-color-primary)' : 'rgba(0,0,0,0.05)',
                color: method === 'gauss-seidel' ? '#fff' : 'var(--ifm-font-color-base)', fontWeight: 600
              }}
            >
              ⚡ Gauss-Seidel
            </button>
            <button
              onClick={() => { setMethod('jacobi'); }}
              style={{
                padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none',
                background: method === 'jacobi' ? 'var(--ifm-color-primary)' : 'rgba(0,0,0,0.05)',
                color: method === 'jacobi' ? '#fff' : 'var(--ifm-font-color-base)', fontWeight: 600
              }}
            >
              🔄 Jacobi
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {method !== 'gauss' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={{ fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--ifm-color-secondary-contrast-foreground)' }}>
                  Tolerancia (Error)
                </label>
                <select
                  value={tolerance}
                  onChange={e => {
                    setTolerance(parseFloat(e.target.value));
                    setIteration(0);
                    setError(0);
                    setHistory([]);
                  }}
                  style={{
                    padding: '4px 8px', borderRadius: 6, fontSize: 11, border: '1px solid var(--ifm-toc-border-color)',
                    background: 'var(--ifm-background-surface-color)', color: 'var(--ifm-font-color-base)', cursor: 'pointer', fontWeight: 600
                  }}
                >
                  <option value="1e-2">0.01 (1e-2)</option>
                  <option value="1e-3">0.001 (1e-3)</option>
                  <option value="1e-4">0.0001 (1e-4)</option>
                  <option value="1e-5">0.00001 (1e-5)</option>
                  <option value="1e-6">0.000001 (1e-6)</option>
                </select>
              </div>
            )}

            <button
              onClick={() => {
                if (!isPlaying) {
                  // Si ya se llegó al error objetivo en una ejecución previa, reiniciar al simular
                  if (iteration > 0 && error < tolerance) {
                    setNodes(prev => prev.map(node => {
                      if (node.isFixed) return node;
                      return { ...node, voltage: 6.0 };
                    }));
                    setIteration(0);
                    setError(0);
                    setHistory([]);
                  }
                }
                setIsPlaying(!isPlaying);
              }}
              style={{
                padding: '6px 16px', borderRadius: 6, cursor: 'pointer', border: 'none',
                background: isPlaying ? '#ef4444' : '#10b981', color: '#fff', fontWeight: 650
              }}
            >
              {isPlaying ? '⏸️ Pausar' : '▶️ Simular'}
            </button>
          </div>
        </div>

        {/* Zona Principal de Trabajo */}
        <div className="sim-workspace-grid">
          {/* Lienzo Canvas interactivo */}
          <div>
            <canvas
              ref={canvasRef}
              width={700}
              height={330}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                width: '100%', height: 'auto', border: '1px solid var(--ifm-toc-border-color)',
                borderRadius: 12, display: 'block', cursor: draggedNode !== null ? 'grabbing' : 'grab'
              }}
            />
            <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Dot color="#ef4444" label="Fuente Tensión (V)" />
              <Dot color="#3b82f6" label="Referencia Tierra (0V)" />
              <span style={{ fontSize: 11, color: 'var(--ifm-color-secondary-contrast-foreground)' }}>
                💡 Haz clic en nodos/ramas para editarlos. Arrastra nodos para diagramar en vivo.
              </span>
            </div>
          </div>

          {/* Panel Lateral: Editor de Componentes y Sistema Algebraico */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: 11, color: 'var(--ifm-color-primary)', letterSpacing: '0.08em' }}>
              Dashboard del Circuito
            </h4>

            {/* Editor de Nodo Seleccionado */}
            {selectedNode !== null && (
              <div style={{
                background: 'var(--ifm-background-surface-color)', padding: 14, borderRadius: 10,
                border: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981' }}>
                  📍 Nodo Seleccionado: {nodes.find(n => n.id === selectedNode)?.name}
                </span>

                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button
                    onClick={() => makeNodeJunction(selectedNode)}
                    style={{
                      flex: 1, padding: '4px 6px', fontSize: 10, borderRadius: 4, cursor: 'pointer', border: 'none',
                      background: !nodes.find(n => n.id === selectedNode)?.isFixed ? 'var(--ifm-color-primary)' : 'rgba(0,0,0,0.05)',
                      color: !nodes.find(n => n.id === selectedNode)?.isFixed ? '#fff' : 'var(--ifm-font-color-base)'
                    }}
                  >
                    Unión (KCL)
                  </button>
                  <button
                    onClick={() => makeNodeFixed(selectedNode, 12, 'Fuente (+) 12V')}
                    style={{
                      flex: 1, padding: '4px 6px', fontSize: 10, borderRadius: 4, cursor: 'pointer', border: 'none',
                      background: nodes.find(n => n.id === selectedNode)?.isFixed && nodes.find(n => n.id === selectedNode)?.voltage !== 0 ? '#ef4444' : 'rgba(0,0,0,0.05)',
                      color: nodes.find(n => n.id === selectedNode)?.isFixed && nodes.find(n => n.id === selectedNode)?.voltage !== 0 ? '#fff' : 'var(--ifm-font-color-base)'
                    }}
                  >
                    Fuente V
                  </button>
                  <button
                    onClick={() => makeNodeFixed(selectedNode, 0, 'Tierra (GND)')}
                    style={{
                      flex: 1, padding: '4px 6px', fontSize: 10, borderRadius: 4, cursor: 'pointer', border: 'none',
                      background: nodes.find(n => n.id === selectedNode)?.isFixed && nodes.find(n => n.id === selectedNode)?.voltage === 0 ? '#3b82f6' : 'rgba(0,0,0,0.05)',
                      color: nodes.find(n => n.id === selectedNode)?.isFixed && nodes.find(n => n.id === selectedNode)?.voltage === 0 ? '#fff' : 'var(--ifm-font-color-base)'
                    }}
                  >
                    Tierra
                  </button>
                </div>

                {nodes.find(n => n.id === selectedNode)?.isFixed && nodes.find(n => n.id === selectedNode)?.voltage !== 0 && (
                  <div style={{ marginTop: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                      Voltaje de Fuente: {nodes.find(n => n.id === selectedNode)?.voltage.toFixed(1)} V
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="24"
                      step="0.5"
                      value={nodes.find(n => n.id === selectedNode)?.voltage || 12}
                      onChange={e => setNodeVoltage(selectedNode, parseFloat(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Editor de Rama Seleccionada */}
            {selectedBranch !== null && (
              <div style={{
                background: 'var(--ifm-background-surface-color)', padding: 14, borderRadius: 10,
                border: '1px solid #10b981', display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981' }}>
                  🔌 Rama Seleccionada: #{selectedBranch} ({branches.find(b => b.id === selectedBranch)?.type === 'resistor' ? 'Resistor' : 'Fuente de Corriente'})
                </span>

                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button
                    onClick={() => setBranches(prev => prev.map(b => b.id === selectedBranch ? { ...b, type: 'resistor', resistance: 2.0, currentValue: 0 } : b))}
                    style={{
                      flex: 1, padding: '4px 6px', fontSize: 10, borderRadius: 4, cursor: 'pointer', border: 'none',
                      background: branches.find(b => b.id === selectedBranch)?.type === 'resistor' ? 'var(--ifm-color-primary)' : 'rgba(0,0,0,0.05)',
                      color: branches.find(b => b.id === selectedBranch)?.type === 'resistor' ? '#fff' : 'var(--ifm-font-color-base)'
                    }}
                  >
                    Resistor
                  </button>
                  <button
                    onClick={() => setBranches(prev => prev.map(b => b.id === selectedBranch ? { ...b, type: 'currentSource', resistance: 0, currentValue: 1.0 } : b))}
                    style={{
                      flex: 1, padding: '4px 6px', fontSize: 10, borderRadius: 4, cursor: 'pointer', border: 'none',
                      background: branches.find(b => b.id === selectedBranch)?.type === 'currentSource' ? 'var(--ifm-color-primary)' : 'rgba(0,0,0,0.05)',
                      color: branches.find(b => b.id === selectedBranch)?.type === 'currentSource' ? '#fff' : 'var(--ifm-font-color-base)'
                    }}
                  >
                    Fuente de Corriente
                  </button>
                </div>

                {branches.find(b => b.id === selectedBranch)?.type === 'resistor' ? (
                  <div style={{ marginTop: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 2 }}>
                      Resistencia (R): {branches.find(b => b.id === selectedBranch)?.resistance.toFixed(2)} Ω
                    </label>
                    <label style={{ fontSize: 9, color: 'var(--ifm-color-secondary-contrast-foreground)', display: 'block', marginBottom: 6 }}>
                      Conductancia (G = 1/R): {(1.0 / (branches.find(b => b.id === selectedBranch)?.resistance || 1)).toFixed(3)} S
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="20.0"
                      step="0.5"
                      value={branches.find(b => b.id === selectedBranch)?.resistance || 2.0}
                      onChange={e => setBranches(prev => prev.map(b => b.id === selectedBranch ? { ...b, resistance: parseFloat(e.target.value) } : b))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                ) : (
                  <div style={{ marginTop: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                      Corriente Impuesta (Is): {branches.find(b => b.id === selectedBranch)?.currentValue.toFixed(2)} A
                    </label>
                    <input
                      type="range"
                      min="-5.0"
                      max="5.0"
                      step="0.25"
                      value={branches.find(b => b.id === selectedBranch)?.currentValue || 1.0}
                      onChange={e => setBranches(prev => prev.map(b => b.id === selectedBranch ? { ...b, currentValue: parseFloat(e.target.value) } : b))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                )}
              </div>
            )}

            {!selectedNode && !selectedBranch && (
              <div style={{
                background: 'var(--ifm-background-surface-color)', padding: 12, borderRadius: 10,
                border: '1px dotted var(--ifm-toc-border-color)', textAlign: 'center', fontSize: 11,
                color: 'var(--ifm-color-secondary-contrast-foreground)'
              }}>
                💡 Haz clic en cualquier nodo o rama del canvas para calibrar sus valores físicos en tiempo real.
              </div>
            )}

            {/* Sistema Algebraico a un lado */}
            {matrixState.matrixA.length > 0 && (
              <div style={{
                padding: 12, background: 'var(--ifm-background-surface-color)',
                border: '1px solid var(--ifm-toc-border-color)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 6
              }}>
                <span style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--ifm-color-primary)', letterSpacing: '0.08em' }}>
                  📊 Sistema Algebraico (A · V = B)
                </span>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 10 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                        <th style={{ padding: '4px 6px', textAlign: 'left', color: 'var(--ifm-color-primary)' }}>Eq</th>
                        {matrixState.varNodeIds.map(id => {
                          const node = nodes.find(n => n.id === id);
                          return (
                            <th key={id} style={{ padding: '4px 6px', textAlign: 'right' }}>
                              {node ? node.name.replace('Junta ', 'V_') : `V_${id}`}
                            </th>
                          );
                        })}
                        <th style={{ padding: '4px 6px', textAlign: 'center' }}>=</th>
                        <th style={{ padding: '4px 6px', textAlign: 'right', color: '#10b981' }}>B</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrixState.matrixA.map((row, r) => {
                        const rowNode = nodes.find(n => n.id === matrixState.varNodeIds[r]);
                        return (
                          <tr key={r} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
                            <td style={{ padding: '4px 6px', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
                              {rowNode ? rowNode.name.replace('Junta ', '') : r}
                            </td>
                            {row.map((val, c) => (
                              <td key={c} style={{ padding: '4px 6px', textAlign: 'right', fontWeight: r === c ? 'bold' : 'normal', color: val !== 0 ? 'var(--ifm-font-color-base)' : 'rgba(0,0,0,0.2)' }}>
                                {val === 0 ? '0.00' : val.toFixed(2)}
                              </td>
                            ))}
                            <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 'bold' }}>=</td>
                            <td style={{ padding: '4px 6px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>
                              {matrixState.vectorB[r].toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Métricas de Ejecución */}
        <MetricsGrid>
          <MetricCard label="Iteraciones Realizadas" value={iteration.toString()} color="var(--ifm-color-primary)" />
          <MetricCard label="Método Numérico Activo" value={method === 'gauss' ? 'Eliminación Directa' : method === 'gauss-seidel' ? 'Gauss-Seidel (Iterativo)' : 'Jacobi (Iterativo)'} color="#3b82f6" />
          <MetricCard label="Error Residual Máx (ΔV)" value={method === 'gauss' ? 'Convergencia Exacta' : error === 0 ? '0.000' : error.toFixed(5)} color={error < 1e-4 ? '#10b981' : '#f59e0b'} />
        </MetricsGrid>

        {/* Tabla de Historial de Iteraciones (abajo) */}
        {method !== 'gauss' && history.length > 0 && (
          <div style={{
            padding: 16, background: 'var(--ifm-background-surface-color)',
            border: '1px solid var(--ifm-toc-border-color)', borderRadius: 12, marginTop: 10
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 13, textTransform: 'uppercase', color: 'var(--ifm-color-primary)', letterSpacing: '0.08em' }}>
              📈 Historial de Convergencia por Iteración (Tabla Numérica)
            </h4>
            <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--ifm-toc-border-color)', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 11 }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--ifm-background-surface-color)', zIndex: 1, borderBottom: '2px solid var(--ifm-toc-border-color)' }}>
                  <tr style={{ background: 'var(--ifm-background-surface-color)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Iteración (k)</th>
                    {matrixState.varNodeIds.map(id => {
                      const node = nodes.find(n => n.id === id);
                      return (
                        <th key={id} style={{ padding: '8px 12px', textAlign: 'right' }}>
                          {node ? node.name.replace('Junta ', 'V_') : `V_${id}`}
                        </th>
                      );
                    })}
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: '#f59e0b' }}>Error Residual (ΔV)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--ifm-toc-border-color)', background: idx % 2 === 0 ? 'rgba(0,0,0,0.01)' : 'transparent' }}>
                      <td style={{ padding: '6px 12px', fontWeight: 'bold' }}>{row.iter}</td>
                      {matrixState.varNodeIds.map(id => (
                        <td key={id} style={{ padding: '6px 12px', textAlign: 'right' }}>
                          {row.voltages[id] !== undefined ? row.voltages[id].toFixed(5) : '0.00000'}V
                        </td>
                      ))}
                      <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 'bold', color: row.error < 1e-4 ? '#10b981' : '#f59e0b' }}>
                        {row.error === 0 ? '0.00000' : row.error.toFixed(6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Desglose Didáctico de Métodos Numéricos ── */}
        <div style={{
          marginTop: 5, padding: 18, background: 'var(--ifm-background-surface-color)',
          border: '1px solid var(--ifm-toc-border-color)', borderRadius: 12
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: 13, textTransform: 'uppercase', color: 'var(--ifm-color-primary)', letterSpacing: '0.08em' }}>
            🧠 Leyes de Kirchhoff y Métodos Numéricos Aplicados
          </h4>
          <p style={{ fontSize: 12, margin: '0 0 12px 0', lineHeight: 1.6 }}>
            La **Ley de Corrientes de Kirchhoff (KCL)** establece que la suma algebraica de todas las corrientes que ingresan o salen de un nodo eléctrico es igual a cero. Para cada unión o junta desconocida <Latex>{"i"}</Latex>, planteamos la suma de conductancias <Latex>{"G = 1/R"}</Latex>:
          </p>
          <div style={{ margin: '12px 0', textAlign: 'center' }}>
            <Latex displayMode={true}>
              {"\\sum I_{\\text{saliente}} = 0 \\implies \\sum_{j} G_{ij}(V_i - V_j) = \\sum I_{\\text{impuesta}}"}
            </Latex>
          </div>
          <p style={{ fontSize: 12, margin: '0 0 12px 0', lineHeight: 1.6 }}>
            Esto produce un sistema algebraico de ecuaciones lineales acopladas de la forma:
          </p>
          <div style={{ margin: '12px 0', textAlign: 'center' }}>
            <Latex displayMode={true}>
              {"A \\cdot V = B"}
            </Latex>
          </div>
          <p style={{ fontSize: 12, margin: '0 0 12px 0', lineHeight: 1.6 }}>
            Donde la matriz de conductancias <Latex>{"A"}</Latex> posee **dominancia diagonal estricta** o débil (<Latex>{"|A_{ii}| \\ge \\sum_{j \\neq i} |A_{ij}|"}</Latex>), lo que asegura que los métodos numéricos iterativos converjan de forma única hacia la solución física real:
            <br /><br />
            - <strong>Método Directo (Gauss-Jordan)</strong>: Reduce la matriz aumentada <Latex>{"[A|B]"}</Latex> a forma escalonada reducida en un número finito de pasos exactos con un costo de complejidad computacional de <Latex>{"O(n^3)"}</Latex>.
            <br />
            - <strong>Métodos Iterativos (Jacobi y Gauss-Seidel)</strong>: Resuelven para cada incógnita de manera progresiva. La fórmula iterativa de actualización de voltajes de <strong>Gauss-Seidel</strong> es:
          </p>
          <div style={{ margin: '12px 0', textAlign: 'center' }}>
            <Latex displayMode={true}>
              {"V_i^{(k+1)} = \\frac{1}{A_{ii}} \\left( B_i - \\sum_{j < i} A_{ij} V_j^{(k+1)} - \\sum_{j > i} A_{ij} V_j^{(k)} \\right)"}
            </Latex>
          </div>
          <p style={{ fontSize: 12, margin: '0 0 12px 0', lineHeight: 1.6 }}>
            En la simulación, notarás cómo **Gauss-Seidel** aprovecha los nuevos voltajes <Latex>{"V_j^{(k+1)}"}</Latex> tan pronto como son calculados en el ciclo de barrido actual, convergiendo casi dos veces más rápido que el método de **Jacobi** (que usa los valores del ciclo anterior).
          </p>

          <span style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 6 }}>
            Código TypeScript del Solucionador Numérico (Circuit Nodal Solver):
          </span>
          <pre style={{
            margin: 0, padding: 12, borderRadius: 8, background: '#1e293b', color: '#f8fafc',
            fontSize: 11, fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.4
          }}>
{`// Fragmento real de src/services/numericalSolvers.ts
export function solveCircuit(nodes, branches, method) {
  // 1. Construir la matriz de conductancias A y el vector B
  const matrixA = ...; // Coeficientes G_ij de resistencias
  const vectorB = ...; // Fuentes de corriente y tensiones fijas multiplicadas por G

  if (method === 'gauss') {
    // Solucionador Directo Exacto por Reducción de Gauss-Jordan
    return solveGaussJordan(matrixA, vectorB);
  } else {
    // Iteración unitaria de Gauss-Seidel o Jacobi
    const newVal = (vectorB[r] - sumOffDiag) / matrixA[r][r];
    // Jacobi: actualiza en el próximo ciclo.
    // Gauss-Seidel: actualiza V de inmediato en la iteración corriente.
  }
}`}
          </pre>
        </div>
      </div>
    </Card>
  );
}
