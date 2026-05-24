import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: string | number;
}

export function Card({ children, style, padding = '20px 24px', ...props }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--ifm-card-background-color, var(--ifm-background-surface-color))',
        border: '1px solid var(--ifm-toc-border-color)',
        borderRadius: 14,
        padding,
        marginBottom: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
