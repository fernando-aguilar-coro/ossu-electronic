/**
 * Servicios de Métodos Numéricos Puros
 * Centraliza la lógica matemática pura e integradores numéricos fuera de los componentes React.
 */

// ── 1. SOLUCIONADOR DE CIRCUITOS ELÉCTRICOS LINEALES (Kirchhoff) ────────────────
export interface CircuitNode {
  id: number;
  isFixed: boolean;
  voltage: number;
  name: string;
  x: number;
  y: number;
}

export interface CircuitBranch {
  id: number;
  from: number;
  to: number;
  type: 'resistor' | 'currentSource';
  resistance: number;    // en Ohmios, conductancia G = 1/R
  currentValue: number;  // en Amperios, fluye de 'from' a 'to'
}

/**
 * Resuelve un paso de simulación para un circuito resistivo lineal con fuentes de corriente y tensión.
 * Ensambla la matriz de conductancias A y el vector de corrientes b en A * V = b,
 * y resuelve usando Eliminación de Gauss-Jordan (directo), Jacobi o Gauss-Seidel (iterativo).
 */
export function solveCircuit(
  nodes: CircuitNode[],
  branches: CircuitBranch[],
  method: 'gauss' | 'gauss-seidel' | 'jacobi'
): {
  nextVoltages: number[];
  maxDiff: number;
  matrixA: number[][];
  vectorB: number[];
  varNodeIds: number[];
} {
  const varNodes = nodes.filter(n => !n.isFixed);
  const m = varNodes.length;
  const nextVoltages = nodes.map(n => n.voltage);

  if (m === 0) {
    return { nextVoltages, maxDiff: 0, matrixA: [], vectorB: [], varNodeIds: [] };
  }

  // 1. Inicializar matriz A y vector B
  const matrixA: number[][] = Array.from({ length: m }, () => new Array(m).fill(0));
  const vectorB: number[] = new Array(m).fill(0);
  const varNodeIds = varNodes.map(n => n.id);

  const getVarIndex = (id: number) => varNodeIds.indexOf(id);

  // 2. Ensamblar ecuaciones de Nodos (KCL)
  for (let r = 0; r < m; r++) {
    const u = varNodes[r];
    let sumG = 0;
    let sumRHS = 0;

    branches.forEach(branch => {
      if (branch.type === 'resistor') {
        const G = 1.0 / Math.max(0.01, branch.resistance);
        if (branch.from === u.id) {
          sumG += G;
          const neighbor = nodes.find(n => n.id === branch.to);
          if (neighbor) {
            if (neighbor.isFixed) {
              sumRHS += G * neighbor.voltage;
            } else {
              const c = getVarIndex(neighbor.id);
              if (c !== -1) {
                matrixA[r][c] -= G;
              }
            }
          }
        } else if (branch.to === u.id) {
          sumG += G;
          const neighbor = nodes.find(n => n.id === branch.from);
          if (neighbor) {
            if (neighbor.isFixed) {
              sumRHS += G * neighbor.voltage;
            } else {
              const c = getVarIndex(neighbor.id);
              if (c !== -1) {
                matrixA[r][c] -= G;
              }
            }
          }
        }
      } else if (branch.type === 'currentSource') {
        // Fuente de corriente fluye de 'from' a 'to'
        // Si sale de u: aporta +I_s al LHS -> -I_s al RHS
        // Si entra a u: aporta -I_s al LHS -> +I_s al RHS
        if (branch.from === u.id) {
          sumRHS -= branch.currentValue;
        } else if (branch.to === u.id) {
          sumRHS += branch.currentValue;
        }
      }
    });

    matrixA[r][r] = sumG;
    vectorB[r] = sumRHS;
  }

  // 3. Resolver
  let maxDiff = 0;

  if (method === 'gauss') {
    const solution = solveGaussJordan(matrixA, vectorB);
    for (let r = 0; r < m; r++) {
      const u = varNodes[r];
      const nodeIdx = nodes.findIndex(n => n.id === u.id);
      if (nodeIdx !== -1) {
        const oldVal = nodes[nodeIdx].voltage;
        const newVal = solution[r];
        nextVoltages[nodeIdx] = newVal;
        maxDiff = Math.max(maxDiff, Math.abs(newVal - oldVal));
      }
    }
  } else if (method === 'jacobi') {
    const currentVoltages = nodes.map(n => n.voltage);
    for (let r = 0; r < m; r++) {
      const u = varNodes[r];
      const diag = matrixA[r][r];
      if (Math.abs(diag) < 1e-12) continue; // Nodo flotante aislado

      let sumOffDiag = 0;
      for (let c = 0; c < m; c++) {
        if (c !== r) {
          const neighborNodeId = varNodeIds[c];
          const neighborVolt = currentVoltages.find((v, idx) => nodes[idx].id === neighborNodeId) || 0;
          sumOffDiag += matrixA[r][c] * neighborVolt;
        }
      }

      const newVal = (vectorB[r] - sumOffDiag) / diag;
      const nodeIdx = nodes.findIndex(n => n.id === u.id);
      if (nodeIdx !== -1) {
        nextVoltages[nodeIdx] = newVal;
        maxDiff = Math.max(maxDiff, Math.abs(newVal - u.voltage));
      }
    }
  } else {
    // Gauss-Seidel
    const currentVoltages = nodes.map(n => n.voltage);
    for (let r = 0; r < m; r++) {
      const u = varNodes[r];
      const diag = matrixA[r][r];
      if (Math.abs(diag) < 1e-12) continue; // Nodo flotante aislado

      let sumOffDiag = 0;
      for (let c = 0; c < m; c++) {
        if (c !== r) {
          const neighborNodeId = varNodeIds[c];
          const neighborVoltIdx = nodes.findIndex(n => n.id === neighborNodeId);
          const neighborVolt = neighborVoltIdx !== -1 ? currentVoltages[neighborVoltIdx] : 0;
          sumOffDiag += matrixA[r][c] * neighborVolt;
        }
      }

      const newVal = (vectorB[r] - sumOffDiag) / diag;
      const nodeIdx = nodes.findIndex(n => n.id === u.id);
      if (nodeIdx !== -1) {
        maxDiff = Math.max(maxDiff, Math.abs(newVal - currentVoltages[nodeIdx]));
        currentVoltages[nodeIdx] = newVal;
      }
    }
    // Escribir de vuelta
    for (let r = 0; r < m; r++) {
      const u = varNodes[r];
      const nodeIdx = nodes.findIndex(n => n.id === u.id);
      if (nodeIdx !== -1) {
        nextVoltages[nodeIdx] = currentVoltages[nodeIdx];
      }
    }
  }

  return { nextVoltages, maxDiff, matrixA, vectorB, varNodeIds };
}

/**
 * Eliminación de Gauss-Jordan con pivoteo parcial.
 */
function solveGaussJordan(A: number[][], b: number[]): number[] {
  const n = A.length;
  const matrix = A.map(row => [...row]);
  const vec = [...b];

  for (let i = 0; i < n; i++) {
    // Pivoteo parcial
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
        maxRow = k;
      }
    }

    const tempRow = matrix[i];
    matrix[i] = matrix[maxRow];
    matrix[maxRow] = tempRow;
    const tempVal = vec[i];
    vec[i] = vec[maxRow];
    vec[maxRow] = tempVal;

    const diagVal = matrix[i][i];
    if (Math.abs(diagVal) > 1e-12) {
      for (let j = i; j < n; j++) {
        matrix[i][j] /= diagVal;
      }
      vec[i] /= diagVal;

      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = matrix[k][i];
          for (let j = i; j < n; j++) {
            matrix[k][j] -= factor * matrix[i][j];
          }
          vec[k] -= factor * vec[i];
        }
      }
    }
  }
  return vec;
}


// ── 2. SOLUCIONADOR DEL ALGORITMO PAGERANK (Método de Potencias / Jacobi) ────────
export interface WebNode {
  id: number;
  rank: number;
}

export interface WebLink {
  from: number;
  to: number;
}

export function solvePageRank(
  nodes: WebNode[],
  links: WebLink[],
  damping: number
): { nextRanks: number[]; maxDiff: number } {
  const N = nodes.length;
  if (N === 0) return { nextRanks: [], maxDiff: 0 };

  const nextRanks = new Array(N).fill(0);
  const outDegrees = new Array(N).fill(0);

  // Calcular grados de salida (out-degrees)
  links.forEach(link => {
    const idx = nodes.findIndex(n => n.id === link.from);
    if (idx !== -1) outDegrees[idx]++;
  });

  // Distribuir el rango (rank) actual a través de los enlaces
  for (let i = 0; i < N; i++) {
    const fromNode = nodes[i];
    const outDeg = outDegrees[i];

    if (outDeg === 0) {
      // Nodo sumidero (dangling node): distribuye equitativamente a todos
      for (let j = 0; j < N; j++) {
        nextRanks[j] += fromNode.rank / N;
      }
    } else {
      // Distribuye entre sus enlaces salientes
      links.forEach(link => {
        if (link.from === fromNode.id) {
          const destIdx = nodes.findIndex(n => n.id === link.to);
          if (destIdx !== -1) {
            nextRanks[destIdx] += fromNode.rank / outDeg;
          }
        }
      });
    }
  }

  // Aplicar factor de amortiguamiento d (Google Matrix Equation)
  const baseRank = (1 - damping) / N;
  let maxDiff = 0;
  const finalRanks = nextRanks.map((r, i) => {
    const newVal = baseRank + damping * r;
    maxDiff = Math.max(maxDiff, Math.abs(newVal - nodes[i].rank));
    return newVal;
  });

  return { nextRanks: finalRanks, maxDiff };
}


// ── 3. SOLUCIONADOR DEL PÉNDULO POR RUNGE-KUTTA DE 4° ORDEN (RK4) ─────────────
export interface PendulumParams {
  gravity: number;
  length: number;
  damping: number;
  mass: number;
  dt: number;
}

export function solvePendulumRK4(
  thetaCur: number,
  omegaCur: number,
  params: PendulumParams
): { theta: number; omega: number } {
  const { gravity: g, length: L, damping: b, mass: m, dt } = params;

  // Derivadas de primer orden del sistema de EDOs:
  // dTheta/dt = fTheta(theta, omega) = omega
  // dOmega/dt = fOmega(theta, omega) = -(g/L)*sin(theta) - (b/m)*omega
  const fTheta = (t: number, w: number) => w;
  const fOmega = (t: number, w: number) => -(g / L) * Math.sin(t) - (b / m) * w;

  // Pasos de Runge-Kutta 4
  const k1_t = fTheta(thetaCur, omegaCur);
  const k1_w = fOmega(thetaCur, omegaCur);

  const k2_t = fTheta(thetaCur + 0.5 * dt * k1_t, omegaCur + 0.5 * dt * k1_w);
  const k2_w = fOmega(thetaCur + 0.5 * dt * k1_t, omegaCur + 0.5 * dt * k1_w);

  const k3_t = fTheta(thetaCur + 0.5 * dt * k2_t, omegaCur + 0.5 * dt * k2_w);
  const k3_w = fOmega(thetaCur + 0.5 * dt * k2_t, omegaCur + 0.5 * dt * k2_w);

  const k4_t = fTheta(thetaCur + dt * k3_t, omegaCur + dt * k3_w);
  const k4_w = fOmega(thetaCur + dt * k3_t, omegaCur + dt * k3_w);

  let nextTheta = thetaCur + (dt / 6) * (k1_t + 2 * k2_t + 2 * k3_t + k4_t);
  let nextOmega = omegaCur + (dt / 6) * (k1_w + 2 * k2_w + 2 * k3_w + k4_w);

  // Normalizar theta dentro del rango [-PI, PI]
  if (nextTheta > Math.PI) nextTheta -= 2 * Math.PI;
  if (nextTheta < -Math.PI) nextTheta += 2 * Math.PI;

  return { theta: nextTheta, omega: nextOmega };
}
