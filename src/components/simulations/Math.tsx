import React from 'react';
import katex from 'katex';

interface MathProps {
  children: string;
  displayMode?: boolean;
}

export function Math({ children, displayMode = false }: MathProps) {
  if (typeof children !== 'string') {
    return <span>{children}</span>;
  }

  try {
    const html = katex.renderToString(children, {
      throwOnError: false,
      displayMode,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (e) {
    console.error('Error rendering KaTeX:', e);
    return <span>{children}</span>;
  }
}
