import React from 'react';
import { Card } from './Card';

interface SimulationTableProps {
  title?: string;
  minWidth?: string | number;
  headers: React.ReactNode[];
  children: React.ReactNode;
}

export function SimulationTable({ title = 'Historial de Iteraciones calculadas', minWidth = '680px', headers, children }: SimulationTableProps) {
  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ifm-toc-border-color)', fontWeight: 700, fontSize: 14 }}>
        {title}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ display: 'table', margin: 0, borderRadius: 0, border: 'none', width: '100%', minWidth, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--ifm-background-color)' }}>
              {headers.map((h, idx) => (
                <th key={idx} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap', color: 'var(--ifm-color-primary)', borderBottom: '1px solid var(--ifm-toc-border-color)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Card>
  );
}
