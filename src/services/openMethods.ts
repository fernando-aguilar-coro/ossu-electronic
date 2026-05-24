import { evalFn, getDerivative } from './mathUtils';

export interface OpenIteration {
  i: number;
  xi: number;
  xNext: number;
  ea: number | null;
  // Newton specific
  fxi?: number;
  dfxi?: number;
  // Secant specific
  xiPrev?: number;
  fxiPrev?: number;
  fxiCurr?: number;
}

/**
 * Runs open methods (Fixed Point, Newton-Raphson, or Secant) for root-finding.
 * Throws errors if divergence is detected or evaluation fails.
 */
export function runOpenMethod(
  method: 'punto-fijo' | 'newton-raphson' | 'secante',
  expr: string,
  x0: number,
  x1: number,
  es: number,
  imax: number,
  derivExprManual?: string
): OpenIteration[] {
  const iters: OpenIteration[] = [];

  if (method === 'punto-fijo') {
    let xCurr = x0;
    for (let i = 1; i <= imax; i++) {
      const xNext = evalFn(expr, xCurr);
      if (isNaN(xNext) || !isFinite(xNext)) {
        throw new Error(`Divergencia o error de evaluación: g(x) = NaN o infinito en x = ${xCurr}`);
      }
      const ea = i > 1 && xNext !== 0 ? Math.abs((xNext - xCurr) / xNext) * 100 : null;

      iters.push({ i, xi: xCurr, xNext, ea });

      if (ea !== null && ea < es) break;
      if (Math.abs(xNext) > 1e10) {
        throw new Error(`Divergencia detectada: los valores de x están creciendo descontroladamente (|x| > 10¹⁰).`);
      }

      xCurr = xNext;
    }
  } else if (method === 'newton-raphson') {
    // Determine derivative function
    let evalDeriv: (x: number) => number;
    if (derivExprManual && derivExprManual.trim() !== '') {
      evalDeriv = (xVal: number) => evalFn(derivExprManual, xVal);
    } else {
      const derivInfo = getDerivative(expr);
      evalDeriv = derivInfo.evalDeriv;
    }

    let xCurr = x0;
    for (let i = 1; i <= imax; i++) {
      const fx = evalFn(expr, xCurr);
      const dfx = evalDeriv(xCurr);

      if (isNaN(fx) || isNaN(dfx)) {
        throw new Error(`Error de evaluación: f(x) o f'(x) no se pudieron evaluar en x = ${xCurr}`);
      }
      if (Math.abs(dfx) < 1e-15) {
        throw new Error(`Derivada casi nula detectada en x = ${xCurr} (|f'(x)| = ${dfx.toExponential(2)}). División por cero.`);
      }

      const xNext = xCurr - fx / dfx;
      const ea = i > 1 && xNext !== 0 ? Math.abs((xNext - xCurr) / xNext) * 100 : null;

      iters.push({ i, xi: xCurr, xNext, ea, fxi: fx, dfxi: dfx });

      if (ea !== null && ea < es) break;
      if (Math.abs(xNext) > 1e10) {
        throw new Error(`Divergencia detectada: los valores de x están creciendo descontroladamente.`);
      }

      xCurr = xNext;
    }
  } else {
    // Secante
    let xPrev = x0;
    let xCurr = x1;
    let fPrev = evalFn(expr, xPrev);
    let fCurr = evalFn(expr, xCurr);

    if (isNaN(fPrev) || isNaN(fCurr)) {
      throw new Error('La función no se pudo evaluar en los puntos iniciales x0 o x1.');
    }

    for (let i = 1; i <= imax; i++) {
      const denom = fCurr - fPrev;
      if (Math.abs(denom) < 1e-15) {
        throw new Error(`Pendiente de secante nula: f(xi) y f(xi-1) son virtualmente idénticos (${fCurr}) en la iteración ${i}.`);
      }

      const xNext = xCurr - (fCurr * (xCurr - xPrev)) / denom;
      const ea = xNext !== 0 ? Math.abs((xNext - xCurr) / xNext) * 100 : null;

      iters.push({
        i,
        xi: xCurr,
        xNext,
        ea,
        xiPrev: xPrev,
        fxiPrev: fPrev,
        fxiCurr: fCurr
      });

      if (ea !== null && ea < es) break;
      if (Math.abs(xNext) > 1e10) {
        throw new Error(`Divergencia detectada: los valores de x están creciendo descontroladamente.`);
      }

      xPrev = xCurr;
      fPrev = fCurr;
      xCurr = xNext;
      fCurr = evalFn(expr, xNext);
    }
  }

  return iters;
}
