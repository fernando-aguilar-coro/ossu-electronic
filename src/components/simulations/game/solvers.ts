import { Level, Projectile, IterationStep } from './types';
import { evalObjective } from './physics';

export type SolverMethod = 'bisection' | 'false_position' | 'secant';

export interface SolverResult {
  steps: IterationStep[];
  root: number | null;
  errorMsg: string | null;
}

export function solveRoot(
  method: SolverMethod,
  level: Level,
  projectile: Projectile,
  paramA: number, // xa for bracket / x0 for secant
  paramB: number, // xb for bracket / x1 for secant
  tol: number,
  maxIter: number = 20
): SolverResult {
  const steps: IterationStep[] = [];
  
  if (method === 'bisection') {
    let a = paramA;
    let b = paramB;
    const fA = evalObjective(a, level, projectile);
    const fB = evalObjective(b, level, projectile);

    if (fA * fB > 0) {
      return {
        steps: [],
        root: null,
        errorMsg: `f(a) y f(b) deben tener signos opuestos para encerrar una raíz.\nf(${a}°) = ${fA.toFixed(4)}, f(${b}°) = ${fB.toFixed(4)}`,
      };
    }

    let prevMid = 0;
    for (let i = 1; i <= maxIter; i++) {
      const mid = (a + b) / 2;
      const fM = evalObjective(mid, level, projectile);
      const curFA = evalObjective(a, level, projectile);
      const curFB = evalObjective(b, level, projectile);
      const err = i === 1 ? 100 : Math.abs((mid - prevMid) / mid) * 100;

      steps.push({
        step: i,
        thetaA: a,
        thetaB: b,
        thetaM: mid,
        fA: curFA,
        fB: curFB,
        fM: fM,
        error: err,
      });

      if (Math.abs(fM) < 1e-5 || err < tol) {
        return { steps, root: mid, errorMsg: null };
      }

      if (curFA * fM < 0) {
        b = mid;
      } else {
        a = mid;
      }
      prevMid = mid;
    }
    return { steps, root: prevMid, errorMsg: null };
  } 
  
  if (method === 'false_position') {
    let a = paramA;
    let b = paramB;
    let fA = evalObjective(a, level, projectile);
    let fB = evalObjective(b, level, projectile);

    if (fA * fB > 0) {
      return {
        steps: [],
        root: null,
        errorMsg: `f(a) y f(b) deben tener signos opuestos.\nf(${a}°) = ${fA.toFixed(4)}, f(${b}°) = ${fB.toFixed(4)}`,
      };
    }

    let prevRoot = 0;
    for (let i = 1; i <= maxIter; i++) {
      // Formula for False Position root estimate:
      // xr = b - (f(b) * (a - b)) / (f(a) - f(b))
      const fA_val = evalObjective(a, level, projectile);
      const fB_val = evalObjective(b, level, projectile);
      const xr = b - (fB_val * (a - b)) / (fA_val - fB_val);
      const fM = evalObjective(xr, level, projectile);
      const err = i === 1 ? 100 : Math.abs((xr - prevRoot) / xr) * 100;

      steps.push({
        step: i,
        thetaA: a,
        thetaB: b,
        thetaM: xr,
        fA: fA_val,
        fB: fB_val,
        fM: fM,
        error: err,
      });

      if (Math.abs(fM) < 1e-5 || err < tol) {
        return { steps, root: xr, errorMsg: null };
      }

      if (fA_val * fM < 0) {
        b = xr;
      } else {
        a = xr;
      }
      prevRoot = xr;
    }
    return { steps, root: prevRoot, errorMsg: null };
  }

  if (method === 'secant') {
    // Secant Method: doesn't require bracketing, but needs two initial guesses x0 and x1
    let x0 = paramA;
    let x1 = paramB;
    
    for (let i = 1; i <= maxIter; i++) {
      const f0 = evalObjective(x0, level, projectile);
      const f1 = evalObjective(x1, level, projectile);

      if (Math.abs(f1 - f0) < 1e-8) {
        return {
          steps,
          root: null,
          errorMsg: `División por cero en el Método de la Secante (f(x1) - f(x0) ~ 0).`,
        };
      }

      // Formula: x_next = x1 - f(x1) * (x1 - x0) / (f(x1) - f(x0))
      const xNext = x1 - (f1 * (x1 - x0)) / (f1 - f0);
      const fNext = evalObjective(xNext, level, projectile);
      const err = Math.abs((xNext - x1) / xNext) * 100;

      steps.push({
        step: i,
        thetaA: x0,
        thetaB: x1,
        thetaM: xNext,
        fA: f0,
        fB: f1,
        fM: fNext,
        error: err,
      });

      if (Math.abs(fNext) < 1e-5 || err < tol) {
        return { steps, root: xNext, errorMsg: null };
      }

      x0 = x1;
      x1 = xNext;
    }
    return { steps, root: x1, errorMsg: null };
  }

  return { steps: [], root: null, errorMsg: 'Método desconocido' };
}
