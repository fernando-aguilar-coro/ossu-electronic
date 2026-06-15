import { Level, Projectile } from './types';

// Compute the analytical position of the projectile at a given time t
export function getAnalyticalPos(
  t: number,
  thetaDeg: number,
  level: Level,
  projectile: Projectile
): { x: number; y: number } {
  const m = projectile.mass;
  const b = projectile.friction;
  const g = level.gravity;
  const v0 = level.v0;
  const h = level.h;
  const W = level.wind; // Wind force (N)

  const gamma = b / m;
  const rad = (thetaDeg * Math.PI) / 180;
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);

  // x(t) = (v0x - W/b) * (1 - e^(-gamma*t))/gamma + (W/b)*t
  const termX = 1 - Math.exp(-gamma * t);
  const x = (v0x - W / b) * (termX / gamma) + (W / b) * t;

  // y(t) = h + 1/gamma * (v0y + g/gamma) * (1 - e^(-gamma*t)) - (g/gamma)*t
  const y = h + (1 / gamma) * (v0y + g / gamma) * termX - (g / gamma) * t;

  return { x, y };
}

// Evaluate the objective function for theta: f(theta) = y(x_T) - y_T
// Used by root solvers to find the angle theta to hit the target.
export function evalObjective(
  thetaDeg: number,
  level: Level,
  projectile: Projectile
): number {
  const m = projectile.mass;
  const b = projectile.friction;
  const g = level.gravity;
  const v0 = level.v0;
  const h = level.h;
  const W = level.wind;
  const targetX = level.targetX;
  const targetY = level.targetY;

  const gamma = b / m;
  const rad = (thetaDeg * Math.PI) / 180;
  const cosVal = Math.cos(rad);
  const v0x = v0 * Math.cos(rad);

  // We need to find the time t_T when x(t_T) = targetX.
  // When W = 0, we can solve t_T analytically:
  // x_T = (v0x / gamma) * (1 - e^(-gamma * t)) => t_T = -1/gamma * ln(1 - (gamma * x_T)/v0x)
  // When W != 0, x(t) is transcendental. We can solve for t_T numerically!
  let tT = 0;
  if (Math.abs(W) < 1e-6) {
    const term = (gamma * targetX) / v0x;
    if (term >= 1) return -99999; // Can't reach target distance
    tT = -Math.log(1 - term) / gamma;
  } else {
    // Solve x(t) = targetX using simple Newton's method for time of flight
    let t = 1.0; // initial guess
    for (let i = 0; i < 15; i++) {
      const expTerm = Math.exp(-gamma * t);
      const fx = (v0x - W / b) * ((1 - expTerm) / gamma) + (W / b) * t - targetX;
      const dfx = (v0x - W / b) * expTerm + W / b;
      if (Math.abs(dfx) < 1e-6) break;
      const nextT = t - fx / dfx;
      if (nextT < 0) break;
      t = nextT;
    }
    tT = t;
    
    // Check if the final position actually reached targetX
    const finalX = (v0x - W / b) * ((1 - Math.exp(-gamma * tT)) / gamma) + (W / b) * tT;
    if (Math.abs(finalX - targetX) > 0.1) {
      return -99999; // Unreachable
    }
  }

  // y(t_T) - targetY
  const pos = getAnalyticalPos(tT, thetaDeg, level, projectile);
  return pos.y - targetY;
}

// Solve trajectory using Runge-Kutta 4 (RK4) for educational demonstration
export function getRK4Trajectory(
  thetaDeg: number,
  level: Level,
  projectile: Projectile,
  maxTime: number,
  dt: number = 0.05
): { x: number; y: number }[] {
  const m = projectile.mass;
  const b = projectile.friction;
  const g = level.gravity;
  const v0 = level.v0;
  const h = level.h;
  const W = level.wind;

  const rad = (thetaDeg * Math.PI) / 180;
  let x = 0;
  let y = h;
  let vx = v0 * Math.cos(rad);
  let vy = v0 * Math.sin(rad);

  const trail = [{ x, y }];

  const derivatives = (curVx: number, curVy: number) => {
    // ax = (-b * vx + W) / m
    // ay = -g - (b * vy) / m
    const ax = (-b * curVx + W) / m;
    const ay = -g - (b * curVy) / m;
    return { vx: curVx, vy: curVy, ax, ay };
  };

  let t = 0;
  while (t < maxTime && y >= 0 && x < 120) {
    // RK4 step
    const k1 = derivatives(vx, vy);
    
    const k2Vx = vx + 0.5 * dt * k1.ax;
    const k2Vy = vy + 0.5 * dt * k1.ay;
    const k2 = derivatives(k2Vx, k2Vy);

    const k3Vx = vx + 0.5 * dt * k2.ax;
    const k3Vy = vy + 0.5 * dt * k2.ay;
    const k3 = derivatives(k3Vx, k3Vy);

    const k4Vx = vx + dt * k3.ax;
    const k4Vy = vy + dt * k3.ay;
    const k4 = derivatives(k4Vx, k4Vy);

    // Update positions and velocities
    x += (dt / 6) * (k1.vx + 2 * k2.vx + 2 * k3.vx + k4.vx);
    y += (dt / 6) * (k1.vy + 2 * k2.vy + 2 * k3.vy + k4.vy);

    vx += (dt / 6) * (k1.ax + 2 * k2.ax + 2 * k3.ax + k4.ax);
    vy += (dt / 6) * (k1.ay + 2 * k2.ay + 2 * k3.ay + k4.ay);

    trail.push({ x, y });
    t += dt;
  }

  return trail;
}

// Find if a trajectory at thetaDeg collides with the level's obstacle before reaching the target
export function checkObstacleCollision(
  thetaDeg: number,
  level: Level,
  projectile: Projectile
): boolean {
  return false;
}
