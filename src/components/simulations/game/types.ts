export interface Projectile {
  id: string;
  name: string;
  mass: number;
  friction: number;
  color: string;
  description: string;
}

export interface Level {
  id: number;
  name: string;
  h: number;          // Initial height (m)
  targetX: number;    // Target X position (m)
  targetY: number;    // Target Y position (m)
  targetRadius: number; // Target radius (m)
  gravity: number;    // gravity (m/s^2)
  wind: number;       // Horizontal constant force (N)
  v0: number;         // Launch velocity (m/s)
  obstacleX?: number;
  obstacleY?: number;
  obstacleW?: number;
  obstacleH?: number;
  description: string;
  allowedProjectiles: string[]; // IDs of allowed projectiles
}

export interface IterationStep {
  step: number;
  thetaA: number;
  thetaB: number;
  thetaM: number;
  fA: number;
  fB: number;
  fM: number;
  error: number;
}
