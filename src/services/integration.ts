import { evalFn } from './mathUtils';

/**
 * Evaluates the composite Trapezoidal Rule.
 * Integral = h/2 * [f(a) + 2*sum(f(x_i)) + f(b)]
 */
export function runTrapezoidal(expr: string, a: number, b: number, n: number): number {
  if (n < 1) return NaN;
  const h = (b - a) / n;
  let sum = 0.5 * (evalFn(expr, a) + evalFn(expr, b));
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += evalFn(expr, x);
  }
  
  return sum * h;
}

/**
 * Evaluates the composite Simpson's 1/3 Rule.
 * n must be even.
 * Integral = h/3 * [f(a) + 4*sum(f(x_odd)) + 2*sum(f(x_even)) + f(b)]
 */
export function runSimpson13(expr: string, a: number, b: number, n: number): number {
  if (n < 2) return NaN;
  // Ensure n is even. If not, use n - 1 or throw.
  if (n % 2 !== 0) {
    n = n - 1; // Fallback to nearest even number
  }
  
  const h = (b - a) / n;
  let sum = evalFn(expr, a) + evalFn(expr, b);
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = evalFn(expr, x);
    if (i % 2 !== 0) {
      sum += 4 * fx;
    } else {
      sum += 2 * fx;
    }
  }
  
  return (h / 3) * sum;
}

/**
 * Evaluates the composite Simpson's 3/8 Rule.
 * n must be a multiple of 3.
 * Integral = 3h/8 * [f(a) + 3*sum(f(x_not_3)) + 2*sum(f(x_3)) + f(b)]
 */
export function runSimpson38(expr: string, a: number, b: number, n: number): number {
  if (n < 3) return NaN;
  // Ensure n is a multiple of 3. If not, fallback to nearest multiple of 3.
  if (n % 3 !== 0) {
    n = n - (n % 3);
  }
  
  const h = (b - a) / n;
  let sum = evalFn(expr, a) + evalFn(expr, b);
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = evalFn(expr, x);
    if (i % 3 === 0) {
      sum += 2 * fx;
    } else {
      sum += 3 * fx;
    }
  }
  
  return ((3 * h) / 8) * sum;
}

/**
 * High resolution numerical integration to serve as the exact/reference analytical value.
 * Uses Simpson's 1/3 rule with 10,000 subdivisions.
 */
export function runExactIntegral(expr: string, a: number, b: number): number {
  const steps = 10000;
  const h = (b - a) / steps;
  let sum = evalFn(expr, a) + evalFn(expr, b);
  
  for (let i = 1; i < steps; i++) {
    const x = a + i * h;
    const fx = evalFn(expr, x);
    if (i % 2 !== 0) {
      sum += 4 * fx;
    } else {
      sum += 2 * fx;
    }
  }
  
  return (h / 3) * sum;
}
