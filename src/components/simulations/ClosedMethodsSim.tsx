import React, { useState } from 'react';
import BisectionSim from './BisectionSim';
import FalsePositionSim from './FalsePositionSim';
import { tabBtnStyle } from './shared';

interface ClosedMethodsSimProps {
  defaultMethod?: 'biseccion' | 'falsa-posicion';
  defaultExpr?: string;
  defaultXa?: string;
  defaultXb?: string;
  defaultEs?: string;
  defaultImax?: string;
}

export default function ClosedMethodsSim({
  defaultMethod = 'biseccion',
  defaultExpr,
  defaultXa,
  defaultXb,
  defaultEs,
  defaultImax,
}: ClosedMethodsSimProps) {
  const [method, setMethod] = useState<'biseccion' | 'falsa-posicion'>(defaultMethod);

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)' }}>
      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          padding: 4,
          background: 'var(--ifm-background-color)',
          borderRadius: 10,
          width: 'fit-content',
          border: '1px solid var(--ifm-toc-border-color)',
          marginBottom: 16,
        }}
      >
        <button
          style={tabBtnStyle(method === 'biseccion')}
          onClick={() => setMethod('biseccion')}
        >
          Método de Bisección
        </button>
        <button
          style={tabBtnStyle(method === 'falsa-posicion')}
          onClick={() => setMethod('falsa-posicion')}
        >
          Falsa Posición
        </button>
      </div>

      {/* Render selected simulation */}
      {method === 'biseccion' ? (
        <BisectionSim
          defaultExpr={defaultExpr}
          defaultXa={defaultXa}
          defaultXb={defaultXb}
          defaultEs={defaultEs}
          defaultImax={defaultImax}
        />
      ) : (
        <FalsePositionSim
          defaultExpr={defaultExpr}
          defaultXa={defaultXa}
          defaultXb={defaultXb}
          defaultEs={defaultEs}
          defaultImax={defaultImax}
        />
      )}
    </div>
  );
}
