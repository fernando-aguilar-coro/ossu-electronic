import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: string | number;
}

export function Card({ children, style, padding = '20px 24px', ...props }: CardProps) {
  return (
    <div
      className="sim-card"
      style={{
        padding,
        marginBottom: 16,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
