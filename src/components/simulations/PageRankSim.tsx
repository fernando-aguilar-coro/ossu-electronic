import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { MetricCard, MetricsGrid } from './ui';
import { solvePageRank } from '../../services/numericalSolvers';
import { Latex } from './Latex';

interface WebPage {
  id: number;
  name: string;
  x: number;
  y: number;
  rank: number;
}

interface Link {
  from: number;
  to: number;
}

export default function PageRankSim() {
  const [nodes, setNodes] = useState<WebPage[]>([
    { id: 0, name: 'A', x: 150, y: 80, rank: 0.25 },
    { id: 1, name: 'B', x: 450, y: 80, rank: 0.25 },
    { id: 2, name: 'C', x: 200, y: 240, rank: 0.25 },
    { id: 3, name: 'D', x: 400, y: 240, rank: 0.25 },
  ]);

  const [links, setLinks] = useState<Link[]>([
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 0 },
    { from: 2, to: 1 },
    { from: 1, to: 3 },
    { from: 3, to: 2 },
  ]);

  const [mode, setMode] = useState<'add-node' | 'add-link' | 'delete' | 'select'>('select');
  const [linkStart, setLinkStart] = useState<number | null>(null);
  const [damping, setDamping] = useState<number>(0.85);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [iteration, setIteration] = useState<number>(0);
  const [error, setError] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodeCounter = useRef<number>(4);
  const animationRef = useRef<number>(0);
  const particlesOffset = useRef<number>(0);

  // Dragging state
  const [draggedNode, setDraggedNode] = useState<number | null>(null);

  // Perform single PageRank iteration calling the Service solver!
  const stepPageRank = () => {
    const { nextRanks, maxDiff } = solvePageRank(nodes, links, damping);

    if (nextRanks.length === 0) return;

    setNodes(prev => prev.map((node, i) => ({ ...node, rank: nextRanks[i] })));
    setIteration(prev => prev + 1);
    setError(maxDiff);
  };

  // Autoplay loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        stepPageRank();
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isPlaying, nodes, links, damping]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Scale client mouse coordinates to match internal canvas resolution
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Detect click on existing node
    const clickedNodeIdx = nodes.findIndex(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      const radius = 15 + n.rank * 60;
      return Math.sqrt(dx * dx + dy * dy) < Math.max(radius, 22);
    });

    if (clickedNodeIdx !== -1) {
      const clickedNodeId = nodes[clickedNodeIdx].id;
      if (mode === 'select') {
        setDraggedNode(clickedNodeId);
      } else if (mode === 'add-link') {
        if (linkStart === null) {
          setLinkStart(clickedNodeId);
        } else {
          if (linkStart !== clickedNodeId) {
            // Avoid duplicate link
            const exists = links.some(l => l.from === linkStart && l.to === clickedNodeId);
            if (!exists) {
              setLinks(prev => [...prev, { from: linkStart, to: clickedNodeId }]);
              setIteration(0);
              setError(0);
            }
          }
          setLinkStart(null);
        }
      } else if (mode === 'delete') {
        setNodes(prev => prev.filter(n => n.id !== clickedNodeId).map(n => ({ ...n, rank: 1 / (prev.length - 1) })));
        setLinks(prev => prev.filter(l => l.from !== clickedNodeId && l.to !== clickedNodeId));
        setIteration(0);
        setError(0);
      }
    } else {
      if (mode === 'add-node') {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const newName = alphabet[nodeCounter.current % alphabet.length] + (nodeCounter.current >= alphabet.length ? Math.floor(nodeCounter.current / alphabet.length) : '');
        const newNode: WebPage = {
          id: nodeCounter.current,
          name: newName,
          x,
          y,
          rank: 1 / (nodes.length + 1),
        };
        nodeCounter.current++;
        setNodes(prev => [...prev.map(n => ({ ...n, rank: 1 / (prev.length + 1) })), newNode]);
        setIteration(0);
        setError(0);
      }
      setLinkStart(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedNode === null || mode !== 'select') return;
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

  // Reset ranks equally
  const handleReset = () => {
    const N = nodes.length;
    setNodes(prev => prev.map(n => ({ ...n, rank: 1 / N })));
    setIteration(0);
    setError(0);
  };

  // Clear entire board
  const handleClear = () => {
    setNodes([]);
    setLinks([]);
    setIteration(0);
    setError(0);
    nodeCounter.current = 0;
  };

  // Render Loop: Graph & Flying Flow Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#0f172a' : '#f8fafc';
    const nodeColor = isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.12)';
    const nodeBorderColor = '#6366f1';
    const textColor = isDark ? '#cbd5e1' : '#334155';
    const linkColor = isDark ? 'rgba(148, 163, 184, 0.55)' : 'rgba(100, 116, 139, 0.45)';

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesOffset.current += 1.2;

      // Draw engineering grid lines
      ctx.strokeStyle = isDark ? 'rgba(99,102,241,0.04)' : 'rgba(0,0,0,0.02)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // 1. Draw Links & Flying Particles
      links.forEach(link => {
        const fromNode = nodes.find(n => n.id === link.from);
        const toNode = nodes.find(n => n.id === link.to);
        if (!fromNode || !toNode) return;

        const fromRadius = 15 + fromNode.rank * 60;
        const toRadius = 15 + toNode.rank * 60;

        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40) return;

        const startX = fromNode.x + (dx / dist) * fromRadius;
        const startY = fromNode.y + (dy / dist) * fromRadius;
        const endX = toNode.x - (dx / dist) * (toRadius + 5);
        const endY = toNode.y - (dy / dist) * (toRadius + 5);

        // Draw solid link
        ctx.strokeStyle = linkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrow head
        const angle = Math.atan2(dy, dx);
        ctx.fillStyle = linkColor;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 8 * Math.cos(angle - Math.PI / 6), endY - 8 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - 8 * Math.cos(angle + Math.PI / 6), endY - 8 * Math.sin(angle + Math.PI / 6));
        ctx.fill();

        // Draw beautiful floating/flying colored dots representing PageRank distribution flow!
        if (fromNode.rank > 0.01) {
          const numParticles = 3;
          for (let p = 0; p < numParticles; p++) {
            const fraction = ((particlesOffset.current / 150 + p / numParticles) % 1.0);
            const px = startX + dx * (1 - fromRadius / dist - toRadius / dist) * fraction;
            const py = startY + dy * (1 - fromRadius / dist - toRadius / dist) * fraction;

            ctx.shadowColor = '#6366f1';
            ctx.shadowBlur = 4;
            ctx.fillStyle = '#6366f1';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      // Highlight link start selection
      if (linkStart !== null) {
        const node = nodes.find(n => n.id === linkStart);
        if (node) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(node.x, node.y, 25 + node.rank * 60, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 2. Draw Nodes (circles dynamically size matching PageRank rank)
      nodes.forEach(node => {
        const radius = 15 + node.rank * 60;

        // Shadow glow
        ctx.shadowColor = nodeBorderColor;
        ctx.shadowBlur = 10;

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = nodeBorderColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + 4);

        ctx.font = 'bold 9px monospace';
        ctx.fillText(`${(node.rank * 100).toFixed(1)}%`, node.x, node.y + radius + 13);
      });
    };

    const loop = () => {
      render();
      animationRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(animationRef.current);
  }, [nodes, links, linkStart, mode]);

  return (
    <Card title="Simulador PageRank Pro — (Arrastra Nodos y Diseña Grafos)">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* Toolbox & controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--ifm-background-surface-color)', borderRadius: 10, border: '1px solid var(--ifm-toc-border-color)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { setMode('select'); setLinkStart(null); }} style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none', background: mode === 'select' ? 'var(--ifm-color-primary)' : 'rgba(0,0,0,0.05)', color: mode === 'select' ? '#fff' : 'var(--ifm-font-color-base)', fontWeight: 600 }}>
              🖱️ Seleccionar / Mover
            </button>
            <button onClick={() => { setMode('add-node'); setLinkStart(null); }} style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none', background: mode === 'add-node' ? 'var(--ifm-color-primary)' : 'rgba(0,0,0,0.05)', color: mode === 'add-node' ? '#fff' : 'var(--ifm-font-color-base)', fontWeight: 600 }}>
              ➕ Página Web
            </button>
            <button onClick={() => { setMode('add-link'); setLinkStart(null); }} style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none', background: mode === 'add-link' ? 'var(--ifm-color-primary)' : 'rgba(0,0,0,0.05)', color: mode === 'add-link' ? '#fff' : 'var(--ifm-font-color-base)', fontWeight: 600 }}>
              🔗 Crear Enlace
            </button>
            <button onClick={() => { setMode('delete'); setLinkStart(null); }} style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none', background: mode === 'delete' ? '#ef4444' : 'rgba(0,0,0,0.05)', color: mode === 'delete' ? '#fff' : 'var(--ifm-font-color-base)', fontWeight: 600 }}>
              ❌ Eliminar
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '6px 16px', borderRadius: 6, cursor: 'pointer', border: 'none', background: isPlaying ? '#ef4444' : '#10b981', color: '#fff', fontWeight: 650 }}>
              {isPlaying ? '⏸️ Pausar' : '▶️ Iterar Auto'}
            </button>
            <button onClick={stepPageRank} disabled={isPlaying} style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 600 }}>
              ⏭️ Iterar Paso
            </button>
            <button onClick={handleReset} style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none', background: 'rgba(0,0,0,0.05)', color: 'var(--ifm-font-color-base)', fontWeight: 600 }}>
              🔁 Reset Ranks
            </button>
            <button onClick={handleClear} style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600 }}>
              🧹 Limpiar
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
          {/* Canvas editor */}
          <div>
            <canvas
              ref={canvasRef}
              width={650}
              height={340}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ width: '100%', height: 'auto', border: '1px solid var(--ifm-toc-border-color)', borderRadius: 12, display: 'block', cursor: mode === 'add-node' ? 'copy' : mode === 'add-link' ? 'crosshair' : mode === 'delete' ? 'no-drop' : draggedNode !== null ? 'grabbing' : 'grab' }}
            />
            <span style={{ display: 'block', textAlign: 'center', fontSize: 11, color: 'var(--ifm-color-secondary-contrast-foreground)', marginTop: 6 }}>
              {mode === 'add-node' && 'Haz clic en el lienzo para crear una nueva página.'}
              {mode === 'add-link' && 'Haz clic en la página origen y luego en la página destino para crear un enlace.'}
              {mode === 'delete' && 'Haz clic en cualquier página para eliminarla de la red.'}
              {mode === 'select' && '💡 Arrastra las páginas para reorganizar el grafo de forma cómoda.'}
            </span>
          </div>

          {/* Damping slider & Rank list & BAR CHART */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: 11, color: 'var(--ifm-color-primary)', letterSpacing: '0.08em' }}>Configuración y Ranking</h4>
            
            <div style={{ background: 'var(--ifm-background-surface-color)', padding: 12, borderRadius: 10, border: '1px solid var(--ifm-toc-border-color)' }}>
              <label style={{ fontSize: 11, fontWeight: 'bold' }}>Factor de Amortiguamiento (d): {damping.toFixed(2)}</label>
              <input type="range" min="0.0" max="1.0" step="0.05" value={damping} onChange={e => setDamping(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
            </div>

            {/* Dynamic visual Bar Chart for maximum wow-factor */}
            <div style={{ background: 'var(--ifm-background-surface-color)', padding: 14, borderRadius: 10, border: '1px solid var(--ifm-toc-border-color)', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 'bold', display: 'block' }}>Gráfico Dinámico de Importancia (PageRank):</span>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nodes.length === 0 && (
                  <span style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--ifm-color-secondary-contrast-foreground)' }}>No hay páginas en el grafo.</span>
                )}
                {nodes
                  .slice()
                  .sort((a, b) => b.rank - a.rank)
                  .map(node => {
                    const pct = (node.rank * 100).toFixed(1);
                    return (
                      <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 65, fontSize: 11, fontWeight: 'bold', fontFamily: 'monospace' }}>Pág. {node.name}:</span>
                        <div style={{ flex: 1, height: 16, background: 'rgba(99,102,241,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.max(3, node.rank * 100)}%`, height: '100%',
                            background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                            borderRadius: '4px 0 0 4px', transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }} />
                        </div>
                        <span style={{ width: 45, fontSize: 11, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{pct}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Live metrics */}
        <MetricsGrid>
          <MetricCard label="Iteraciones" value={iteration.toString()} color="var(--ifm-color-primary)" />
          <MetricCard label="Nodos Activos" value={nodes.length.toString()} color="#3b82f6" />
          <MetricCard label="Convergencia (ΔPR)" value={error === 0 ? '0.0000' : error.toFixed(6)} color={error < 1e-4 ? '#10b981' : '#f59e0b'} />
        </MetricsGrid>

        {/* ── Didactic Mathematics breakdown card ── */}
        <div style={{ marginTop: 15, padding: 18, background: 'var(--ifm-background-surface-color)', border: '1px solid var(--ifm-toc-border-color)', borderRadius: 12 }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: 13, textTransform: 'uppercase', color: 'var(--ifm-color-primary)', letterSpacing: '0.08em' }}>
            🧠 ¿Cómo se resuelve matemáticamente?
          </h4>
          <p style={{ fontSize: 12, margin: '0 0 12px 0', lineHeight: 1.6 }}>
            El algoritmo <strong>PageRank</strong> modela el comportamiento de un usuario navegando de forma aleatoria por la web ("Random Surfer Model"). El valor de importancia de cada nodo se calcula resolviendo la ecuación de autovector estacionario de la <strong>Matriz de Google (<Latex>G</Latex>)</strong>:
          </p>
          <div style={{ margin: '12px 0', textAlign: 'center' }}>
            <Latex displayMode={true}>
              {"PR(u) = \\frac{1 - d}{N} + d \\sum_{v \\in B_u} \\frac{PR(v)}{L(v)}"}
            </Latex>
          </div>
          <p style={{ fontSize: 12, margin: '0 0 12px 0', lineHeight: 1.6 }}>
            Donde:
          </p>
          <ul style={{ paddingLeft: '20px', margin: '8px 0', fontSize: 12, lineHeight: 1.6 }}>
            <li style={{ marginBottom: 4 }}><Latex>{"d"}</Latex> es el <strong>Factor de Amortiguamiento (Damping Factor)</strong>, que representa la probabilidad de que el usuario continúe haciendo clic en enlaces en lugar de saltar a una página aleatoria (típicamente establecido en <Latex>0.85</Latex>).</li>
            <li style={{ marginBottom: 4 }}><Latex>{"N"}</Latex> es la cantidad total de páginas web en la red.</li>
            <li style={{ marginBottom: 4 }}><Latex>{"B_u"}</Latex> es el conjunto de páginas de entrada (backlinks) que apuntan directamente hacia la página <Latex>{"u"}</Latex>.</li>
            <li style={{ marginBottom: 4 }}><Latex>{"L(v)"}</Latex> es el número de enlaces salientes (out-degree) de la página <Latex>{"v"}</Latex>.</li>
          </ul>
          <p style={{ fontSize: 12, margin: '12px 0 12px 0', lineHeight: 1.6 }}>
            Este sistema de ecuaciones lineales simultáneas se resuelve numéricamente aplicando el <strong>Método de las Potencias (Power Iteration)</strong> o el <strong>Método Iterativo de Jacobi</strong>, hasta que el error residual máximo <Latex>{"\\Delta PR"}</Latex> entre iteraciones consecutivas cae por debajo de la tolerancia permitida:
          </p>
          <div style={{ margin: '12px 0', textAlign: 'center' }}>
            <Latex displayMode={true}>
              {"\\max_{u} |PR^{(k+1)}(u) - PR^{(k)}(u)| < \\epsilon"}
            </Latex>
          </div>

          <span style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 6, color: 'var(--ifm-font-color-base)' }}>Código TypeScript del Solucionador Numérico:</span>
          <pre style={{ margin: 0, padding: 12, borderRadius: 8, background: '#1e293b', color: '#f8fafc', fontSize: 11, fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.4 }}>
{`// Fragmento de src/services/numericalSolvers.ts
export function solvePageRank(nodes, links, damping) {
  // 1. Distribuye los ranks actuales a los vecinos directos
  links.forEach(link => {
    nextRanks[destIdx] += fromNode.rank / outDegreesOfFromNode;
  });
  
  // 2. Aplica factor de amortiguamiento (Damping d)
  const baseRank = (1 - damping) / N;
  const finalRanks = nextRanks.map(r => baseRank + damping * r);
  return { nextRanks: finalRanks, maxDiff };
}`}
          </pre>
        </div>
      </div>
    </Card>
  );
}
