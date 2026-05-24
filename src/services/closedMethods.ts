import { evalFn } from './mathUtils';

export interface Iteration {
  i: number;
  xa: number;
  xb: number;
  xr: number;
  fxr: number;
  ea: number | null;
}

/**
 * Runs closed methods (Bisection or False Position) for root-finding.
 * Throws errors if evaluation fails or sign change condition is not met.
 */
export function runClosedMethod(
  method: 'biseccion' | 'falsa-posicion',
  expr: string,
  xa0: number,
  xb0: number,
  es: number,
  imax: number
): Iteration[] {
  const iters: Iteration[] = [];
  let xa = xa0, xb = xb0;
  let fxa = evalFn(expr, xa);
  let fxb = evalFn(expr, xb);

  if (isNaN(fxa) || isNaN(fxb)) {
    throw new Error('La función no se pudo evaluar en los límites del intervalo.');
  }

  if (fxa * fxb > 0) {
    throw new Error('f(xa) y f(xb) tienen el mismo signo — no hay cambio de signo en el intervalo.');
  }

  let xr_prev: number | null = null;

  for (let i = 1; i <= imax; i++) {
    let xr = 0;
    if (method === 'biseccion') {
      xr = (xa + xb) / 2;
    } else {
      const denom = fxb - fxa;
      if (Math.abs(denom) < 1e-15) {
        throw new Error('División por cero detectada: f(xa) y f(xb) son prácticamente iguales.');
      }
      xr = xb - (fxb * (xb - xa)) / denom;
    }

    const fxr = evalFn(expr, xr);
    if (isNaN(fxr)) {
      throw new Error(`La función retornó NaN al evaluarse en xr = ${xr}`);
    }

    const ea = xr_prev !== null && xr !== 0 ? Math.abs((xr - xr_prev) / xr) * 100 : null;

    iters.push({ i, xa, xb, xr, fxr, ea });

    if (ea !== null && ea < es) break;

    const prod = fxa * fxr;
    if (prod < 0) {
      xb = xr;
      fxb = fxr;
    } else if (prod > 0) {
      xa = xr;
      fxa = fxr;
    } else {
      break; // Raíz exacta encontrada
    }

    xr_prev = xr;
  }
  return iters;
}
