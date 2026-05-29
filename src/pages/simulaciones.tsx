import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CircuitSim from '../components/simulations/CircuitSim';
import PageRankSim from '../components/simulations/PageRankSim';
import PendulumSim from '../components/simulations/PendulumSim';


export default function SimulacionesPage() {
  const [activeTab, setActiveTab] = useState<'circuit' | 'pagerank' | 'pendulum'>('circuit');

  return (
    <Layout
      title="Simulaciones Avanzadas"
      description="Consola de simulaciones numéricas avanzadas: Circuitos Eléctricos, Google PageRank y Péndulo RK4."
    >
      <main style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header Block */}
        <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)',
            width: 250, height: 250, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            zIndex: -1, pointerEvents: 'none'
          }} />
          <span style={{
            background: 'rgba(99,102,241,0.1)', color: '#6366f1',
            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 750,
            textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block', marginBottom: 12
          }}>
            Consola Avanzada
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Simulaciones <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Especiales</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--ifm-color-secondary-contrast-foreground)', maxWidth: 650, margin: '0 auto', lineHeight: 1.6 }}>
            Experimenta con modelos prácticos de ingeniería física y computacional en tiempo real a 60 FPS, aplicando integradores de EDOs y sistemas lineales algebraicos.
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 35,
          background: 'var(--ifm-background-surface-color)', padding: 8, borderRadius: 12,
          border: '1px solid var(--ifm-toc-border-color)', maxWidth: 650, margin: '0 auto 35px'
        }}>
          <button
            onClick={() => setActiveTab('circuit')}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: 'none',
              fontWeight: 700, fontSize: 12, transition: 'all 0.2s',
              background: activeTab === 'circuit' ? '#6366f1' : 'transparent',
              color: activeTab === 'circuit' ? '#fff' : 'var(--ifm-font-color-base)'
            }}
          >
            ⚡ Circuitos Eléctricos
          </button>
          <button
            onClick={() => setActiveTab('pagerank')}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: 'none',
              fontWeight: 700, fontSize: 12, transition: 'all 0.2s',
              background: activeTab === 'pagerank' ? '#6366f1' : 'transparent',
              color: activeTab === 'pagerank' ? '#fff' : 'var(--ifm-font-color-base)'
            }}
          >
            🕸️ PageRank de Google
          </button>
          <button
            onClick={() => setActiveTab('pendulum')}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: 'none',
              fontWeight: 700, fontSize: 12, transition: 'all 0.2s',
              background: activeTab === 'pendulum' ? '#6366f1' : 'transparent',
              color: activeTab === 'pendulum' ? '#fff' : 'var(--ifm-font-color-base)'
            }}
          >
            ⏱️ Péndulo Físico
          </button>
        </div>

        {/* Dynamic Simulator render */}
        <div style={{ transition: 'opacity 0.2s ease-in-out' }}>
          {activeTab === 'circuit' && (
            <div>
              <div style={{ marginBottom: 20, padding: 16, background: 'rgba(99,102,241,0.04)', borderRadius: 10, borderLeft: '4px solid #6366f1' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>Simulación de Circuitos Eléctricos Lineales</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--ifm-color-secondary-contrast-foreground)', lineHeight: 1.5 }}>
                  Resuelve las tensiones nodales aplicando las leyes de Kirchhoff para circuitos resistivos con fuentes de tensión y corriente. El sistema resultante A·V = B se resuelve iterativamente usando **Gauss-Seidel**, **Jacobi** o de forma exacta con **Eliminación Gaussiana**.
                </p>
              </div>
              <CircuitSim />
            </div>
          )}
          {activeTab === 'pagerank' && (
            <div>
              <div style={{ marginBottom: 20, padding: 16, background: 'rgba(168,85,247,0.04)', borderRadius: 10, borderLeft: '4px solid #a855f7' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>Simulador del Algoritmo PageRank</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--ifm-color-secondary-contrast-foreground)', lineHeight: 1.5 }}>
                  Construye tu propio grafo de Internet interactivo agregando páginas y trazando hipervínculos. Observa cómo el método de potencia iterativo (Jacobi) converge hacia el vector de distribución de relevancia, redimensionando físicamente cada nodo.
                </p>
              </div>
              <PageRankSim />
            </div>
          )}
          {activeTab === 'pendulum' && (
            <div>
              <div style={{ marginBottom: 20, padding: 16, background: 'rgba(16,185,129,0.04)', borderRadius: 10, borderLeft: '4px solid #10b981' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>Comparativa de Integradores Físicos en EDOs</h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--ifm-color-secondary-contrast-foreground)', lineHeight: 1.5 }}>
                  Resuelve la ecuación diferencial ordinaria del péndulo simple con rozamiento. Compara en vivo la estabilidad de los métodos de **Euler Explícito**, **Euler Simpléctico** y **Runge-Kutta 4 (RK4)** monitoreando las fluctuaciones de energía.
                </p>
              </div>
              <PendulumSim />
            </div>
          )}
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/" style={{ fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6366f1', textDecoration: 'none' }}>
            ➔ Regresar a la Página de Inicio
          </Link>
        </div>
      </main>
    </Layout>
  );
}
