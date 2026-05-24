import React, { useState } from 'react';
import FixedPointSim from './FixedPointSim';
import NewtonRaphsonSim from './NewtonRaphsonSim';
import SecantSim from './SecantSim';
import { tabBtnStyle } from './shared';

interface OpenMethodsSimProps {
  defaultMethod?: 'punto-fijo' | 'newton-raphson' | 'secante';
  defaultExpr?: string;
  defaultX0?: string;
  defaultX1?: string;
  defaultEs?: string;
  defaultImax?: string;
}

export default function OpenMethodsSim({
  defaultMethod = 'punto-fijo',
  defaultExpr,
  defaultX0,
  defaultX1,
  defaultEs,
  defaultImax,
}: OpenMethodsSimProps) {
  const [method, setMethod] = useState<'punto-fijo' | 'newton-raphson' | 'secante'>(defaultMethod);

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
          style={tabBtnStyle(method === 'punto-fijo')}
          onClick={() => setMethod('punto-fijo')}
        >
          Iteración de Punto Fijo
        </button>
        <button
          style={tabBtnStyle(method === 'newton-raphson')}
          onClick={() => setMethod('newton-raphson')}
        >
          Newton-Raphson
        </button>
        <button
          style={tabBtnStyle(method === 'secante')}
          onClick={() => setMethod('secante')}
        >
          Método de la Secante
        </button>
      </div>

      {/* Render selected simulation */}
      {method === 'punto-fijo' && (
        <FixedPointSim
          defaultExpr={defaultExpr}
          defaultX0={defaultX0}
          defaultEs={defaultEs}
          defaultImax={defaultImax}
        />
      )}
      {method === 'newton-raphson' && (
        <NewtonRaphsonSim
          defaultExpr={defaultExpr}
          defaultX0={defaultX0}
          defaultEs={defaultEs}
          defaultImax={defaultImax}
        />
      )}
      {method === 'secante' && (
        <SecantSim
          defaultExpr={defaultExpr}
          defaultX0={defaultX0}
          defaultX1={defaultX1}
          defaultEs={defaultEs}
          defaultImax={defaultImax}
        />
      )}
    </div>
  );
}
