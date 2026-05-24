import * as math from 'mathjs';

/**
 * Safe mathematical expression evaluator.
 * Uses mathjs to parse and evaluate mathematical expressions safely.
 * Handles cases like mathjs Units or custom types by converting to standard numbers.
 */
export function evalFn(expr: string, x: number): number {
  if (!expr || expr.trim() === '') return NaN;
  try {
    // math.evaluate evaluates expression with x as local variable
    const res = math.evaluate(expr, { x });
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
  try {
    const derivNode = math.derivative(expr, 'x');
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
        const fPlus = evalFn(expr, x + h);
        const fMinus = evalFn(expr, x - h);
        if (isNaN(fPlus) || isNaN(fMinus)) return NaN;
        return (fPlus - fMinus) / (2 * h);
      }
    };
  }
}
