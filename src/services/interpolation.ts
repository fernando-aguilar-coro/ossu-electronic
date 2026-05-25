import { evalFn } from './mathUtils';

export interface Point {
  x: number;
  y: number;
}

export interface SplineInterval {
  xMin: number;
  xMax: number;
  a: number;
  b: number;
  c: number;
  d: number;
}

/**
 * Generates equidistant nodes in the interval [a, b] for a given function expression.
 */
export function generateEquidistantNodes(expr: string, a: number, b: number, n: number): Point[] {
  const points: Point[] = [];
  if (n < 1) return points;
  for (let i = 0; i <= n; i++) {
    const x = a + (i / n) * (b - a);
    const y = evalFn(expr, x);
    if (!isNaN(y) && isFinite(y)) {
      points.push({ x, y });
    }
  }
  return points;
}

/**
 * Generates Chebyshev nodes in the interval [a, b] for a given function expression.
 */
export function generateChebyshevNodes(expr: string, a: number, b: number, n: number): Point[] {
  const points: Point[] = [];
  if (n < 1) return points;
  // Chebyshev nodes formulas: x_i = (a+b)/2 + (b-a)/2 * cos((2i+1)*pi / (2*(n+1)))
  // To have exactly n+1 points (from i = 0 to n):
  for (let i = 0; i <= n; i++) {
    const angle = ((2 * i + 1) * Math.PI) / (2 * (n + 1));
    const x = (a + b) / 2 + ((b - a) / 2) * Math.cos(angle);
    const y = evalFn(expr, x);
    if (!isNaN(y) && isFinite(y)) {
      points.push({ x, y });
    }
  }
  // Sort points by x to keep them ordered
  return points.sort((p1, p2) => p1.x - p2.x);
}

/**
 * Computes Newton's divided differences matrix.
 * Returns the sorted points and the 2D matrix of divided differences.
 */
export function runNewtonInterpolation(points: Point[]): {
  sortedPoints: Point[];
  matrix: number[][];
  evaluate: (x: number) => number;
} {
  // Sort points by x ascending
  const sortedPoints = [...points].sort((p1, p2) => p1.x - p2.x);
  const n = sortedPoints.length;

  // Initialize matrix (n x n) with 0
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  // First column is f[x_i] = y_i
  for (let i = 0; i < n; i++) {
    matrix[i][0] = sortedPoints[i].y;
  }

  // Compute divided differences
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      const numerator = matrix[i + 1][j - 1] - matrix[i][j - 1];
      const denominator = sortedPoints[i + j].x - sortedPoints[i].x;
      matrix[i][j] = denominator !== 0 ? numerator / denominator : 0;
    }
  }

  // Evaluation function
  const evaluate = (xVal: number): number => {
    if (n === 0) return NaN;
    let result = matrix[0][0];
    let productTerm = 1;
    for (let k = 1; k < n; k++) {
      productTerm *= (xVal - sortedPoints[k - 1].x);
      result += matrix[0][k] * productTerm;
    }
    return result;
  };

  return { sortedPoints, matrix, evaluate };
}

/**
 * Computes Lagrange basis polynomials and the final interpolating polynomial.
 */
export function runLagrangeInterpolation(points: Point[]): {
  sortedPoints: Point[];
  evaluate: (x: number) => number;
  getFormula: () => string;
} {
  const sortedPoints = [...points].sort((p1, p2) => p1.x - p2.x);
  const n = sortedPoints.length;

  const evaluate = (xVal: number): number => {
    if (n === 0) return NaN;
    let totalSum = 0;
    for (let i = 0; i < n; i++) {
      let term = sortedPoints[i].y;
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const denom = sortedPoints[i].x - sortedPoints[j].x;
          term *= denom !== 0 ? (xVal - sortedPoints[j].x) / denom : 0;
        }
      }
      totalSum += term;
    }
    return totalSum;
  };

  const getFormula = (): string => {
    if (n === 0) return 'P_0(x) = 0';
    let formula = 'P_n(x) = ';
    const terms: string[] = [];
    for (let i = 0; i < n; i++) {
      const xi = sortedPoints[i].x.toFixed(2);
      const yi = sortedPoints[i].y.toFixed(2);
      let basisStr = '';
      const numTerms: string[] = [];
      const denTerms: string[] = [];
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const xj = sortedPoints[j].x.toFixed(2);
          numTerms.push(`(x - ${xj})`);
          denTerms.push(`(${xi} - ${xj})`);
        }
      }
      if (numTerms.length > 0) {
        basisStr = `\\left[ \\frac{${numTerms.join(' \\cdot ')}}{${denTerms.join(' \\cdot ')}} \\right]`;
      } else {
        basisStr = '1';
      }
      terms.push(`${yi} \\cdot ${basisStr}`);
    }
    formula += terms.join(' + ');
    return formula;
  };

  return { sortedPoints, evaluate, getFormula };
}

/**
 * Computes Natural Cubic Spline coefficients.
 */
export function runCubicSplineInterpolation(points: Point[]): {
  sortedPoints: Point[];
  intervals: SplineInterval[];
  evaluate: (x: number) => number;
} {
  const sortedPoints = [...points].sort((p1, p2) => p1.x - p2.x);
  const n = sortedPoints.length - 1; // Number of intervals
  const intervals: SplineInterval[] = [];

  if (n < 1) {
    return {
      sortedPoints,
      intervals,
      evaluate: () => NaN,
    };
  }

  // Special case: 2 points (1 interval) -> linear interpolation
  if (n === 1) {
    const x0 = sortedPoints[0].x;
    const x1 = sortedPoints[1].x;
    const y0 = sortedPoints[0].y;
    const y1 = sortedPoints[1].y;
    const slope = x1 !== x0 ? (y1 - y0) / (x1 - x0) : 0;
    
    // Expressed as cubic: S_0(x) = y0 + slope*(x-x0) + 0*(x-x0)^2 + 0*(x-x0)^3
    intervals.push({
      xMin: x0,
      xMax: x1,
      a: y0,
      b: slope,
      c: 0,
      d: 0
    });

    const evaluate = (xVal: number): number => {
      if (xVal < x0) return y0 + slope * (xVal - x0);
      return y0 + slope * (xVal - x0);
    };

    return { sortedPoints, intervals, evaluate };
  }

  // Calculate interval step sizes h_i = x_{i+1} - x_i
  const h: number[] = [];
  for (let i = 0; i < n; i++) {
    h.push(sortedPoints[i + 1].x - sortedPoints[i].x);
  }

  // Solve for moments M_i = S''(_i) using Thomas Algorithm
  // Natural spline boundary conditions: M_0 = M_n = 0
  const M: number[] = new Array(n + 1).fill(0);

  // Setup tridiagonal system for i = 1 to n-1
  // A_i * M_{i-1} + B_i * M_i + C_i * M_{i+1} = D_i
  const A: number[] = new Array(n).fill(0);
  const B: number[] = new Array(n).fill(0);
  const C: number[] = new Array(n).fill(0);
  const D: number[] = new Array(n).fill(0);

  for (let i = 1; i < n; i++) {
    A[i] = h[i - 1];
    B[i] = 2 * (h[i - 1] + h[i]);
    C[i] = h[i];
    
    const term1 = (sortedPoints[i + 1].y - sortedPoints[i].y) / h[i];
    const term2 = (sortedPoints[i].y - sortedPoints[i - 1].y) / h[i - 1];
    D[i] = 6 * (term1 - term2);
  }

  // Thomas Algorithm Solver
  const cp: number[] = new Array(n).fill(0);
  const dp: number[] = new Array(n).fill(0);

  if (n > 1) {
    cp[1] = C[1] / B[1];
    dp[1] = D[1] / B[1];

    for (let i = 2; i < n; i++) {
      const denom = B[i] - A[i] * cp[i - 1];
      cp[i] = C[i] / denom;
      dp[i] = (D[i] - A[i] * dp[i - 1]) / denom;
    }

    // Backward substitution
    M[n - 1] = dp[n - 1];
    for (let i = n - 2; i >= 1; i--) {
      M[i] = dp[i] - cp[i] * M[i + 1];
    }
  }

  // Compute coefficients for each interval
  for (let i = 0; i < n; i++) {
    const a = sortedPoints[i].y;
    const hi = h[i];
    const c = M[i] / 2;
    const d = (M[i + 1] - M[i]) / (6 * hi);
    const b = (sortedPoints[i + 1].y - sortedPoints[i].y) / hi - (hi * (2 * M[i] + M[i + 1])) / 6;

    intervals.push({
      xMin: sortedPoints[i].x,
      xMax: sortedPoints[i + 1].x,
      a,
      b,
      c,
      d
    });
  }

  const evaluate = (xVal: number): number => {
    // If out of bounds on the left, use the first spline
    if (xVal < sortedPoints[0].x) {
      const first = intervals[0];
      const dx = xVal - first.xMin;
      return first.a + first.b * dx + first.c * dx * dx + first.d * dx * dx * dx;
    }
    // If out of bounds on the right, use the last spline
    if (xVal > sortedPoints[n].x) {
      const last = intervals[n - 1];
      const dx = xVal - last.xMin;
      return last.a + last.b * dx + last.c * dx * dx + last.d * dx * dx * dx;
    }

    // Find correct interval
    for (let i = 0; i < n; i++) {
      const interval = intervals[i];
      if (xVal >= interval.xMin && xVal <= interval.xMax) {
        const dx = xVal - interval.xMin;
        return interval.a + interval.b * dx + interval.c * dx * dx + interval.d * dx * dx * dx;
      }
    }
    return NaN;
  };

  return { sortedPoints, intervals, evaluate };
}
