import { evalFn } from './mathUtils';

export interface Iteration {
  i: number;
  xl: number;
  xu: number;
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
  xl0: number,
  xu0: number,
  es: number,
  imax: number
): Iteration[] {
  const iters: Iteration[] = [];
  let xl = xl0, xu = xu0;
  let fxl = evalFn(expr, xl);
  let fxu = evalFn(expr, xu);

  if (isNaN(fxl) || isNaN(fxu)) {
    throw new Error('La función no se pudo evaluar en los límites del intervalo.');
  }

  if (fxl * fxu > 0) {
    throw new Error('f(xl) y f(xu) tienen el mismo signo — no hay cambio de signo en el intervalo.');
  }

  let xr_prev: number | null = null;

  for (let i = 1; i <= imax; i++) {
    let xr = 0;
    if (method === 'biseccion') {
      xr = (xl + xu) / 2;
    } else {
      const denom = fxu - fxl;
      if (Math.abs(denom) < 1e-15) {
        throw new Error('División por cero detectada: f(xl) y f(xu) son prácticamente iguales.');
      }
      xr = xu - (fxu * (xu - xl)) / denom;
    }

    const fxr = evalFn(expr, xr);
    if (isNaN(fxr)) {
      throw new Error(`La función retornó NaN al evaluarse en xr = ${xr}`);
    }

    const ea = xr_prev !== null && xr !== 0 ? Math.abs((xr - xr_prev) / xr) * 100 : null;

    iters.push({ i, xl, xu, xr, fxr, ea });

    if (ea !== null && ea < es) break;

    const prod = fxl * fxr;
    if (prod < 0) {
      xu = xr;
      fxu = fxr;
    } else if (prod > 0) {
      xl = xr;
      fxl = fxr;
    } else {
      break; // Raíz exacta encontrada
    }

    xr_prev = xr;
  }
  return iters;
}
