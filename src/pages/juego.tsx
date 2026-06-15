import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import GameSim from '../components/simulations/GameSim';

export default function JuegoPage() {
  return (
    <Layout
      title="Videojuego de Prueba"
      description="Videojuego físico simple (tipo Angry Birds) con movimiento parabólico y resistencia lineal."
    >
      <main style={{ padding: '30px 20px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
              🎮 Videojuego de <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Prueba</span>
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--ifm-color-secondary-contrast-foreground)' }}>
              Movimiento parabólico con resistencia lineal del aire ($F = -b \cdot v$)
            </p>
          </div>
          <Link
            to="/"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--ifm-toc-border-color)',
              background: 'var(--ifm-background-surface-color)',
              color: 'var(--ifm-font-color-base)',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            ← Volver al Inicio
          </Link>
        </div>

        <GameSim />
      </main>
    </Layout>
  );
}
