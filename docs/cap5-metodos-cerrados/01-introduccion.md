---
id: introduccion
title: Introducción a los Métodos Cerrados
sidebar_label: Introducción
sidebar_position: 1
---

# Métodos Cerrados para Búsqueda de Raíces

## ¿Qué es una raíz?

Una **raíz** (o cero) de una función $f(x)$ es el valor $x = r$ tal que:

$$
f(r) = 0
$$

Encontrar raíces es fundamental en ingeniería: equilibrio de fuerzas, análisis de circuitos, diseño de estructuras, entre muchos otros.

## ¿Qué es un método cerrado?

Un **método cerrado** (o de bracketing) es un algoritmo que busca la raíz dentro de un **intervalo** $[a, b]$ previamente identificado, donde se garantiza que la raíz existe gracias al **Teorema de Bolzano**.

### Teorema de Bolzano (Teorema del Valor Intermedio)

Si $f$ es continua en $[a, b]$ y $f(a) \cdot f(b) < 0$, entonces existe al menos un $r \in (a, b)$ tal que $f(r) = 0$.

$$
\boxed{f(a) \cdot f(b) < 0 \implies \exists\, r \in (a,b) : f(r) = 0}
$$

Esta condición es la **garantía de convergencia** de los métodos cerrados.

## Ventajas y desventajas

| Característica | Métodos Cerrados |
|---|---|
| **Convergencia** | Garantizada (si se cumple $f(a)f(b)<0$) |
| **Velocidad** | Más lenta que métodos abiertos |
| **Requiere intervalo** | Sí, con cambio de signo |
| **Sensibilidad a la función** | Robustos ante discontinuidades |

## Métodos de este capítulo

1. **Bisección** — Divide el intervalo a la mitad en cada iteración.
2. **Falsa Posición (Regula Falsi)** — Usa interpolación lineal para estimar la raíz.

## Error aproximado porcentual

En todos los métodos iterativos se usa el **criterio de parada** basado en el error aproximado:

$$
\varepsilon_a = \left| \frac{x_r^{(nuevo)} - x_r^{(anterior)}}{x_r^{(nuevo)}} \right| \times 100\%
$$

El proceso se detiene cuando $\varepsilon_a < \varepsilon_s$ (tolerancia especificada).

Una regla práctica para garantizar al menos $n$ cifras significativas correctas:

$$
\varepsilon_s = (0.5 \times 10^{2-n})\%
$$
