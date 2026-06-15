import * as math from 'mathjs';

/**
 * Safe mathematical expression evaluator.
 * Uses mathjs to parse and evaluate mathematical expressions safely.
 * Handles cases like mathjs Units or custom types by converting to standard numbers.
 */
export function evalFn(expr: string, x: number): number {
  if (!expr || expr.trim() === '') return NaN;
  try {
    // Normalize JS/Python exponentiation (x**3) to math.js standard (x^3)
    const normalized = expr.replace(/\*\*/g, '^');
    // math.evaluate evaluates expression with x as local variable
    const res = math.evaluate(normalized, { x });
    if (typeof res === 'number') {
      return res;
    }
    if (res && typeof res.toNumber === 'function') {
      return res.toNumber();
    }
    return Number(res);
  } catch (err) {
    return NaN;
  }
}

/**
 * Calculates the derivative of an expression with respect to x.
 * Attempts symbolic differentiation first using mathjs.
 * Falls back to numerical central difference if symbolic fails.
 */
export function getDerivative(expr: string): { exprStr: string; evalDeriv: (x: number) => number } {
  const normalized = expr ? expr.replace(/\*\*/g, '^') : '';
  try {
    const derivNode = math.derivative(normalized, 'x');
    const exprStr = derivNode.toString();
    const evalDeriv = (x: number): number => {
      try {
        const res = derivNode.evaluate({ x });
        return typeof res === 'number' ? res : Number(res);
      } catch {
        return NaN;
      }
    };
    return { exprStr, evalDeriv };
  } catch (err) {
    // Fallback: central finite difference numerical derivative
    const h = 1e-7;
    return {
      exprStr: `d/dx (${expr}) [Aprox. Numérica]`,
      evalDeriv: (x: number): number => {
        const fPlus = evalFn(normalized, x + h);
        const fMinus = evalFn(normalized, x - h);
        if (isNaN(fPlus) || isNaN(fMinus)) return NaN;
        return (fPlus - fMinus) / (2 * h);
      }
    };
  }
}

/**
 * Returns the LaTeX representation of a mathjs expression string.
 */
export function getLaTeX(expr: string): string {
  if (!expr || expr.trim() === '') return '';
  try {
    const normalized = expr.replace(/\*\*/g, '^');
    return math.parse(normalized).toTex();
  } catch {
    return '';
  }
}

