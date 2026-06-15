import { Level, Projectile } from './types';

export const PROJECTILES: Projectile[] = [
  {
    id: 'classic',
    name: 'Ave Clásica (Estándar)',
    mass: 1.0,
    friction: 0.15,
    color: '#ef4444',
    description: 'Masa media, fricción media. Comportamiento equilibrado y predecible.',
  },
  {
    id: 'heavy',
    name: 'Ave de Hierro (Pesada)',
    mass: 3.0,
    friction: 0.10,
    color: '#64748b',
    description: 'Masa elevada, fricción relativa baja. Gran inercia, vuela lejos y resiste vientos fuertes.',
  },
  {
    id: 'swift',
    name: 'Ave Veloz (Aerodinámica)',
    mass: 0.6,
    friction: 0.04,
    color: '#f59e0b',
    description: 'Ligera y aerodinámica. Sale disparada a gran velocidad, pero el viento la afecta muy fácilmente.',
  },
];

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Nivel 1: Praderas Calmas',
    h: 5.0,
    targetX: 60.0,
    targetY: 2.0,
    targetRadius: 1.2,
    gravity: 9.8,
    wind: 0.0,
    v0: 30.0,
    description: 'Nivel de aprendizaje sin viento y sin obstáculos. Ideal para probar el método de bisección.',
    allowedProjectiles: ['classic', 'heavy', 'swift'],
  },
  {
    id: 2,
    name: 'Nivel 2: El Valle Huracanado',
    h: 10.0,
    targetX: 75.0,
    targetY: 5.0,
    targetRadius: 1.2,
    gravity: 9.8,
    wind: -2.5, // 2.5 N against the motion direction
    v0: 42.0,
    description: 'Viento en contra fuerte que frena al proyectil. ¡Prueba el Ave de Hierro para contrarrestar la ráfaga!',
    allowedProjectiles: ['classic', 'heavy'],
  },
  {
    id: 3,
    name: 'Nivel 3: El Abismo de Gravedad',
    h: 5.0,
    targetX: 55.0,
    targetY: 8.0,
    targetRadius: 1.2,
    gravity: 9.8,
    wind: 2.0,
    v0: 32.0,
    description: 'Viento a favor moderado. El objetivo se encuentra suspendido en el aire a 8m de altura.',
    allowedProjectiles: ['classic', 'heavy', 'swift'],
  },
];
